// Implemented Gemini API services to replace placeholder content and fix related errors.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AestheticPlan, StyleSuggestion, MakeupSuggestion, LipMesh, TemplateDetails, NineGridSuggestion, ContextualAnalysis, ActionableIntent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const MAX_RETRIES = 3;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory cache for style applications
const styleCache = new Map<string, string>();


async function apiCallWithRetry<T>(apiCall: () => Promise<T>): Promise<T> {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempt++;
            if (attempt >= MAX_RETRIES) {
                console.error(`API call failed after ${MAX_RETRIES} attempts:`, error);
                throw error;
            }

            const isRetryable = (error.message && (error.message.includes('429') || /5\d{2}/.test(error.message)));

            if (isRetryable) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`Attempt ${attempt} failed with retryable error. Retrying in ${delay.toFixed(0)}ms...`, error.message);
                await sleep(delay);
            } else {
                console.error(`API call failed with non-retryable error:`, error);
                throw error;
            }
        }
    }
    throw new Error("API call failed after all retries.");
}

const dataUrlToPart = (dataUrl: string) => {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid data URL format");
    }
    const [, mimeType, data] = match;
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
};

export const preprocessPhoto = async (photoUrl: string): Promise<string | null> => {
    try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    dataUrlToPart(photoUrl),
                    { text: "Your task is to process an image. If it contains a clear, single human face, crop it to a square centered on the face. The output must be only the cropped image. If there is no clear, single face, return the original image untouched." }
                ]
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
        }));
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return photoUrl; // Return original on failure
    } catch (error) {
        console.error("Photo preprocessing failed:", error);
        return photoUrl; // Return original on error
    }
};

const complianceSchema = {
    type: Type.OBJECT,
    properties: {
        isCompliant: { type: Type.BOOLEAN, description: "Whether the image is compliant." },
        reason: { type: Type.STRING, description: "If not compliant, provide a brief reason in Chinese." },
    },
    required: ['isCompliant'],
};

export const checkCompliance = async (photoUrl: string): Promise<{ isCompliant: boolean; reason?: string }> => {
    try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    dataUrlToPart(photoUrl),
                    { text: "As a professional medical aesthetic consultant, analyze this facial photo for its suitability for lip aesthetic design. Prioritize image quality with some flexibility. Criteria: 1. Core Requirement: The image must be clear, with no severe blurring in the lip area. 2. Angle and Position: Must be a generally frontal shot with the lips clearly visible and mostly centered. 3. Obstruction: Lips should not be significantly covered by objects (hands, food, jewelry). Minor hair or shadow is acceptable. 4. Expression: A natural expression is fine; lips do not need to be fully closed. Return the analysis as JSON. Provide a brief reason in Chinese if non-compliant." }
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: complianceSchema }
        }));
        const result = JSON.parse(response.text);
        return { isCompliant: result.isCompliant, reason: result.reason };
    } catch (error) {
        console.error("合规性检查出错:", error);
        // Fallback data
        return { isCompliant: false, reason: "AI分析服务暂时出现问题，请稍后再试。" };
    }
};


export const extractLipCloseup = async (photoUrl: string): Promise<string | null> => {
     try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    dataUrlToPart(photoUrl),
                    { text: "Precisely crop the lip area from this image, including the lips and adjacent skin. Ensure the crop is clear and centered. Output only the cropped image, with no text." }
                ]
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
        }));
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("唇部特写提取出错:", error);
        return null; // Don't return fallback image, let UI handle null
    }
};

const styleSuggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            prompt: { type: Type.STRING, description: "A specific, executable design instruction for lip aesthetics." },
            reason: { type: Type.STRING, description: "A brief explanation in Chinese of why this suggestion is suitable for this lip shape." },
        },
        required: ["prompt", "reason"],
    }
};

export const getStyleSuggestions = async (lipCloseupUrl: string): Promise<StyleSuggestion[]> => {
    try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    dataUrlToPart(lipCloseupUrl),
                    { text: "Based on this lip closeup, provide 5 professional and creative aesthetic design suggestions. For each suggestion, provide a 'prompt' (a specific design instruction, e.g., 'Increase volume in the upper lip and define the cupid's bow') and a 'reason' (a brief explanation in Chinese of why this suggestion is suitable for this lip shape). Return the response as a JSON array." }
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: styleSuggestionsSchema }
        }));
        return JSON.parse(response.text);
    } catch (error) {
        console.error("获取风格建议出错:", error);
        return [
            { prompt: "自然水润唇", reason: "提升唇部光泽和滋润感，适合追求自然效果的用户。" },
            { prompt: "M型微笑唇", reason: "塑造清晰的唇峰和上扬的嘴角，增添亲和力与甜美感。" },
            { prompt: "饱满性感唇", reason: "增加唇部整体的丰满度，打造性感迷人的视觉效果。" },
            { prompt: "精致丘比特弓", reason: "强化上唇的弓形轮廓，使唇形更立体、精致。" },
            { prompt: "气质花瓣唇", reason: "唇瓣轮廓清晰，上下唇比例协调，如同花瓣般柔美。" }
        ];
    }
};

export const applyStyle = async (photoUrl: string, prompt: string): Promise<string | null> => {
    const cacheKey = JSON.stringify({ photoUrl, prompt });
    if (styleCache.has(cacheKey)) {
        console.log("Cache hit for style application.");
        return styleCache.get(cacheKey)!;
    }
    console.log("Cache miss. Calling API for style application.");

    try {
        const fullPrompt = `As a top medical aesthetic digital artist, modify the lips in this image based on the instruction: '${prompt}'. IMPORTANT: You must not modify any other part of the face (skin, nose, eyes, chin, etc.). The background must remain unchanged. Only alter the lips, preserving the original image's texture and lighting.`;
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    dataUrlToPart(photoUrl),
                    { text: fullPrompt }
                ]
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        }));

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                styleCache.set(cacheKey, resultUrl); // Cache successful result
                return resultUrl;
            }
        }
        return null;
    } catch (error) {
        console.error("应用风格出错:", error);
        return null;
    }
};

export const getNineGridSuggestions = async (lipCloseupUrl: string): Promise<NineGridSuggestion[] | null> => {
    try {
        const nineGridSuggestionsSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING, description: "A specific, executable English design instruction for an image generation model." },
                    description: { type: Type.STRING, description: "A brief, user-facing description of the style in Chinese (e.g., '自然饱满，略带光泽感')." },
                    keywords: { type: Type.STRING, description: "A few keywords in Chinese, comma-separated (e.g., '丰唇, 自然, 微笑唇')." },
                },
                required: ["prompt", "description", "keywords"],
            },
            minItems: 9,
            maxItems: 9,
        };

        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    dataUrlToPart(lipCloseupUrl),
                    { text: "Analyze this lip closeup and generate 9 distinct and aesthetically pleasing lip design suggestions. For each suggestion, provide: 1. 'prompt': A specific, executable English instruction for an image generation model (e.g., 'Slightly increase lower lip volume'). 2. 'description': A brief, user-facing description of the style in Chinese. 3. 'keywords': A few comma-separated keywords in Chinese. Return as a JSON array with exactly 9 objects." }
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: nineGridSuggestionsSchema }
        }));
        return JSON.parse(response.text);
    } catch (error) {
        console.error("获取九宫格建议出错:", error);
        return Array(9).fill({
            prompt: "AI suggestion generation failed",
            description: "AI建议生成失败",
            keywords: "错误"
        });
    }
};

const parseAestheticPlan = (text: string): AestheticPlan => {
    const plan: AestheticPlan = {};
    const sections = {
        injectionPlan: /注射方案:([\s\S]*?)(?=容量与形态:|唇线与纹色:|妆容修饰:|$)/,
        volumeAndShapePlan: /容量与形态:([\s\S]*?)(?=注射方案:|唇线与纹色:|妆容修饰:|$)/,
        lipLinerPlan: /唇线与纹色:([\s\S]*?)(?=注射方案:|容量与形态:|妆容修饰:|$)/,
        makeupPlan: /妆容修饰:([\s\S]*?)(?=注射方案:|容量与形态:|唇线与纹色:|$)/,
    };
    for (const [key, regex] of Object.entries(sections)) {
        const match = text.match(regex);
        if (match && match[1]) {
            plan[key as keyof AestheticPlan] = match[1].trim();
        }
    }
    return plan;
};

export const streamAestheticPlan = async (originalUrl: string, designedUrl: string, onUpdate: (plan: AestheticPlan) => void): Promise<void> => {
    const stream = await apiCallWithRetry(() => ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "As a senior medical aesthetic doctor, compare the following two images (Image 1: original lips, Image 2: designed result). Based on the changes from Image 1 to Image 2, provide a professional, detailed aesthetic plan. Return the plan in a text format with the following explicit titles, each on a new line: '注射方案:', '容量与形态:', '唇线与纹色:', and '妆容修饰:'." },
                dataUrlToPart(originalUrl),
                { text: "Image 1: Original Lips" },
                dataUrlToPart(designedUrl),
                { text: "Image 2: Designed Result" },
            ]
        },
    }));

    let accumulatedText = "";
    for await (const chunk of stream) {
        accumulatedText += chunk.text;
        onUpdate(parseAestheticPlan(accumulatedText));
    }
};

const parseMakeupSuggestion = (text: string): MakeupSuggestion => {
    const suggestion: MakeupSuggestion = {};
    const sections = {
        overallLook: /整体风格:([\s\S]*?)(?=眼妆建议:|腮红建议:|$)/,
        eyeshadow: /眼妆建议:([\s\S]*?)(?=整体风格:|腮红建议:|$)/,
        blush: /腮红建议:([\s\S]*?)(?=整体风格:|眼妆建议:|$)/,
    };
    for (const [key, regex] of Object.entries(sections)) {
        const match = text.match(regex);
        if (match && match[1]) {
            suggestion[key as keyof MakeupSuggestion] = match[1].trim();
        }
    }
    return suggestion;
};

export const streamMakeupSuggestions = async (originalFullPhotoUrl: string, designedFullPhotoUrl: string, onUpdate: (suggestion: MakeupSuggestion) => void): Promise<void> => {
    const stream = await apiCallWithRetry(() => ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "As a top professional makeup artist, compare the following two images. Image 1 is the original photo, and Image 2 is the same person after a new lip style has been designed. Based on the new lip style in Image 2, design a complete and complementary makeup look. Return the suggestions in a text format with the following explicit titles, each on a new line: '整体风格:', '眼妆建议:', and '腮红建议:'." },
                dataUrlToPart(originalFullPhotoUrl),
                { text: "Image 1: Original Photo" },
                dataUrlToPart(designedFullPhotoUrl),
                { text: "Image 2: After New Lip Design" },
            ]
        },
    }));

    let accumulatedText = "";
    for await (const chunk of stream) {
        accumulatedText += chunk.text;
        onUpdate(parseMakeupSuggestion(accumulatedText));
    }
};

const templateDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A creative and appealing template name in Chinese (e.g., '午后甜杏' or '琉璃冰晶')." },
        description: { type: Type.STRING, description: "A short description in Chinese summarizing the style's key features." },
    },
    required: ["name", "description"],
};

export const generateTemplateDetails = async (prompt: string): Promise<TemplateDetails | null> => {
    try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: `As a professional aesthetic brand creative director, generate a template name and a short description for the following lip design prompt. The name should be creative and appealing, and the description should accurately summarize its key features. Use Chinese for the name and description. Return as JSON.\n\nDesign Prompt: "${prompt}"` }
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: templateDetailsSchema }
        }));
        return JSON.parse(response.text);
    } catch (error) {
        console.error("生成模板详情出错:", error);
        return {
            name: "我的自定义模板",
            description: "一个基于个人喜好保存的设计风格。",
        };
    }
};


const lipMeshSchema = {
    type: Type.OBJECT,
    properties: {
        vertices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    z: { type: Type.NUMBER },
                },
                required: ["x", "y", "z"],
            },
        },
        faces: {
            type: Type.ARRAY,
            items: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
            },
        },
    },
    required: ["vertices", "faces"],
};

export const generate3dLipMesh = async (originalLipUrl: string, designedLipUrl: string): Promise<LipMesh | null> => {
    try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: `As a 3D modeling AI, analyze these two lip images (Image 1: original, Image 2: designed). Generate a simplified 3D mesh based on Image 2. Output a JSON object containing 'vertices' (an array of {x, y, z} objects) and 'faces' (an array of arrays, each with three vertex indices to form a triangle). The vertex count should be between 40 and 60. Ensure all face indices are valid. Coordinate system: X is horizontal, Y is vertical, Z is depth.`},
                    dataUrlToPart(originalLipUrl),
                    { text: "Image 1: Original Lips" },
                    dataUrlToPart(designedLipUrl),
                    { text: "Image 2: Designed Result" },
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: lipMeshSchema }
        }));
        return JSON.parse(response.text);
    } catch (error) {
        console.error("生成3D唇部模型出错:", error);
        return null;
    }
};

const contextualAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        aestheticKeywords: {
            type: Type.ARRAY,
            description: "A list of 1-2 word keywords in Chinese from the aesthetic plan (e.g., '丰满', '光泽', 'M唇', '唇线').",
            items: { type: Type.STRING },
        },
        makeupKeywords: {
            type: Type.ARRAY,
            description: "A list of 1-2 word keywords in Chinese from the makeup suggestion (e.g., '大地色', '橘色腮红', '自然').",
            items: { type: Type.STRING },
        },
    },
    required: ["aestheticKeywords", "makeupKeywords"],
};

export const analyzeSuggestionsForKeywords = async (
    aestheticPlan: AestheticPlan | null,
    makeupSuggestion: MakeupSuggestion | null
): Promise<ContextualAnalysis> => {
    const combinedText = `
        Aesthetic Plan:
        Injection: ${aestheticPlan?.injectionPlan || 'N/A'}
        Volume/Shape: ${aestheticPlan?.volumeAndShapePlan || 'N/A'}
        Liner/Color: ${aestheticPlan?.lipLinerPlan || 'N/A'}
        Makeup: ${aestheticPlan?.makeupPlan || 'N/A'}

        Makeup Suggestion:
        Overall: ${makeupSuggestion?.overallLook || 'N/A'}
        Eyeshadow: ${makeupSuggestion?.eyeshadow || 'N/A'}
        Blush: ${makeupSuggestion?.blush || 'N/A'}
    `;

    if (combinedText.trim().length < 50) { // Not enough text to analyze
        return { aestheticKeywords: [], makeupKeywords: [] };
    }

    try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: `Analyze the following aesthetic and makeup plan. Extract key descriptive words or short phrases (1-2 words, in Chinese) that represent the core recommendations. Focus on terms related to lip shape, volume, texture, color, and makeup styles. Return the result as JSON. \n\n${combinedText}` }
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: contextualAnalysisSchema }
        }));
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing suggestions for keywords:", error);
        return { aestheticKeywords: [], makeupKeywords: [] }; // Return empty on error
    }
};

const actionableIntentSchema = {
    type: Type.OBJECT,
    properties: {
        suggestionText: { type: Type.STRING, description: "A concise, user-facing suggestion in Chinese, phrased as a question (e.g., 'AI建议增加上唇丰满度，要应用吗？')." },
        actionPrompt: { type: Type.STRING, description: "A clear, executable image generation prompt in English that corresponds to the suggestion (e.g., 'Increase the volume of the upper lip for a fuller look.')." },
    },
    required: ["suggestionText", "actionPrompt"],
};

export const extractActionableIntent = async (
    aestheticPlan: AestheticPlan | null,
    makeupSuggestion: MakeupSuggestion | null
): Promise<ActionableIntent | null> => {
    const combinedText = `
        Aesthetic Plan:
        Injection: ${aestheticPlan?.injectionPlan || 'N/A'}
        Volume/Shape: ${aestheticPlan?.volumeAndShapePlan || 'N/A'}
        Liner/Color: ${aestheticPlan?.lipLinerPlan || 'N/A'}
        Makeup: ${aestheticPlan?.makeupPlan || 'N/A'}

        Makeup Suggestion:
        Overall: ${makeupSuggestion?.overallLook || 'N/A'}
        Eyeshadow: ${makeupSuggestion?.eyeshadow || 'N/A'}
        Blush: ${makeupSuggestion?.blush || 'N/A'}
    `;

    if (combinedText.trim().length < 50) {
        return null;
    }

    try {
        const response = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: `You are an AI assistant for a lip design application. Read the following aesthetic and makeup plans. Identify the single most important and actionable design change suggested for the lips. Formulate this as a concise, user-facing suggestion (in Chinese) and a clear, executable prompt for an image generation model (in English). The goal is to suggest the *next* logical step based on the analysis. If no clear, single action can be determined, return a JSON object with empty strings. Return the response as JSON.\n\n${combinedText}` }
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: actionableIntentSchema }
        }));
        const result = JSON.parse(response.text);
        if (result.suggestionText && result.actionPrompt) {
            return result as ActionableIntent;
        }
        return null;
    } catch (error) {
        console.error("Error extracting actionable intent:", error);
        return null;
    }
};