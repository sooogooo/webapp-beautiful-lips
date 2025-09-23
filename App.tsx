import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
// Fix: Import ThreeElements for type augmentation
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import {
  UploadIcon, CameraIcon, CheckCircleIcon, ExclamationCircleIcon, PhotoIcon, HistoryIcon, SparklesIcon,
  RefreshIcon, TrashIcon, GridIcon, XIcon, DownloadIcon, ExpandIcon, PlusIcon, MinusIcon, CheckIcon,
  SyringeIcon, CubeIcon, PencilIcon, LipstickIcon, SettingsIcon, InfoIcon, UndoIcon, RedoIcon, CropIcon, SpinnerIcon, GripHorizontalIcon, ChevronDownIcon,
  StarIcon, ShareIcon, EyeIcon, FaceBlushIcon, BookmarkIcon, LipArtIcon, QuestionMarkCircleIcon, CubeTransparentIcon
} from './components/icons';
import { Photo, OperationHistory, AestheticPlan, StyleSuggestion, SavedDesign, MakeupSuggestion, DesignTemplate, LipMesh, Vertex, TemplateDetails, StylePreset, NineGridSuggestion, ContextualAnalysis, ActionableIntent } from './types';
import * as geminiService from './services/geminiService';

// Fix: Manually augment JSX.IntrinsicElements to include react-three-fiber components.
// This resolves TypeScript errors when the automatic type augmentation fails.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Helper function to create BufferGeometry from our LipMesh data
const createLipGeometry = (mesh: LipMesh): THREE.BufferGeometry => {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array(mesh.vertices.length * 3);
    const uvs = new Float32Array(mesh.vertices.length * 2);

    const allX = mesh.vertices.map(v => v.x);
    const allY = mesh.vertices.map(v => v.y);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    mesh.vertices.forEach((v, i) => {
        vertices[i * 3] = v.x;
        vertices[i * 3 + 1] = v.y;
        vertices[i * 3 + 2] = v.z;
        
        uvs[i * 2] = (v.x - minX) / rangeX;
        uvs[i * 2 + 1] = 1 - ((v.y - minY) / rangeY);
    });

    const indices = new Uint16Array(mesh.faces.flat());

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));
    
    geom.computeVertexNormals();
    geom.center();

    return geom;
};

type ActiveTab = 'photo' | 'design' | 'history' | 'saved' | 'templates';
type Theme = 'dark' | 'light' | 'theme-sakura-pink light' | 'theme-lavender-haze light' | 'theme-minty-fresh light' | 'theme-velvet-night dark';
type FontSize = 'font-sm' | 'font-md' | 'font-lg';
type ViewMode = 'closeup' | 'full';

const LIP_QUOTES = [
  "唇齿之间，是言语，也是风情。", "A smile is the prettiest thing you can wear.", "朱唇一点，人间颜色。",
  "Beauty is power; a smile is its sword.", "樱桃小口，道不尽的温柔。", "The curve of your lips rewrites history.",
  "唇是心之门，亦是貌之魂。", "Lips without lipstick are like cake without frosting.", "一抹红唇，惊艳了岁月。",
  "The most beautiful makeup of a woman is passion. But cosmetics are easier to buy.", "轻启朱唇，语笑嫣然。",
  "A woman's lips are the gate to her soul.", "唇上之彩，心上之光。", "Keep your heels, head, and standards high. And your lipstick on.",
  "点绛唇，风华绝代。", "Pour yourself a drink, put on some lipstick, and pull yourself together.",
  "唇若涂脂，气色自来。", "Lipstick is the red badge of courage.", "丹唇未启笑先闻。",
  "A whisper of color, a shout of confidence.", "双唇维画，一颦一笑皆是诗。", "The perfect pout is a masterpiece.",
  "唇语花香，美丽绽放。", "She has a way with words, red lipstick, and making an entrance.",
  "你的唇，是世间最美的风景。", "There is a shade of red for every woman.", "淡妆浓抹总相宜，唇色点亮好心情。",
  "Give a woman the right lipstick and she can conquer the world.", "巧笑倩兮，美目盼兮，朱唇动兮。",
  "A girl's best friend, a perfectly applied lipstick.", "唇间艺术，雕琢时光之美。", "Life is short. Buy the lipstick.",
  "美人的唇，一半是优雅，一半是火焰。", "Lipstick is happiness in a tube.", "一吻定情，唇印为证。",
  "Your lips are a canvas. Paint them with your dreams.", "唇色如画，绘出你的故事。", "Never underestimate the power of a good lipstick day.",
  "红唇媚，秋波送，别样风情。", "Style is a way to say who you are without having to speak.",
  "唇间的一抹亮色，是自信的宣言。", "The right lip color can change your whole look.",
  "最是那一低头的温柔，恰似朱唇边的娇羞。", "Lipstick is a way to feel put together.",
  "唇之美，在于形，在于色，更在于神。", "A little lipstick never hurts.",
  "你的微笑，因唇色而更加动人。", "Elegance is the only beauty that never fades.",
  "为你的双唇，穿上最美的衣裳。", "Find your signature color and wear it with pride.",
  "唇是五官的焦点，也是魅力的起点。", "Beauty begins the moment you decide to be yourself.",
  "每一次涂抹，都是一次美丽的仪式。", "Lip gloss is the new mistletoe.",
  "唇色，是你无声的语言。", "Be a flamingo in a flock of pigeons.",
  "精致的女人，从不忽略唇间的风景。", "I believe in manicures. I believe in overdressing. I believe in primping at leisure and wearing lipstick.",
  "让双唇，成为你最闪耀的名片。", "The beauty of a woman is not in the clothes she wears, the figure that she carries, or the way she combs her hair.",
  "一笔勾勒，唇情无限。", "Playing with lipstick is a form of art.", "唇间的色彩，是心情的写照。",
  "Some girls are just born with glitter in their veins.", "爱笑的女孩，唇色总不会太差。",
  "The only drama I enjoy is in my lashes... and my lipstick.", "唇若盛开的玫瑰，娇艳欲滴。",
  "A perfect lip is a statement.", "改变唇色，改变心情。",
  "Invest in your skin. It is going to represent you for a very long time. And your lips are part of it.",
  "唇妆，是献给生活的情书。", "She's a little bit of heaven with a wild side, and a perfect shade of lipstick.",
  "性感，从饱满的双唇开始。", "Lipstick is my war paint.", "你的唇，藏着星辰大海。",
  "The best color in the whole world is the one that looks good on you.", "唇，是情感的画笔。",
  "Simplicity is the keynote of all true elegance.", "一抹唇红，点亮整个妆容。",
  "I like my coffee black and my lipstick red.", "唇间的弧度，是世间最美的微笑曲线。",
  "You can't buy happiness, but you can buy lipstick, and that's kind of the same thing."
];

const SPLASH_EFFECTS = [
    'effect-petals', 'effect-sparkles', 'effect-glow', 'effect-light-rays',
    'effect-petals', 'effect-sparkles', 'effect-glow', 'effect-light-rays',
    'effect-petals', 'effect-sparkles', 'effect-glow', 'effect-light-rays',
    'effect-petals', 'effect-sparkles', 'effect-glow', 'effect-light-rays',
    'effect-petals', 'effect-sparkles', 'effect-glow', 'effect-light-rays',
];

const STYLE_PRESETS: StylePreset[] = [
  { name: "自然丰唇", prompt: "Slightly increase the volume of both the upper and lower lips, maintaining a natural and soft appearance.", description: "轻微增加双唇的体积感，效果自然柔和。" },
  { name: "M唇塑形", prompt: "Define a clear M-shaped Cupid's bow on the upper lip, creating two distinct peaks.", description: "在上唇塑造清晰的M形唇峰，增添精致感。" },
  { name: "微笑唇角", prompt: "Slightly lift the corners of the mouth to create a gentle, pleasant smiling expression.", description: "轻微上扬嘴角，打造亲切甜美的微笑表情。" },
  { name: "性感厚唇", prompt: "Significantly increase the volume of both lips, especially the lower lip, for a full and sensual pout.", description: "显著增加双唇的饱满度，打造性感丰润的效果。" },
  { name: "花瓣唇", prompt: "Create a lip shape where the lower lip is full and the upper lip has a defined central lobe, resembling flower petals.", description: "下唇饱满，上唇唇珠突出，如同花瓣般娇嫩。" },
  { name: "清晰唇线", prompt: "Enhance the definition of the lip borders (vermilion border) for a crisp and well-defined look.", description: "加强唇部边缘轮廓，使唇形更加立体分明。" },
  { name: "水润光泽", prompt: "Add a glossy, hydrated finish to the lips, making them look plump and healthy.", description: "为唇部增加水润光泽感，显得健康饱满。" },
  { name: "减龄嘟嘟唇", prompt: "Focus on adding volume to the center of the lips and slightly pouting the upper lip for a youthful look.", description: "着重于唇部中央的饱满度，打造年轻可爱的效果。" },
  { name: "俄式芭比唇", prompt: "Create the 'Russian Lips' style: increase the vertical height of the lips, especially the upper lip, creating a taller, flatter appearance from the side profile. Keep the Cupid's bow sharp and well-defined.", description: "增加唇部垂直高度，唇形平坦精致，打造芭比娃娃般的效果。" },
  { name: "锁孔唇", prompt: "Create a 'keyhole pout' by adding a small, natural-looking gap in the very center of the lower lip, enhancing its volume slightly.", description: "在下唇中央创造一个精致的小开口，增添独特魅力。" },
  { name: "柔雾渐变唇", prompt: "Soften and slightly blur the vermilion border of the lips to create a 'gradient lip' or 'overlip' effect, making the lips appear softer and fuller without harsh lines.", description: "模糊唇部边缘，打造柔和的渐变效果，使唇形看起来更丰满自然。" },
  { name: "好莱坞经典唇", prompt: "Create a classic 'Hollywood' lip style: ensure the lips are perfectly symmetrical with a sharply defined Cupid's bow and clear vermilion border. Balance the volume between the upper and lower lip for a timeless, elegant look.", description: "轮廓分明，色彩饱满，展现经典优雅的好莱坞风格。" },
  { name: "精雕丘比特弓", prompt: "Sharpen and accentuate the Cupid's bow, adding definition and a slight lift to the two peaks of the upper lip without significantly increasing overall volume.", description: "精细雕琢上唇的丘比特弓，使其轮廓更清晰、更立体。" }
];


const SplashScreen = ({ progress }: { progress: number }) => {
    const [quote] = useState(() => LIP_QUOTES[Math.floor(Math.random() * LIP_QUOTES.length)]);
    const [lipArtIndex] = useState(() => Math.floor(Math.random() * 50));
    const [effectClass] = useState(() => SPLASH_EFFECTS[Math.floor(Math.random() * SPLASH_EFFECTS.length)]);

    const portalElement = document.getElementById('splash-screen');
    if (!portalElement) return null;

    return ReactDOM.createPortal(
        <div className={effectClass}>
            <div className="splash-content">
                <LipArtIcon index={lipArtIndex} className="splash-lip-art" />
                <p className="splash-quote">{quote}</p>
            </div>
            <div className="splash-progress-bar">
                <div className="splash-progress-inner" style={{ width: `${progress}%` }}></div>
            </div>
        </div>,
        portalElement
    );
};

const ModelLoader = () => {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
                <SpinnerIcon className="w-8 h-8" />
                <p className="mt-2 text-sm">正在加载模型...</p>
            </div>
        </Html>
    );
};

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [activeOperation, setActiveOperation] = useState<OperationHistory | null>(null);
  const [operationHistory, setOperationHistory] = useState<OperationHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([]);
  const [activeStylePrompt, setActiveStylePrompt] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);

  // UI State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isAppReady, setIsAppReady] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('photo');
  const [viewMode, setViewMode] = useState<ViewMode>('closeup');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobilePanelExpanded, setIsMobilePanelExpanded] = useState(window.innerWidth < 768);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [croppingState, setCroppingState] = useState<{ isOpen: boolean; photo: Photo | null }>({ isOpen: false, photo: null });
  const [nineGridModalState, setNineGridModalState] = useState<{ isOpen: boolean, isLoading: boolean, results: (string | null)[], suggestions: NineGridSuggestion[], error: string | null, loadingIndices: number[] }>({ isOpen: false, isLoading: false, results: [], suggestions: [], error: null, loadingIndices: [] });
  const [zoomModalProps, setZoomModalProps] = useState<{ isOpen: boolean, imageUrl: string | null, prompt?: string, onSelect?: () => void }>({ isOpen: false, imageUrl: null });
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [howToUseModalOpen, setHowToUseModalOpen] = useState(false);
  const [aestheticPlan, setAestheticPlan] = useState<AestheticPlan | null>(null);
  const [isAestheticPlanVisible, setIsAestheticPlanVisible] = useState(true);
  const [makeupSuggestion, setMakeupSuggestion] = useState<MakeupSuggestion | null>(null);
  const [isMakeupSuggestionVisible, setIsMakeupSuggestionVisible] = useState(true);
  const [contextualAnalysis, setContextualAnalysis] = useState<ContextualAnalysis | null>(null);
  const [actionableIntent, setActionableIntent] = useState<ActionableIntent | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [shareModalState, setShareModalState] = useState<{ isOpen: boolean; operation: OperationHistory | null; originalUrl: string | null; }>({ isOpen: false, operation: null, originalUrl: null });
  const [templateModalState, setTemplateModalState] = useState<{
    isOpen: boolean;
    prompt: string | null;
    isLoadingDetails: boolean;
    initialDetails: TemplateDetails | null;
  }>({ isOpen: false, prompt: null, isLoadingDetails: false, initialDetails: null });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [threeDModalState, setThreeDModalState] = useState<{ isOpen: boolean; isLoading: boolean; mesh: LipMesh | null; error: string | null; textureUrl: string | null; }>({ isOpen: false, isLoading: false, mesh: null, error: null, textureUrl: null });
  const [imageTransform, setImageTransform] = useState({ x: 0, y: 0, scale: 1 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const compareSliderRef = useRef<HTMLDivElement>(null);

  const selectedPhoto = useMemo(() => photos.find(p => p.id === selectedPhotoId), [photos, selectedPhotoId]);
  const canUndo = useMemo(() => historyIndex >= 0, [historyIndex]);
  const canRedo = useMemo(() => historyIndex < operationHistory.length - 1, [historyIndex, operationHistory.length]);
  const isCurrentDesignSaved = useMemo(() => {
    if (!activeOperation) return false;
    return savedDesigns.some(d => d.operation.id === activeOperation.id);
  }, [activeOperation, savedDesigns]);

  // Effects
  useEffect(() => {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    const timeouts: number[] = [];
    
    // Simulate a multi-step loading process for a better UX
    const loadingSteps = [
      { progress: 25, delay: 200 },  // Initializing
      { progress: 60, delay: 700 },  // Loading AI Services
      { progress: 90, delay: 400 },  // Loading Assets
      { progress: 100, delay: 300 }, // Finalizing
    ];

    let cumulativeDelay = 0;
    loadingSteps.forEach(step => {
      cumulativeDelay += step.delay;
      const timeoutId = window.setTimeout(() => {
        setLoadingProgress(step.progress);

        // When the final step is reached
        if (step.progress >= 100) {
          window.setTimeout(() => {
            splash.classList.add('fade-out');
            setIsAppReady(true);
          }, 500); // Wait for progress bar to fill and then start fade
        }
      }, cumulativeDelay);
      timeouts.push(timeoutId);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedPhotoId) handleNewDesign();
  }, [selectedPhotoId]);
  
  useEffect(() => {
    setImageTransform({ x: 0, y: 0, scale: 1 });
  }, [selectedPhotoId, activeOperation]);


  useEffect(() => {
    if (selectedPhoto?.compliance?.isCompliant && selectedPhoto.lipCloseup) handleRefreshSuggestions();
  }, [selectedPhoto?.lipCloseup]);

  useEffect(() => {
    if (activeOperation && selectedPhoto) {
        setAestheticPlan(null);
        setMakeupSuggestion(null);
        setContextualAnalysis(null);
        setActionableIntent(null);
        setIsAestheticPlanVisible(false);
        setIsMakeupSuggestionVisible(false);
        setIsLoading(prev => ({ ...prev, planAndSuggestions: true }));

        const fetchAllSuggestions = async () => {
            let finalPlan: AestheticPlan | null = null;
            let finalSuggestion: MakeupSuggestion | null = null;
            try {
                if(selectedPhoto.lipCloseup) {
                  await geminiService.streamAestheticPlan(selectedPhoto.lipCloseup, activeOperation.resultUrl, (planUpdate) => {
                      setAestheticPlan(prev => {
                          const newPlan = {...prev, ...planUpdate};
                          finalPlan = newPlan;
                          return newPlan;
                      });
                      if(!isAestheticPlanVisible) setIsAestheticPlanVisible(true);
                  });
                }
                await geminiService.streamMakeupSuggestions(selectedPhoto.url, activeOperation.fullResultUrl, (suggestionUpdate) => {
                    setMakeupSuggestion(prev => {
                        const newSuggestion = {...prev, ...suggestionUpdate};
                        finalSuggestion = newSuggestion;
                        return newSuggestion;
                    });
                    if(!isMakeupSuggestionVisible) setIsMakeupSuggestionVisible(true);
                });
                
                const analysis = await geminiService.analyzeSuggestionsForKeywords(finalPlan, finalSuggestion);
                setContextualAnalysis(analysis);

            } catch (err) {
                console.error("Error fetching streaming suggestions or context:", err);
            } finally {
                setIsLoading(prev => ({ ...prev, planAndSuggestions: false }));
            }
        };

        fetchAllSuggestions();

    } else {
        setAestheticPlan(null);
        setMakeupSuggestion(null);
        setContextualAnalysis(null);
        setActionableIntent(null);
        setIsAestheticPlanVisible(false);
        setIsMakeupSuggestionVisible(false);
    }
  }, [activeOperation, selectedPhoto]);

  useEffect(() => {
    try {
        const saved = localStorage.getItem('savedLipDesigns');
        if (saved) setSavedDesigns(JSON.parse(saved));
        const savedTemplates = localStorage.getItem('lipDesignTemplates');
        if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    } catch (e) { console.error("Failed to load from localStorage", e); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('savedLipDesigns', JSON.stringify(savedDesigns)); }
    catch (e) { console.error("Failed to save designs to localStorage", e); }
  }, [savedDesigns]);

  useEffect(() => {
    try { localStorage.setItem('lipDesignTemplates', JSON.stringify(templates)); }
    catch (e) { console.error("Failed to save templates to localStorage", e); }
  }, [templates]);

  const setLoading = (key: string, value: boolean) => setIsLoading(prev => ({ ...prev, [key]: value }));

  const processNewPhoto = async (url: string, name: string) => {
    const photoId = `photo_${Date.now()}`;
    const newPhoto: Photo = { id: photoId, name, url, compliance: null };
    setPhotos(prev => [newPhoto, ...prev.slice(0, 2)]); // Show original temporarily
    setError(null);
    setLoading(photoId, true);

    try {
        const processedUrl = await geminiService.preprocessPhoto(url);
        const photoToAnalyze: Photo = { ...newPhoto, url: processedUrl || url };

        const compliance = await geminiService.checkCompliance(photoToAnalyze.url);
        let updatedPhoto: Photo;
        if (compliance.isCompliant) {
            const closeup = await geminiService.extractLipCloseup(photoToAnalyze.url);
            updatedPhoto = closeup ? { ...photoToAnalyze, compliance, lipCloseup: closeup } : { ...photoToAnalyze, compliance: { isCompliant: false, reason: "AI无法提取唇部特写。" } };
        } else {
            updatedPhoto = { ...photoToAnalyze, compliance };
        }
        setPhotos(p => p.map(ph => ph.id === photoId ? updatedPhoto : ph));
        setSelectedPhotoId(photoId); 
        if (isMobile) { setActiveTab('design'); setIsMobilePanelExpanded(true); }
    } catch (err) {
        console.error(err);
        setError("AI分析失败，请稍后再试。");
        const errorPhoto = { ...newPhoto, compliance: { isCompliant: false, reason: "AI分析失败" } };
        setPhotos(p => p.map(ph => ph.id === photoId ? errorPhoto : ph));
        setSelectedPhotoId(photoId);
    } finally {
        setLoading(photoId, false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => processNewPhoto(event.target!.result as string, file.name);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleHistorySelect = (historyItem: OperationHistory) => {
    const selectedIndex = operationHistory.findIndex(op => op.id === historyItem.id);
    if (selectedIndex > -1) {
      setActiveOperation(historyItem);
      setHistoryIndex(selectedIndex);
    }
  };
  
  const handleApplyStyle = useCallback(async (prompt: string, type: OperationHistory['type'] = 'style') => {
    if (!selectedPhoto?.url) return;
    setLoading('applyStyle', true);
    setActiveStylePrompt(prompt);
    setError(null);
    try {
      const fullResultUrl = await geminiService.applyStyle(selectedPhoto.url, prompt);
      if (fullResultUrl) {
        const closeupResultUrl = await geminiService.extractLipCloseup(fullResultUrl);
        if (closeupResultUrl) {
            const newHistoryItem: OperationHistory = {
                id: `op_${Date.now()}`,
                timestamp: Date.now(),
                type,
                prompt,
                resultUrl: closeupResultUrl,
                fullResultUrl: fullResultUrl,
            };
            const historyToKeep = operationHistory.slice(0, historyIndex + 1);
            const newHistory = [...historyToKeep, newHistoryItem];
            setOperationHistory(newHistory);
            const newIndex = newHistory.length - 1;
            setHistoryIndex(newIndex);
            setActiveOperation(newHistory[newIndex]);
            setViewMode('closeup');
        } else {
             setError("无法提取设计后的唇部特写。");
        }
      } else {
        setError("风格应用失败。");
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = "风格应用失败，请稍后再试。";
      if (err && err.toString().includes('429')) {
          errorMessage = 'AI 服务繁忙，请求过于频繁。请稍后再试。';
      }
      setError(errorMessage);
    } finally {
      setLoading('applyStyle', false);
      setActiveStylePrompt(null);
    }
  }, [selectedPhoto, operationHistory, historyIndex]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setActiveOperation(newIndex < 0 ? null : operationHistory[newIndex]);
  }, [canUndo, historyIndex, operationHistory]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setActiveOperation(operationHistory[newIndex]);
  }, [canRedo, historyIndex, operationHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const isModifier = e.metaKey || e.ctrlKey;
      if (isModifier && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); }
      else if (isModifier && e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleRefreshSuggestions = useCallback(async () => {
    if (!selectedPhoto?.lipCloseup) return;
    setLoading('suggestions', true);
    setStyleSuggestions([]);
    try {
      setStyleSuggestions(await geminiService.getStyleSuggestions(selectedPhoto.lipCloseup));
    } catch (err) { console.error(err); }
    finally { setLoading('suggestions', false); }
  }, [selectedPhoto]);

  const handleNewDesign = () => {
    setActiveOperation(null);
    setOperationHistory([]);
    setHistoryIndex(-1);
    setAestheticPlan(null);
    setMakeupSuggestion(null);
    setContextualAnalysis(null);
    setActionableIntent(null);
    setViewMode('closeup');
  };

  const handleConfirmCrop = useCallback((photoId: string, newCloseupUrl: string, cropRect: { x: number; y: number; width: number; height: number; }) => {
    setPhotos(prevPhotos => prevPhotos.map(p => p.id === photoId ? { ...p, lipCloseup: newCloseupUrl, manualCropRect: cropRect } : p));
    if (selectedPhotoId === photoId) handleNewDesign();
    setCroppingState({ isOpen: false, photo: null });
  }, [selectedPhotoId]);
  
  const handleGenerateNineGrid = async () => {
    if (!selectedPhoto?.url || !selectedPhoto.lipCloseup) return;
    setNineGridModalState({ isOpen: true, isLoading: true, results: Array(9).fill(null), suggestions: [], error: null, loadingIndices: [] });
    try {
        const suggestions = await geminiService.getNineGridSuggestions(selectedPhoto.lipCloseup);
        if (!suggestions || suggestions.length !== 9) {
            throw new Error("未能获取9个建议。");
        }
        
        setNineGridModalState(prev => ({ ...prev, suggestions }));

        const resultsPromises = suggestions.map(suggestion => {
            if (suggestion.prompt === "AI suggestion generation failed") {
                return Promise.resolve(null);
            }
            return geminiService.applyStyle(selectedPhoto.url!, suggestion.prompt);
        });

        const results = await Promise.all(resultsPromises);
        setNineGridModalState(prev => ({ ...prev, results, isLoading: false }));

    } catch (error: any) {
        console.error("九宫格生成错误:", error);
        let errorMessage = '九宫格生成失败，请稍后重试。';
        if (error && error.toString().includes('429')) {
            errorMessage = 'AI 服务繁忙，请求过于频繁。请稍后再试。';
        }
        setNineGridModalState(prev => ({ ...prev, isLoading: false, error: errorMessage, results: Array(9).fill(null) }));
    }
  };

  const handleRetryNineGridImage = async (index: number) => {
    if (!selectedPhoto?.url || !nineGridModalState.suggestions[index]) return;

    setNineGridModalState(prev => ({
        ...prev,
        loadingIndices: [...prev.loadingIndices, index]
    }));

    try {
        const suggestion = nineGridModalState.suggestions[index];
        const result = await geminiService.applyStyle(selectedPhoto.url, suggestion.prompt);
        
        setNineGridModalState(prev => {
            const newResults = [...prev.results];
            newResults[index] = result;
            return {
                ...prev,
                results: newResults,
            };
        });
    } catch (error) {
        console.error(`Retry for index ${index} failed:`, error);
        // Let the result remain null so the user can see it failed and retry again.
    } finally {
        setNineGridModalState(prev => ({
            ...prev,
            loadingIndices: prev.loadingIndices.filter(i => i !== index)
        }));
    }
  };
  
  const handleGenerate3dModel = async () => {
      if (!selectedPhoto?.lipCloseup || !activeOperation?.resultUrl) return;
      const textureUrl = activeOperation.resultUrl;
      setThreeDModalState({ isOpen: true, isLoading: true, mesh: null, error: null, textureUrl });
      try {
          const mesh = await geminiService.generate3dLipMesh(selectedPhoto.lipCloseup, activeOperation.resultUrl);
          if (mesh) {
              setThreeDModalState(prev => ({ ...prev, mesh, isLoading: false }));
          } else {
              throw new Error("AI未能生成3D模型。");
          }
      } catch (error) {
          console.error("3D模型生成失败:", error);
          setThreeDModalState(prev => ({ ...prev, isLoading: false, error: "3D模型生成失败，请稍后重试。" }));
      }
  };

  const downloadImage = (url: string | null, filename: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleSaveAllNineGrid = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const images = await Promise.all(nineGridModalState.results.map(url => new Promise<HTMLImageElement>((resolve, reject) => {
        if (!url) { resolve(new Image()); return; }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    })));
    const imgSize = images[0]?.width || 300;
    const gap = 10;
    canvas.width = imgSize * 3 + gap * 2;
    canvas.height = imgSize * 3 + gap * 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    images.forEach((img, i) => {
      if (img.src) {
        const row = Math.floor(i / 3), col = i % 3;
        ctx.drawImage(img, col * (imgSize + gap), row * (imgSize + gap), imgSize, imgSize);
      }
    });
    downloadImage(canvas.toDataURL('image/png'), 'nine-grid-designs.png');
  };
  
  const handleSaveDesign = useCallback(() => {
    if (!activeOperation || !selectedPhotoId) return;
    if (isCurrentDesignSaved) {
        setSavedDesigns(prev => prev.filter(d => d.operation.id !== activeOperation.id));
    } else {
        const newSave: SavedDesign = { id: `saved_${Date.now()}`, photoId: selectedPhotoId, operation: activeOperation, aestheticPlan: aestheticPlan, savedAt: Date.now() };
        setSavedDesigns(prev => [newSave, ...prev]);
    }
  }, [activeOperation, selectedPhotoId, aestheticPlan, isCurrentDesignSaved]);

  const handleGetActionableIntent = async () => {
    if (!aestheticPlan && !makeupSuggestion) return;
    setIsLoadingIntent(true);
    setActionableIntent(null);
    try {
        const intent = await geminiService.extractActionableIntent(aestheticPlan, makeupSuggestion);
        setActionableIntent(intent);
    } catch (err) {
        console.error("Error fetching actionable intent:", err);
        setError("获取AI建议失败。");
    } finally {
        setIsLoadingIntent(false);
    }
  };

  const handleDeleteDesign = (id: string) => setSavedDesigns(prev => prev.filter(d => d.id !== id));

  const handleLoadDesign = (design: SavedDesign) => {
      setSelectedPhotoId(design.photoId);
      setOperationHistory([design.operation]);
      setHistoryIndex(0);
      setActiveOperation(design.operation);
      setAestheticPlan(design.aestheticPlan);
      setActiveTab('design');
      if (isMobile) setIsMobilePanelExpanded(true);
  };

  const handleOpenSaveTemplateModal = async () => {
    if (!activeOperation) return;
    setTemplateModalState({
        isOpen: true,
        prompt: activeOperation.prompt,
        isLoadingDetails: true,
        initialDetails: null
    });
    const details = await geminiService.generateTemplateDetails(activeOperation.prompt);
    setTemplateModalState(prev => ({ ...prev, isLoadingDetails: false, initialDetails: details }));
  };

  const handleSaveTemplate = (name: string, description: string, prompt: string) => {
    const newTemplate: DesignTemplate = { id: `template_${Date.now()}`, name, description, prompt, createdAt: Date.now() };
    setTemplates(prev => [newTemplate, ...prev]);
    setTemplateModalState({ isOpen: false, prompt: null, isLoadingDetails: false, initialDetails: null });
  };

  const handleDeleteTemplate = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id));
  
  const handleApplyTemplate = (prompt: string) => {
    if (!selectedPhoto?.compliance?.isCompliant) { alert("请先选择一张合规的照片。"); setActiveTab('photo'); return; }
    handleApplyStyle(prompt);
    if (isMobile) setIsMobilePanelExpanded(false);
  };

  const handleExportTemplate = (template: DesignTemplate) => {
    navigator.clipboard.writeText(JSON.stringify(template, null, 2))
      .then(() => alert(`模板 "${template.name}" 已复制到剪贴板。`))
      .catch(() => alert('复制失败!'));
  };

  const handleImportTemplate = (jsonString: string) => {
    try {
        const template = JSON.parse(jsonString);
        if (template.name && template.prompt && template.description) {
            const newTemplate: DesignTemplate = { id: template.id || `template_${Date.now()}`, name: template.name, description: template.description, prompt: template.prompt, createdAt: template.createdAt || Date.now() };
            if (templates.some(t => t.id === newTemplate.id)) { alert("已存在相同ID的模板。"); return; }
            setTemplates(prev => [newTemplate, ...prev]);
            setImportModalOpen(false);
        } else { throw new Error("Invalid template format"); }
    } catch (error) { alert("导入失败：无效的模板格式。"); }
  };

  const Header = () => (
    <header className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-20 bg-[var(--theme-bg-base)] bg-opacity-80 backdrop-blur-sm border-b border-[var(--theme-border)]">
      <h1 className="text-lg font-bold flex items-center">
        <img src="https://docs.bccsw.cn/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
        唇相人相世相
      </h1>
       <div className="flex items-center space-x-2">
        <button onClick={() => setHowToUseModalOpen(true)} className="p-2 rounded-full hover:bg-[var(--theme-bg-subtle)] transition-all duration-200 active:scale-90" title="使用方法">
          <QuestionMarkCircleIcon />
        </button>
        <button onClick={() => setSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-[var(--theme-bg-subtle)] transition-all duration-200 active:scale-90" title="设置"><SettingsIcon /></button>
        <button onClick={() => setAboutModalOpen(true)} className="p-2 rounded-full hover:bg-[var(--theme-bg-subtle)] transition-all duration-200 active:scale-90" title="关于"><InfoIcon /></button>
      </div>
    </header>
  );

  const ComplianceErrorOverlay = ({ reason, onClear }: { reason: string; onClear: () => void; }) => (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg text-center p-4">
        <ExclamationCircleIcon title="不合规" />
        <h3 className="mt-4 text-xl font-bold text-white">照片不合规</h3>
        <p className="mt-2 text-base text-gray-200">{reason}</p>
        <button onClick={onClear} className="mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-[var(--theme-indigo)] text-white font-semibold rounded-lg hover:bg-[var(--theme-indigo-hover)] transition-all duration-200 active:scale-95">
            <UploadIcon /><span>重新上传</span>
        </button>
    </div>
  );

  const EditorCanvas = () => {
    const editorCanvasRef = useRef<HTMLDivElement>(null);
    const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!compareSliderRef.current) return;
      const rect = compareSliderRef.current.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
      compareSliderRef.current.style.setProperty('--position', `${newPosition}%`);
    };
    const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const isTouchEvent = 'touches' in e;
        const moveEvent = isTouchEvent ? 'touchmove' : 'mousemove';
        const endEvent = isTouchEvent ? 'touchend' : 'mouseup';
        const onMove = (ev: Event) => handleSliderMove(ev as any);
        const onEnd = () => {
            document.removeEventListener(moveEvent, onMove);
            document.removeEventListener(endEvent, onEnd);
        };
        document.addEventListener(moveEvent, onMove);
        document.addEventListener(endEvent, onEnd);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!editorCanvasRef.current) return;
        e.preventDefault();
        const rect = editorCanvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setImageTransform(prev => {
            const newScale = Math.min(Math.max(1, prev.scale - e.deltaY * 0.002), 5);
            if (newScale === prev.scale) return prev;
            
            const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
            const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
            
            const maxPanX = (newScale - 1) * rect.width;
            const maxPanY = (newScale - 1) * rect.height;
            const clampedX = Math.max(-maxPanX, Math.min(newX, 0));
            const clampedY = Math.max(-maxPanY, Math.min(newY, 0));

            return { scale: newScale, x: clampedX, y: clampedY };
        });
    };

    const handlePanStart = (e: React.PointerEvent) => {
        if (imageTransform.scale <= 1) return;
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        target.setPointerCapture(e.pointerId);
        target.style.cursor = 'grabbing';

        const startX = e.clientX - imageTransform.x;
        const startY = e.clientY - imageTransform.y;
        
        const handlePanMove = (moveEvent: PointerEvent) => {
            if (!editorCanvasRef.current) return;
            const newX = moveEvent.clientX - startX;
            const newY = moveEvent.clientY - startY;

            setImageTransform(prev => {
                const rect = editorCanvasRef.current!.getBoundingClientRect();
                const maxPanX = (prev.scale - 1) * rect.width;
                const maxPanY = (prev.scale - 1) * rect.height;
                const clampedX = Math.max(-maxPanX, Math.min(newX, 0));
                const clampedY = Math.max(-maxPanY, Math.min(newY, 0));
                return { ...prev, x: clampedX, y: clampedY };
            });
        };

        const handlePanEnd = () => {
            target.releasePointerCapture(e.pointerId);
            target.style.cursor = 'grab';
            window.removeEventListener('pointermove', handlePanMove);
            window.removeEventListener('pointerup', handlePanEnd);
        };

        window.addEventListener('pointermove', handlePanMove);
        window.addEventListener('pointerup', handlePanEnd);
    };
    
    const handleZoom = (direction: 'in' | 'out') => {
        setImageTransform(prev => {
            const newScale = direction === 'in' ? Math.min(prev.scale + 0.2, 5) : Math.max(prev.scale - 0.2, 1);
            if (newScale <= 1) return { x: 0, y: 0, scale: 1 };
            if (!editorCanvasRef.current) return { ...prev, scale: newScale };
            
            const rect = editorCanvasRef.current.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const newX = centerX - (centerX - prev.x) * (newScale / prev.scale);
            const newY = centerY - (centerY - prev.y) * (newScale / prev.scale);

            return { scale: newScale, x: newX, y: newY };
        });
    };
    
    const ActionableIntentBanner = () => {
      if (!actionableIntent) return null;
  
      const handleApply = () => {
          handleApplyStyle(actionableIntent.actionPrompt, 'suggestion');
          setActionableIntent(null);
      };
  
      const handleDismiss = () => {
          setActionableIntent(null);
      };
  
      return (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--theme-bg-panel)] rounded-lg shadow-xl z-30 p-3 w-full max-w-md flex items-center justify-between animate-fade-in-down">
              <div className="flex items-center space-x-3 min-w-0">
                  <SparklesIcon className="w-6 h-6 text-[var(--theme-indigo)] flex-shrink-0" />
                  <p className="text-sm font-medium text-[var(--theme-text-base)] truncate" title={actionableIntent.suggestionText}>{actionableIntent.suggestionText}</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <button onClick={handleApply} className="px-3 py-1 text-xs font-semibold bg-[var(--theme-indigo)] text-white rounded-md hover:bg-[var(--theme-indigo-hover)] transition-colors active:scale-95">应用</button>
                  <button onClick={handleDismiss} className="p-1.5 rounded-full hover:bg-[var(--theme-bg-subtle)] transition-colors active:scale-90"><XIcon className="w-4 h-4" /></button>
              </div>
          </div>
      );
    };

    if (!selectedPhoto && !isMobile) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--theme-text-muted)] p-4">
                <PhotoIcon className="w-16 h-16 mb-4 text-[var(--theme-indigo)]" />
                <h2 className="text-xl font-semibold text-[var(--theme-text-base)]">开始你的设计之旅</h2>
                <p className="mt-2">从左侧“照片”面板上传或拍摄一张照片</p>
            </div>
        );
    }
    const originalUrl = viewMode === 'closeup' ? selectedPhoto?.lipCloseup : selectedPhoto?.url;
    const resultUrl = viewMode === 'closeup' ? activeOperation?.resultUrl : activeOperation?.fullResultUrl;
    const displayUrl = resultUrl || originalUrl || selectedPhoto?.url;
    const showComparison = !!(originalUrl && resultUrl);
    const isCompliant = selectedPhoto?.compliance?.isCompliant ?? false;

    return (
        <div className="flex-1 flex flex-col justify-start items-center p-4 md:p-6 relative">
            <ActionableIntentBanner />
            <div className="w-full h-full max-w-4xl max-h-full flex flex-col">
              <div ref={editorCanvasRef} className="flex-1 relative w-full h-full min-h-0 overflow-hidden" onWheel={handleWheel}>
                  {isLoading['applyStyle'] && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 rounded-lg transition-opacity duration-300">
                          <SpinnerIcon className="w-10 h-10 text-white" />
                          <p className="mt-4 text-white font-semibold">AI 正在处理，请稍候...</p>
                      </div>
                  )}
                  {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-lg z-30 text-sm flex items-center space-x-2">
                        <ExclamationCircleIcon title="错误" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="p-1 -mr-2"><XIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                  {!displayUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center text-[var(--theme-text-muted)] p-4 rounded-lg bg-[var(--theme-bg-subtle)]">
                        <PhotoIcon className="w-16 h-16 mb-4 text-[var(--theme-indigo)]" />
                        <h2 className="text-xl font-semibold text-[var(--theme-text-base)]">开始你的设计之旅</h2>
                        <p className="mt-2">从下方“照片”面板上传或拍摄一张照片</p>
                    </div>
                  ) : (
                    <>
                      {selectedPhoto && !isCompliant && selectedPhoto.compliance?.reason && ( <ComplianceErrorOverlay reason={selectedPhoto.compliance.reason} onClear={() => setSelectedPhotoId(null)} /> )}
                      <div 
                        ref={compareSliderRef} 
                        className="compare-slider w-full h-full"
                        style={{
                            transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale})`,
                            cursor: imageTransform.scale > 1 ? 'grab' : 'default',
                            transition: 'transform 0.1s ease-out'
                        }}
                        onPointerDown={handlePanStart}
                      >
                          <img draggable={false} src={displayUrl} alt="设计效果" className="w-full h-full object-contain rounded-lg" />
                          {showComparison && (
                              <>
                                <div className="image-container original-image"><img draggable={false} src={originalUrl} alt="原始图片" className="w-full h-full object-contain rounded-lg" /></div>
                                <div className="slider" onPointerDown={(e) => { e.stopPropagation(); handleInteractionStart(e as any); }}><div className="slider-handle"></div></div>
                              </>
                          )}
                      </div>
                    </>
                  )}
                  {displayUrl && (
                    <div className="absolute bottom-4 right-4 bg-[var(--theme-bg-panel)] bg-opacity-80 rounded-lg shadow-lg flex items-center p-1 space-x-1 z-20">
                        <button onClick={() => handleZoom('out')} className="p-2 rounded-md hover:bg-[var(--theme-bg-subtle)] transition-colors disabled:opacity-50" disabled={imageTransform.scale <= 1}><MinusIcon/></button>
                        <button onClick={() => setImageTransform({x:0, y:0, scale:1})} className="p-2 text-xs font-semibold rounded-md hover:bg-[var(--theme-bg-subtle)] w-14 text-center transition-colors">{Math.round(imageTransform.scale * 100)}%</button>
                        <button onClick={() => handleZoom('in')} className="p-2 rounded-md hover:bg-[var(--theme-bg-subtle)] transition-colors disabled:opacity-50" disabled={imageTransform.scale >= 5}><PlusIcon/></button>
                    </div>
                  )}
              </div>
                {!isMobile && (
                  <div className="flex-shrink-0 flex items-center justify-between p-2 mt-2 bg-[var(--theme-bg-subtle)] rounded-md">
                       <div className="flex items-center space-x-2">
                           <button onClick={handleUndo} disabled={!canUndo || isLoading['applyStyle']} className="p-2 rounded-md hover:bg-[var(--theme-bg-panel)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"><UndoIcon /></button>
                          <button onClick={handleRedo} disabled={!canRedo || isLoading['applyStyle']} className="p-2 rounded-md hover:bg-[var(--theme-bg-panel)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"><RedoIcon /></button>
                          {selectedPhoto?.compliance?.isCompliant && (
                              <button onClick={() => setViewMode(v => v === 'closeup' ? 'full' : 'closeup')} disabled={isLoading['applyStyle']} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                  <span>{viewMode === 'closeup' ? '查看全脸' : '查看特写'}</span>
                              </button>
                          )}
                          {selectedPhoto?.compliance?.isCompliant && viewMode === 'full' && (
                              <button onClick={() => setCroppingState({ isOpen: true, photo: selectedPhoto })} disabled={isLoading['applyStyle']} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" title="手动调整唇部区域">
                                  <CropIcon /><span>调整选区</span>
                              </button>
                          )}
                           {activeOperation && (
                             <>
                               <button onClick={handleSaveDesign} disabled={isLoading['applyStyle']} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                  <StarIcon filled={isCurrentDesignSaved} className={isCurrentDesignSaved ? 'text-yellow-400' : ''} /><span>{isCurrentDesignSaved ? '已收藏' : '收藏'}</span>
                               </button>
                               <button onClick={handleOpenSaveTemplateModal} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                  <BookmarkIcon className="w-5 h-5" /><span>存为模板</span>
                               </button>
                               <button onClick={() => setShareModalState({ isOpen: true, operation: activeOperation, originalUrl: selectedPhoto?.url })} disabled={isLoading['applyStyle']} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                  <ShareIcon /><span>分享</span>
                               </button>
                                <button onClick={handleGenerate3dModel} disabled={isLoading['applyStyle']} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                  <CubeTransparentIcon /><span>3D 预览</span>
                                </button>
                             </>
                           )}
                       </div>
                       <div className="flex items-center space-x-2">
                           {operationHistory.length > 0 && <button onClick={() => { const latestIndex = operationHistory.length - 1; setHistoryIndex(latestIndex); setActiveOperation(operationHistory[latestIndex]); }} disabled={isLoading['applyStyle']} className="px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">最新效果</button>}
                           {selectedPhoto?.lipCloseup && <button onClick={() => { setActiveOperation(null); setHistoryIndex(-1); }} disabled={isLoading['applyStyle']} className="px-3 py-1.5 text-sm bg-[var(--theme-bg-panel)] rounded-md hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">查看原始</button>}
                       </div>
                  </div>
                )}
            </div>
        </div>
    );
};

  const PhotoPanel = () => (
    <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center space-x-2 w-full px-3 py-3 bg-[var(--theme-bg-subtle)] text-[var(--theme-text-base)] font-semibold rounded-lg hover:bg-opacity-80 transition-all duration-200 active:scale-95"><UploadIcon /><span>上传</span></button>
            <button onClick={() => setCameraModalOpen(true)} className="flex items-center justify-center space-x-2 w-full px-3 py-3 bg-[var(--theme-bg-subtle)] text-[var(--theme-text-base)] font-semibold rounded-lg hover:bg-opacity-80 transition-all duration-200 active:scale-95"><CameraIcon /><span>拍摄</span></button>
        </div>
        {photos.length > 0 && <hr className="border-[var(--theme-border)]" />}
        <div className="space-y-3">
            {photos.length === 0 ? <p className="text-center text-sm text-[var(--theme-text-muted)] pt-8">您上传的照片会显示在这里。</p> : (
            photos.map(photo => (
                <div key={photo.id} onClick={() => setSelectedPhotoId(photo.id)} className={`p-2 rounded-lg flex items-center space-x-3 cursor-pointer transition-all duration-200 ${selectedPhotoId === photo.id ? 'bg-[var(--theme-indigo)] bg-opacity-20' : 'hover:bg-[var(--theme-bg-subtle)]'} active:scale-[0.98]`}>
                <img src={photo.url} alt={photo.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{photo.name}</p>
                    {isLoading[photo.id] ? <p className="text-xs text-[var(--theme-text-muted)]">AI分析中...</p> : ( photo.compliance && (
                        <div className="flex items-center text-xs mt-1">
                          {photo.compliance.isCompliant ? <CheckCircleIcon /> : <ExclamationCircleIcon title={photo.compliance.reason || ''} />}
                          <span className={`ml-1.5 ${photo.compliance.isCompliant ? 'text-green-500' : 'text-red-500'}`}>{photo.compliance.isCompliant ? '合规' : '不合规'}</span>
                        </div>
                    ))}
                </div>
                {photo.lipCloseup && <img src={photo.lipCloseup} alt="唇部特写" className="w-10 h-10 object-cover rounded-md flex-shrink-0 border-2 border-[var(--theme-bg-subtle)]" />}
                </div>
            )))}
        </div>
    </div>
  );
  
  const DesignPanel = () => {
      const [prompt, setPrompt] = useState('');
      if (!selectedPhoto?.compliance?.isCompliant) {
        return (
          <div className="p-4 text-center text-[var(--theme-text-muted)]"><ExclamationCircleIcon title="不合规" /><p className="mt-2 font-semibold text-[var(--theme-text-base)]">照片不合规</p><p className="text-sm mt-1">{selectedPhoto?.compliance?.reason}</p><p className="text-xs mt-4">请选择或上传一张符合要求的照片以启用设计功能。</p></div>
        );
      }

      const isRecommended = (preset: StylePreset): boolean => {
        if (!contextualAnalysis?.aestheticKeywords.length) return false;
        const presetText = `${preset.name} ${preset.description}`.toLowerCase();
        return contextualAnalysis.aestheticKeywords.some(keyword => presetText.includes(keyword.toLowerCase()));
      };

      return (
        <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
                 <button onClick={handleNewDesign} className="flex items-center justify-center space-x-1 w-full px-3 py-2 bg-[var(--theme-bg-subtle)] text-[var(--theme-text-base)] font-semibold rounded-lg hover:bg-opacity-80 transition-all duration-200 active:scale-95"><PlusIcon /><span>新设计</span></button>
                <button onClick={handleGenerateNineGrid} className="flex items-center justify-center space-x-1 w-full px-3 py-2 bg-[var(--theme-bg-subtle)] text-[var(--theme-text-base)] font-semibold rounded-lg hover:bg-opacity-80 transition-all duration-200 active:scale-95"><GridIcon /><span>一键九宫格</span></button>
            </div>
            <div>
                <div className="flex justify-between items-center mb-2"><h3 className="font-semibold text-sm">AI 智能建议</h3><button onClick={handleRefreshSuggestions} disabled={isLoading['suggestions']} className="p-1 rounded-full hover:bg-[var(--theme-bg-subtle)] text-[var(--theme-text-muted)] disabled:opacity-50 transition-transform duration-200 active:scale-90 active:rotate-45"><RefreshIcon /></button></div>
                <div className="space-y-2">
                    {styleSuggestions.map((suggestion, i) => {
                       const isApplying = isLoading['applyStyle'] && activeStylePrompt === suggestion.prompt;
                       return (<button key={i} onClick={() => handleApplyStyle(suggestion.prompt, 'suggestion')} title={suggestion.reason} disabled={isLoading['applyStyle']} className={`w-full text-left p-3 bg-[var(--theme-bg-subtle)] rounded-lg text-sm transition-all duration-200 hover:ring-2 hover:ring-[var(--theme-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-between ${isApplying ? 'animate-pulse' : ''}`}><span>{suggestion.prompt}</span>{isApplying && <SpinnerIcon />}</button>)
                    })}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-sm mb-2">风格预设</h3>
                <div className="grid grid-cols-2 gap-2">
                    {STYLE_PRESETS.map((preset, i) => {
                       const isApplying = isLoading['applyStyle'] && activeStylePrompt === preset.prompt;
                       const recommended = isRecommended(preset);
                       return (
                         <button 
                            key={i} 
                            onClick={() => handleApplyStyle(preset.prompt)} 
                            title={preset.description}
                            disabled={isLoading['applyStyle']} 
                            className={`relative p-3 bg-[var(--theme-bg-subtle)] rounded-lg text-sm text-center transition-all duration-200 hover:ring-2 hover:ring-[var(--theme-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] ${isApplying ? 'animate-pulse' : ''} ${recommended ? 'ring-2 ring-offset-2 ring-offset-[var(--theme-bg-panel)] ring-yellow-400' : ''}`}
                          >
                           {recommended && (
                               <div className="absolute -top-1.5 -right-1.5" title="根据当前美学方案推荐">
                                   <StarIcon filled className="w-4 h-4 text-yellow-400" />
                               </div>
                           )}
                           {isApplying ? <SpinnerIcon /> : <span>{preset.name}</span>}
                         </button>
                       );
                    })}
                </div>
            </div>
            <div className="relative">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2} placeholder="或输入您的自然语言指令..." className="w-full p-2 pr-10 border border-[var(--theme-border)] rounded-md text-sm bg-[var(--theme-bg-panel)] focus:ring-2 focus:ring-[var(--theme-ring)] focus:border-[var(--theme-ring)]"></textarea>
                <button onClick={() => handleApplyStyle(prompt, 'text')} disabled={!prompt || isLoading['applyStyle']} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--theme-indigo)] text-white disabled:bg-gray-400 transition-transform active:scale-90"><SparklesIcon className="w-4 h-4" /></button>
            </div>
            {(aestheticPlan || makeupSuggestion) && !isLoading['planAndSuggestions'] && (
              <button 
                onClick={handleGetActionableIntent}
                disabled={isLoadingIntent}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[var(--theme-bg-subtle)] text-[var(--theme-text-base)] font-semibold rounded-lg hover:bg-opacity-80 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingIntent ? <SpinnerIcon /> : <SparklesIcon className="w-5 h-5" />}
                <span>获取 AI 下一步建议</span>
              </button>
            )}
             {(aestheticPlan || isLoading['planAndSuggestions']) && (
              <div className="mt-4">
                <button onClick={() => setIsAestheticPlanVisible(v => !v)} className="w-full flex justify-between items-center p-3 bg-[var(--theme-bg-subtle)] rounded-lg text-sm transition-all duration-200 hover:bg-opacity-80 disabled:cursor-not-allowed" disabled={isLoading['planAndSuggestions'] && !aestheticPlan}>
                  <h3 className="font-semibold text-sm text-[var(--theme-text-base)]">AI 美学方案</h3>
                  {isLoading['planAndSuggestions'] && !aestheticPlan ? <SpinnerIcon className="w-4 h-4" /> : <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isAestheticPlanVisible ? 'rotate-180' : ''}`} />}
                </button>
                {isAestheticPlanVisible && aestheticPlan && <div className="mt-2"><AestheticPlanDisplay plan={aestheticPlan} /></div>}
              </div>
            )}
            {(makeupSuggestion || isLoading['planAndSuggestions']) && (
              <div className="mt-4">
                <button onClick={() => setIsMakeupSuggestionVisible(v => !v)} className="w-full flex justify-between items-center p-3 bg-[var(--theme-bg-subtle)] rounded-lg text-sm transition-all duration-200 hover:bg-opacity-80 disabled:cursor-not-allowed" disabled={isLoading['planAndSuggestions'] && !makeupSuggestion}>
                  <h3 className="font-semibold text-sm text-[var(--theme-text-base)]">AI 配套妆容</h3>
                  {isLoading['planAndSuggestions'] && !makeupSuggestion ? <SpinnerIcon className="w-4 h-4" /> : <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isMakeupSuggestionVisible ? 'rotate-180' : ''}`} />}
                </button>
                {isMakeupSuggestionVisible && makeupSuggestion && <div className="mt-2"><MakeupSuggestionDisplay suggestion={makeupSuggestion} /></div>}
              </div>
            )}
        </div>
      )
  };

  const HistoryPanel = () => {
    const reversedHistory = useMemo(() => [...operationHistory].reverse(), [operationHistory]);
    const activeReversedIndex = historyIndex > -1 ? operationHistory.length - 1 - historyIndex : -1;
    return (
      <div className="p-4">
        {reversedHistory.length === 0 ? <p className="text-center text-[var(--theme-text-muted)] text-sm pt-8">暂无历史记录</p> : (
          <div className="space-y-2">
            {reversedHistory.map((op, index) => (
              <div key={op.id} onClick={() => handleHistorySelect(op)} className={`p-2 rounded-lg flex items-center space-x-3 cursor-pointer transition-all duration-200 active:scale-[0.98] ${index === activeReversedIndex ? 'bg-[var(--theme-indigo)] bg-opacity-20 ring-2 ring-[var(--theme-indigo)]' : 'bg-[var(--theme-bg-subtle)] hover:ring-2 hover:ring-[var(--theme-ring)]'}`}>
                <img src={op.resultUrl} alt={op.prompt} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="font-medium truncate text-sm">{op.prompt}</p><p className="text-xs text-[var(--theme-text-muted)]">{new Date(op.timestamp).toLocaleString()}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const SavedPanel = () => (
    <div className="p-4">
        {savedDesigns.length === 0 ? <p className="text-center text-[var(--theme-text-muted)] text-sm pt-8">您收藏的设计会显示在这里。</p> : (
            <div className="space-y-3">
                {savedDesigns.map(design => {
                    const originalPhoto = photos.find(p => p.id === design.photoId);
                    return (
                        <div key={design.id} className="p-3 rounded-lg bg-[var(--theme-bg-subtle)] space-y-2">
                            <div className="flex items-start space-x-3">
                                <img src={design.operation.resultUrl} alt={design.operation.prompt} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate text-sm">{design.operation.prompt}</p>
                                    <p className="text-xs text-[var(--theme-text-muted)] mt-1">保存于: {new Date(design.savedAt).toLocaleDateString()}</p>
                                    {originalPhoto && <p className="text-xs text-[var(--theme-text-muted)]">原图: {originalPhoto.name}</p>}
                                </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <button onClick={() => handleDeleteDesign(design.id)} className="p-1.5 rounded-full hover:bg-[var(--theme-bg-panel)] transition-colors"><TrashIcon /></button>
                                <button onClick={() => handleLoadDesign(design)} className="px-4 py-1.5 text-sm bg-[var(--theme-indigo)] text-white font-semibold rounded-lg hover:bg-[var(--theme-indigo-hover)] transition-all duration-200 active:scale-95">加载</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );

  const TemplatesPanel = () => (
    <div className="p-4 space-y-4">
        <button onClick={() => setImportModalOpen(true)} className="flex items-center justify-center space-x-2 w-full px-3 py-3 bg-[var(--theme-bg-subtle)] text-[var(--theme-text-base)] font-semibold rounded-lg hover:bg-opacity-80 transition-all duration-200 active:scale-95"><UploadIcon /><span>导入模板</span></button>
        {templates.length === 0 ? <p className="text-center text-[var(--theme-text-muted)] text-sm pt-8">您保存的模板会显示在这里。</p> : (
            <div className="space-y-3">
                {templates.map(template => (
                    <div key={template.id} className="p-3 rounded-lg bg-[var(--theme-bg-subtle)] space-y-2">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate text-sm">{template.name}</h4>
                            <p className="text-xs text-[var(--theme-text-muted)] mt-1">{template.description}</p>
                            <p className="text-xs font-mono bg-[var(--theme-bg-panel)] p-1 rounded mt-1 truncate" title={template.prompt}>{template.prompt}</p>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleDeleteTemplate(template.id)} className="p-1.5 rounded-full hover:bg-[var(--theme-bg-panel)] transition-colors" title="删除"><TrashIcon /></button>
                            <button onClick={() => handleExportTemplate(template)} className="p-1.5 rounded-full hover:bg-[var(--theme-bg-panel)] transition-colors" title="分享/导出"><ShareIcon /></button>
                            <button onClick={() => handleApplyTemplate(template.prompt)} className="px-4 py-1.5 text-sm bg-[var(--theme-indigo)] text-white font-semibold rounded-lg hover:bg-[var(--theme-indigo-hover)] transition-all duration-200 active:scale-95">应用</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const SimpleMarkdownRenderer = ({ text }: { text: string | undefined }) => {
    if (!text) return <div className="min-h-[1em]"></div>;

    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="text-[var(--theme-text-muted)] text-sm leading-relaxed space-y-2">
            {lines.map((line, index) => {
                let processedLine = line.trim();

                // Handle bold **text** -> <strong>text</strong>
                processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                // Handle list items '* text' or '- text'
                if (processedLine.startsWith('* ') || processedLine.startsWith('- ')) {
                    const content = processedLine.substring(2);
                    return (
                        <div key={index} className="flex">
                            <span className="mr-2 text-[var(--theme-indigo)]">•</span>
                            <p className="flex-1" dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    );
                }

                // Handle simple paragraphs
                return <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />;
            })}
        </div>
    );
  };

  const AestheticPlanDisplay = ({ plan }: { plan: AestheticPlan | null }) => {
    if (!plan) return null;
    const planItems = [
      { key: "injectionPlan", icon: <SyringeIcon />, title: "注射方案", content: plan.injectionPlan },
      { key: "volumeAndShapePlan", icon: <CubeIcon />, title: "容量与形态", content: plan.volumeAndShapePlan },
      { key: "lipLinerPlan", icon: <PencilIcon />, title: "唇线与纹色", content: plan.lipLinerPlan },
      { key: "makeupPlan", icon: <LipstickIcon />, title: "妆容修饰", content: plan.makeupPlan },
    ];
    return (
        <div className="space-y-4">
            {planItems.map(item => (
                item.content && (
                    <div key={item.title} className="bg-[var(--theme-bg-subtle)] p-4 rounded-lg">
                        <h4 className="font-semibold flex items-center text-sm text-[var(--theme-text-base)]">
                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[var(--theme-indigo)]">{item.icon}</span>
                            <span className="ml-2">{item.title}</span>
                        </h4>
                        <div className="mt-2">
                          <SimpleMarkdownRenderer text={item.content} />
                        </div>
                    </div>
                )
            ))}
        </div>
    );
  };
  
  const MakeupSuggestionDisplay = ({ suggestion }: { suggestion: MakeupSuggestion | null }) => {
    if (!suggestion) return null;
    const suggestionItems = [
      { key: "overallLook", icon: <SparklesIcon className="w-5 h-5" />, title: "整体风格", content: suggestion.overallLook },
      { key: "eyeshadow", icon: <EyeIcon />, title: "眼妆建议", content: suggestion.eyeshadow },
      { key: "blush", icon: <FaceBlushIcon />, title: "腮红建议", content: suggestion.blush },
    ];
    return (
        <div className="space-y-4">
            {suggestionItems.map(item => (
                item.content && (
                    <div key={item.title} className="bg-[var(--theme-bg-subtle)] p-4 rounded-lg">
                        <h4 className="font-semibold flex items-center text-sm text-[var(--theme-text-base)]">
                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[var(--theme-indigo)]">{item.icon}</span>
                            <span className="ml-2">{item.title}</span>
                        </h4>
                        <div className="mt-2">
                            <SimpleMarkdownRenderer text={item.content} />
                        </div>
                    </div>
                )
            ))}
        </div>
    );
  };

  const CameraModal = ({ isOpen, onClose, onCapture }: { isOpen: boolean, onClose: () => void, onCapture: (url: string) => void }) => {
    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                if (videoRef.current) videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }).catch(() => { alert("无法访问相机。请检查浏览器权限。"); onClose(); });
        } else if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, [isOpen, onClose]);
    const handleCapture = () => {
        const video = videoRef.current; if (!video) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/png'));
        onClose();
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-[var(--theme-bg-panel)] rounded-lg p-4 max-w-lg w-full">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-md"></video>
                <div className="flex justify-center mt-4"><button onClick={handleCapture} className="p-4 bg-[var(--theme-indigo)] rounded-full text-white transition-transform active:scale-95"><CameraIcon /></button></div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-white transition-transform active:scale-90"><XIcon /></button>
        </div>
    );
  };
  
  const NineGridModal = () => {
    const { isOpen, isLoading, results, suggestions, error, loadingIndices } = nineGridModalState;
    if (!isOpen) return null;
    const handleSelect = (index: number) => {
        const url = results[index]; 
        const prompt = suggestions[index]?.prompt;
        if(url && prompt && prompt !== "AI suggestion generation failed") { 
            handleApplyStyle(prompt, 'nine-grid'); 
            setNineGridModalState({ isOpen: false, isLoading: false, results: [], suggestions: [], error: null, loadingIndices: [] }); 
        }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--theme-bg-panel)] rounded-xl p-4 md:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">一键九宫格设计</h2>
            <div className="flex items-center space-x-2">
                <button onClick={handleSaveAllNineGrid} disabled={isLoading || results.some(r => r === null)} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-[var(--theme-bg-subtle)] rounded-md hover:bg-opacity-80 disabled:opacity-50 transition-transform active:scale-95"><DownloadIcon /><span>全部保存</span></button>
                <button onClick={() => setNineGridModalState({ isOpen: false, isLoading: false, results: [], suggestions: [], error: null, loadingIndices: [] })} className="p-2 rounded-full hover:bg-[var(--theme-bg-subtle)] transition-transform active:scale-90"><XIcon /></button>
            </div>
          </div>
          {isLoading && results.every(r => r === null) && <div className="flex-1 flex items-center justify-center text-[var(--theme-text-muted)]">AI正在全力生成中...</div>}
          {error && <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>}
          {!error && (
            <div className="grid grid-cols-3 gap-2 md:gap-4 flex-1 overflow-y-auto">
              {Array.from({ length: 9 }).map((_, i) => {
                const url = results[i];
                const suggestion = suggestions[i];
                const isCellLoading = loadingIndices.includes(i);
                
                return (
                    <div key={i} className="aspect-square bg-[var(--theme-bg-subtle)] rounded-lg flex flex-col overflow-hidden group">
                        <div className="flex-1 relative min-h-0">
                            {url ? (
                                <img src={url} className="w-full h-full object-cover" alt={suggestion?.description || `Design ${i+1}`} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[var(--theme-text-muted)]">
                                    {isCellLoading || (isLoading && !suggestion) ? (
                                        <SpinnerIcon className="w-6 h-6" />
                                    ) : (
                                        <>
                                            <ExclamationCircleIcon title="生成失败" />
                                            {suggestion?.prompt !== "AI suggestion generation failed" && (
                                                <button onClick={() => handleRetryNineGridImage(i)} className="mt-2 px-2 py-1 text-xs bg-[var(--theme-indigo)] text-white rounded-md hover:bg-[var(--theme-indigo-hover)] transition-colors active:scale-95">重试</button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {url && suggestion && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity space-x-2">
                                  <button onClick={() => setZoomModalProps({ isOpen: true, imageUrl: url, prompt: suggestion.prompt, onSelect: () => handleSelect(i) })} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-transform active:scale-90"><ExpandIcon /></button>
                                  <button onClick={() => downloadImage(url, `design-${i+1}.png`)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-transform active:scale-90"><DownloadIcon /></button>
                                  <button onClick={() => handleSelect(i)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-transform active:scale-90"><CheckIcon /></button>
                                </div>
                            )}
                        </div>
                        {suggestion && (
                            <div className="flex-shrink-0 p-2 text-center bg-[var(--theme-bg-panel)]">
                                <p className="text-xs font-semibold text-[var(--theme-text-base)] truncate" title={suggestion.description}>{suggestion.description}</p>
                                <p className="text-[10px] text-[var(--theme-text-muted)] truncate" title={suggestion.keywords}>{suggestion.keywords}</p>
                            </div>
                        )}
                    </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const ZoomableImageModal = () => {
    const { isOpen, imageUrl, prompt, onSelect } = zoomModalProps;
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const containerRef = useRef<HTMLDivElement>(null);
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault(); if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
        setTransform(prev => {
            const newScale = Math.min(Math.max(0.5, prev.scale - e.deltaY * 0.001), 5);
            if (newScale === prev.scale) return prev;
            const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
            const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
            return { scale: newScale, x: newX, y: newY };
        });
    };
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX - transform.x, startY = e.clientY - transform.y;
        const onMouseMove = (moveEvent: MouseEvent) => setTransform(prev => ({ ...prev, x: moveEvent.clientX - startX, y: moveEvent.clientY - startY }));
        const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
    useEffect(() => setTransform({ x: 0, y: 0, scale: 1 }), [imageUrl]);
    if (!isOpen || !imageUrl) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-[100] p-4">
            <div className="flex justify-between items-center text-white flex-shrink-0 mb-4">
                <div className="flex-1 min-w-0">{prompt && <p className="truncate text-sm font-semibold">{prompt}</p>}</div>
                <div className="flex items-center space-x-2">
                    {onSelect && <button onClick={onSelect} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white/20 rounded-md hover:bg-white/30 transition-transform active:scale-95"><CheckIcon /><span>选择此设计</span></button>}
                    <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="px-3 py-1.5 text-sm bg-white/20 rounded-md hover:bg-white/30 transition-transform active:scale-95">重置</button>
                    <button onClick={() => setZoomModalProps({ isOpen: false, imageUrl: null })} className="p-2 rounded-full hover:bg-white/20 transition-transform active:scale-90"><XIcon /></button>
                </div>
            </div>
            <div ref={containerRef} className="flex-1 overflow-hidden" onWheel={handleWheel}><img src={imageUrl} className="cursor-grab active:cursor-grabbing" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: 'transform 0.2s ease-out', }} onMouseDown={handleMouseDown} alt="可缩放预览" /></div>
        </div>
    );
};
  
  const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => (document.documentElement.className.match(/(theme-\S+ \S+|dark|light)/)?.[0] as Theme) || 'theme-sakura-pink light');
    const [currentSize, setCurrentSize] = useState<FontSize>(document.documentElement.className.split(' ').find(c => c.startsWith('font-')) as FontSize || 'font-md');
    const applyTheme = (theme: Theme) => {
        document.documentElement.className = document.documentElement.className.replace(/(theme-\S+ \S+|dark|light)/g, '').trim();
        document.documentElement.classList.add(...theme.split(' '));
        setCurrentTheme(theme);
    };
    const applyFontSize = (size: FontSize) => {
        document.documentElement.className = document.documentElement.className.replace(/font-\S+/g, '').trim();
        document.documentElement.classList.add(size);
        setCurrentSize(size);
    };
    const themes: { name: string; value: Theme }[] = [
      { name: '樱花粉', value: 'theme-sakura-pink light' }, { name: '薰衣草', value: 'theme-lavender-haze light' },
      { name: '薄荷青', value: 'theme-minty-fresh light' }, { name: '丝绒夜', value: 'theme-velvet-night dark' }, { name: '默认暗色', value: 'dark' },
    ];
    const fontSizes: { name: string, value: FontSize }[] = [{ name: '小', value: 'font-sm' }, { name: '中', value: 'font-md' }, { name: '大', value: 'font-lg' }];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-[var(--theme-bg-panel)] rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">设置</h2><button onClick={onClose} className="transition-transform active:scale-90"><XIcon /></button></div>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">主题皮肤</h3>
                    <div className="grid grid-cols-2 gap-2">{themes.map(theme => (<button key={theme.value} onClick={() => applyTheme(theme.value)} className={`p-2 rounded-md border-2 transition-transform active:scale-95 ${currentTheme === theme.value ? 'border-[var(--theme-indigo)]' : 'border-[var(--theme-border)] hover:border-[var(--theme-ring)]'}`}><span>{theme.name}</span></button>))}</div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">字号大小</h3>
                    <div className="flex space-x-2">{fontSizes.map(size => (<button key={size.value} onClick={() => applyFontSize(size.value)} className={`px-4 py-2 rounded-md border-2 transition-transform active:scale-95 ${currentSize === size.value ? 'bg-[var(--theme-indigo)] text-white border-[var(--theme-indigo)]' : 'bg-[var(--theme-bg-subtle)] border-transparent'}`}>{size.name}</button>))}</div>
                </div>
            </div>
        </div>
      </div>
    );
  };
  
  const CollapsibleSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
      const [isOpen, setIsOpen] = useState(false);
      return (
          <div className="border-t border-[var(--theme-border)] py-2">
              <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-semibold text-[var(--theme-text-base)]"><span>{title}</span><ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} /></button>
              {isOpen && <div className="mt-2 text-sm text-[var(--theme-text-muted)] space-y-2 prose prose-sm max-w-none prose-p:my-1">{children}</div>}
          </div>
      );
  };

  const AboutModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-[var(--theme-bg-panel)] rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0"><h2 className="text-lg font-bold">关于 AI 唇部美学设计师</h2><button onClick={onClose} className="transition-transform active:scale-90"><XIcon /></button></div>
            <div className="space-y-2 text-sm text-[var(--theme-text-muted)] overflow-y-auto pr-2">
              <p>本应用利用先进的 AI 技术，帮助医美从业者和求美者直观地设计、预览和沟通唇部美学方案。</p>
              <CollapsibleSection title="医疗信息免责声明"><p>本应用提供的所有信息、设计和建议仅供参考，不能替代执业医师的专业医疗诊断、建议或治疗。任何医疗决策都应在咨询合格医疗专业人员后做出。对于因使用本应用内容而导致的任何后果，开发者不承担任何责任。</p></CollapsibleSection>
              <CollapsibleSection title="AI生成内容免责声明"><p>本应用生成的设计效果、美学方案及所有文本内容均由人工智能模型创建，可能存在不准确之处。这些内容不代表专业医疗意见，仅作为美学沟通的辅助工具。请用户在使用时自行判断其合理性。</p></CollapsibleSection>
              <CollapsibleSection title="隐私保护声明"><p>我们高度重视您的隐私。您上传的照片仅在您的设备上进行处理和临时存储，用于AI分析和设计，不会上传至我们的服务器进行永久保存。我们不会收集或分享您的任何个人身份信息。所有操作历史和收藏均存储在您本地浏览器的存储空间中。</p></CollapsibleSection>
              <CollapsibleSection title="欢迎关注">
                <div className="flex flex-col items-center justify-center p-2">
                  <img src="https://docs.bccsw.cn/sooogooo.png" alt="QR Code" className="w-32 h-32 rounded-md" />
                  <p className="mt-2 text-xs">扫码关注，获取更多资讯</p>
                </div>
              </CollapsibleSection>
              <div className="border-t border-[var(--theme-border)] pt-4 mt-4 text-xs space-y-1">
                <p><strong>版本:</strong> 0.7.6</p><p><strong>部署时间:</strong> 2025年9月12日</p><p><strong>联系方式:</strong> <a href="mailto:yuxiaodong@beaucare.org" className="text-[var(--theme-indigo)] hover:underline">yuxiaodong@beaucare.org</a></p>
              </div>
            </div>
        </div>
      </div>
    );
  };
  
  const HowToUseModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
      if (!isOpen) return null;
      
      const steps = [
        { title: "1. 上传照片", content: "点击“照片”面板中的“上传”或“拍摄”按钮，选择一张清晰的正面人脸照片。AI会自动检查照片是否合规并提取唇部特写。" },
        { title: "2. 开始设计", content: "在“设计”面板中，您可以在“风格预设”里快速应用常见样式，使用AI智能建议，或在文本框中输入自然语言指令（如“让上唇更丰满一些”）生成效果。" },
        { title: "3. 对比效果", content: "生成设计后，您可以在主预览区拖动滑块，直观地对比原始照片和设计后的效果。您也可以切换“查看全脸”和“查看特写”模式。" },
        { title: "4. 管理历史", content: "您所有的设计操作都会记录在“历史”面板中。您可以使用画布下方的撤销/重做按钮，或直接点击历史记录来切换不同的设计版本。" },
        { title: "5. 收藏与分享", content: "遇到喜欢的设计，点击画布下方的“收藏”按钮保存到“收藏”面板。点击“分享”按钮可以下载效果图或生成精美的“前后对比图”。" },
        { title: "6. 使用模板", content: "您可以将满意的设计指令“存为模板”。在“模板”面板中，您可以管理、分享或将模板应用到新的照片上，实现快速风格复用。" }
      ];

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
          <div className="bg-[var(--theme-bg-panel)] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-bold">使用方法指南</h2>
                <button onClick={onClose} className="transition-transform active:scale-90"><XIcon /></button>
              </div>
              <div className="space-y-4 text-sm text-[var(--theme-text-muted)] overflow-y-auto pr-2">
                {steps.map((step, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-[var(--theme-text-base)] mb-1">{step.title}</h3>
                    <p>{step.content}</p>
                  </div>
                ))}
              </div>
          </div>
        </div>
      );
    };

  const LipCropTool = ({ isOpen, photo, onClose, onConfirm }: { isOpen: boolean; photo: Photo | null; onClose: () => void; onConfirm: (photoId: string, newCloseupUrl: string, cropRect: { x: number, y: number, width: number, height: number }) => void; }) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const [cropRect, setCropRect] = useState({ x: 0.25, y: 0.25, width: 0.5, height: 0.5 });
    const [interaction, setInteraction] = useState<{ type: string, startX: number, startY: number, startRect: typeof cropRect } | null>(null);
    useEffect(() => { if (isOpen && photo) setCropRect(photo.manualCropRect || { x: 0.3, y: 0.3, width: 0.4, height: 0.4 }); }, [isOpen, photo]);
    const handleMouseDown = (e: React.MouseEvent, type: string) => { e.preventDefault(); e.stopPropagation(); setInteraction({ type, startX: e.clientX, startY: e.clientY, startRect: cropRect }); };
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!interaction || !imageRef.current) return;
        e.preventDefault(); e.stopPropagation();
        const { clientWidth, clientHeight } = imageRef.current;
        const dx = (e.clientX - interaction.startX) / clientWidth; const dy = (e.clientY - interaction.startY) / clientHeight;
        setCropRect(() => {
            let { x, y, width, height } = interaction.startRect; const type = interaction.type;
            if (type === 'move') { x += dx; y += dy; }
            else {
                let dWidth = 0, dHeight = 0;
                if (type.includes('right')) dWidth = dx; if (type.includes('left')) { dWidth = -dx; x += dx; }
                if (type.includes('bottom')) dHeight = dy; if (type.includes('top')) { dHeight = -dy; y += dy; }
                const delta = Math.max(Math.abs(dWidth), Math.abs(dHeight)) * Math.sign(dWidth || dHeight);
                width += delta; height += delta; if (type.includes('left')) x -= delta; if (type.includes('top')) y -= delta;
            }
            width = Math.max(0.1, Math.min(width, 1)); height = width;
            x = Math.max(0, Math.min(x, 1 - width)); y = Math.max(0, Math.min(y, 1 - height));
            return { x, y, width, height };
        });
    }, [interaction]);
    const handleMouseUp = useCallback(() => setInteraction(null), []);
    useEffect(() => {
        if (interaction) {
            window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
            return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
        }
    }, [interaction, handleMouseMove, handleMouseUp]);
    const handleConfirm = () => {
        if (!photo || !imageRef.current) return;
        const image = imageRef.current, canvas = document.createElement('canvas');
        const { naturalWidth, naturalHeight } = image;
        const sx = cropRect.x * naturalWidth, sy = cropRect.y * naturalHeight;
        const sWidth = cropRect.width * naturalWidth, sHeight = cropRect.height * naturalHeight;
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d'); if(!ctx) return;
        ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        onConfirm(photo.id, canvas.toDataURL('image/jpeg', 0.9), cropRect);
    };
    if (!isOpen || !photo) return null;
    const cropBoxStyle = { left: `${cropRect.x * 100}%`, top: `${cropRect.y * 100}%`, width: `${cropRect.width * 100}%`, height: `${cropRect.height * 100}%` };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex flex-col items-center justify-center p-4">
            <div className="relative w-full h-full max-w-4xl max-h-[80vh]"><img ref={imageRef} src={photo.url} alt="Crop" className="w-full h-full object-contain" /><div className="absolute top-0 left-0 w-full h-full"><div className="absolute border-2 border-dashed border-white cursor-move" style={cropBoxStyle} onMouseDown={(e) => handleMouseDown(e, 'move')}><div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize" onMouseDown={(e) => handleMouseDown(e, 'top-left')}></div><div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize" onMouseDown={(e) => handleMouseDown(e, 'top-right')}></div><div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize" onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}></div><div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize" onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}></div></div></div></div>
            <div className="flex items-center space-x-4 mt-4"><button onClick={onClose} className="px-6 py-2 bg-[var(--theme-bg-subtle)] text-[var(--theme-text-base)] font-semibold rounded-lg hover:bg-opacity-80 transition-all duration-200 active:scale-95">取消</button><button onClick={handleConfirm} className="px-6 py-2 bg-[var(--theme-indigo)] text-white font-semibold rounded-lg hover:bg-[var(--theme-indigo-hover)] transition-all duration-200 active:scale-95">确认</button></div>
        </div>
    );
  };
  
const ShareModal = ({ isOpen, onClose, operation, originalUrl }: { isOpen: boolean; onClose: () => void; operation: OperationHistory | null; originalUrl: string | null; }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [comparisonImageUrl, setComparisonImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setComparisonImageUrl(null);
            return;
        }

        let isCancelled = false;
        
        const generateShareCard = async () => {
            setIsGenerating(true);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx || !operation || !originalUrl) {
                if (!isCancelled) setIsGenerating(false);
                return;
            }

            const qrCodeImg = new Image();
            qrCodeImg.crossOrigin = 'anonymous';
            const originalImg = new Image();
            originalImg.crossOrigin = 'anonymous';
            const resultImg = new Image();
            resultImg.crossOrigin = 'anonymous';

            try {
                await Promise.all([
                    new Promise((res, rej) => { qrCodeImg.onload = res; qrCodeImg.onerror = rej; qrCodeImg.src = 'https://docs.bccsw.cn/sooogooo.png'; }),
                    new Promise((res, rej) => { originalImg.onload = res; originalImg.onerror = rej; originalImg.src = originalUrl; }),
                    new Promise((res, rej) => { resultImg.onload = res; resultImg.onerror = rej; resultImg.src = operation.fullResultUrl; }),
                ]);
            } catch (error) {
                console.error("Error loading images for share card:", error);
                if (!isCancelled) setIsGenerating(false);
                return;
            }

            if (isCancelled) return;
            
            const W = 1200, H = 1200;
            canvas.width = W;
            canvas.height = H;

            const style = getComputedStyle(document.documentElement);
            const bgColor = style.getPropertyValue('--theme-bg-panel').trim() || '#ffffff';
            const subtleBgColor = style.getPropertyValue('--theme-bg-subtle').trim() || '#f9fafb';
            const textColor = style.getPropertyValue('--theme-text-base').trim() || '#1f2937';
            const mutedColor = style.getPropertyValue('--theme-text-muted').trim() || '#6b7280';

            const gradient = ctx.createLinearGradient(0, 0, 0, H);
            gradient.addColorStop(0, subtleBgColor);
            gradient.addColorStop(1, bgColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, W, H);
            
            ctx.fillStyle = textColor;
            ctx.font = 'bold 52px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('AI 唇部美学设计', W / 2, 110);
            
            const drawRoundedImage = (img: HTMLImageElement, x: number, y: number, w: number, h: number, r: number) => {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
                ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
                ctx.fill(); ctx.shadowColor = 'transparent';
                ctx.clip(); ctx.drawImage(img, x, y, w, h); ctx.restore();
            };

            const imgPadding = 100;
            const imgGap = 50;
            const imgWidth = (W - imgPadding * 2 - imgGap) / 2;
            const imgHeight = (originalImg.height / originalImg.width) * imgWidth;
            const imgY = 180;
            
            ctx.font = '32px sans-serif';
            ctx.fillStyle = mutedColor;
            ctx.textAlign = 'center';
            ctx.fillText('Before · 原始', imgPadding + imgWidth / 2, imgY - 20);
            ctx.fillText('After · 设计后', imgPadding + imgWidth + imgGap + imgWidth / 2, imgY - 20);

            drawRoundedImage(originalImg, imgPadding, imgY, imgWidth, imgHeight, 20);
            drawRoundedImage(resultImg, imgPadding + imgWidth + imgGap, imgY, imgWidth, imgHeight, 20);
            
            const promptY = imgY + imgHeight + 90;
            ctx.fillStyle = textColor;
            ctx.font = `italic 32px sans-serif`;
            ctx.textAlign = 'center';
            
            const wrapText = (txt: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
                let line = ''; let currentY = y;
                for (let i = 0; i < txt.length; i++) {
                    const testLine = line + txt[i];
                    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
                        ctx.fillText(line, x, currentY); line = txt[i]; currentY += lineHeight;
                    } else { line = testLine; }
                }
                ctx.fillText(line, x, currentY);
            };
            
            wrapText(`“${operation.prompt}”`, W / 2, promptY, W - imgPadding * 2, 48);

            const footerY = H - 200;
            ctx.strokeStyle = mutedColor; ctx.globalAlpha = 0.3; ctx.beginPath();
            ctx.moveTo(imgPadding, footerY); ctx.lineTo(W - imgPadding, footerY);
            ctx.stroke(); ctx.globalAlpha = 1.0;
            
            const qrSize = 150;
            ctx.drawImage(qrCodeImg, W - imgPadding - qrSize, footerY + 25, qrSize, qrSize);
            
            ctx.fillStyle = textColor; ctx.textAlign = 'left'; ctx.font = 'bold 36px sans-serif';
            ctx.fillText('唇相人相世相', imgPadding, footerY + 85);
            
            ctx.fillStyle = mutedColor; ctx.font = '28px sans-serif';
            ctx.fillText('扫码体验 AI 唇部美学设计', imgPadding, footerY + 135);
            
            setComparisonImageUrl(canvas.toDataURL('image/png'));
            if (!isCancelled) setIsGenerating(false);
        };

        generateShareCard();
        return () => { isCancelled = true; };
    }, [isOpen, operation, originalUrl]);

    if (!isOpen || !operation) return null;

    const showSpinner = isGenerating || (isOpen && !comparisonImageUrl);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-bg-panel)] rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">分享设计</h2><button onClick={onClose}><XIcon /></button></div>
                <div className="flex-1 flex items-center justify-center bg-[var(--theme-bg-subtle)] rounded-md overflow-hidden min-h-[200px]">
                    {showSpinner ? (
                        <SpinnerIcon className="w-10 h-10" />
                    ) : comparisonImageUrl ? (
                        <img src={comparisonImageUrl} alt="Comparison" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <p>无法生成对比图</p>
                    )}
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="flex-shrink-0 flex items-center justify-end space-x-2 mt-4">
                    <button onClick={() => downloadImage(operation.fullResultUrl, 'lip-design-result.png')} className="px-4 py-2 text-sm bg-[var(--theme-bg-subtle)] rounded-md hover:bg-opacity-80">下载效果图</button>
                    <button onClick={() => downloadImage(comparisonImageUrl, 'lip-design-comparison.png')} disabled={!comparisonImageUrl || isGenerating} className="px-4 py-2 text-sm bg-[var(--theme-indigo)] text-white rounded-md hover:bg-[var(--theme-indigo-hover)] disabled:opacity-50">下载分享图</button>
                </div>
            </div>
        </div>
    );
};
  
const SaveTemplateModal = ({ isOpen, onClose, onSave, prompt, isLoadingDetails, initialDetails }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (name: string, description: string, prompt: string) => void; 
    prompt: string | null;
    isLoadingDetails: boolean;
    initialDetails: TemplateDetails | null;
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen && initialDetails) {
            setName(initialDetails.name);
            setDescription(initialDetails.description);
        } else if (!isOpen) {
            setName('');
            setDescription('');
        }
    }, [isOpen, initialDetails]);

    if (!isOpen || !prompt) return null;

    const handleSave = () => {
        if (!name.trim() || !description.trim()) {
            alert("请填写模板名称和描述。");
            return;
        }
        onSave(name, description, prompt);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-bg-panel)] rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">保存为模板</h2>
                {isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <SpinnerIcon className="w-8 h-8 text-[var(--theme-indigo)]" />
                        <p className="mt-4 text-sm text-[var(--theme-text-muted)]">AI 正在生成名称和描述...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">模板名称</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-[var(--theme-border)] rounded-md text-sm bg-[var(--theme-bg-panel)] focus:ring-2 focus:ring-[var(--theme-ring)]" /></div>
                        <div><label className="block text-sm font-medium mb-1">模板描述</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 border border-[var(--theme-border)] rounded-md text-sm bg-[var(--theme-bg-panel)] focus:ring-2 focus:ring-[var(--theme-ring)]"></textarea></div>
                        <div><label className="block text-sm font-medium mb-1">设计指令 (Prompt)</label><p className="text-xs font-mono bg-[var(--theme-bg-subtle)] p-2 rounded">{prompt}</p></div>
                    </div>
                )}
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-[var(--theme-bg-subtle)] rounded-md hover:bg-opacity-80">取消</button>
                    <button onClick={handleSave} disabled={isLoadingDetails} className="px-4 py-2 text-sm bg-[var(--theme-indigo)] text-white rounded-md hover:bg-[var(--theme-indigo-hover)] disabled:opacity-50 disabled:cursor-not-allowed">保存</button>
                </div>
            </div>
        </div>
    );
};

const ImportTemplateModal = ({ isOpen, onClose, onImport }: { isOpen: boolean; onClose: () => void; onImport: (json: string) => void; }) => {
    const [jsonString, setJsonString] = useState('');
    useEffect(() => { if (isOpen) setJsonString(''); }, [isOpen]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-bg-panel)] rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">导入模板</h2>
                <p className="text-sm text-[var(--theme-text-muted)] mb-2">请在此处粘贴模板内容 (JSON格式)。</p>
                <textarea value={jsonString} onChange={e => setJsonString(e.target.value)} rows={8} className="w-full p-2 border border-[var(--theme-border)] rounded-md text-sm bg-[var(--theme-bg-panel)] focus:ring-2 focus:ring-[var(--theme-ring)] font-mono" placeholder='{ "id": "...", "name": "...", ... }' />
                <div className="flex justify-end space-x-2 mt-4"><button onClick={onClose} className="px-4 py-2 text-sm bg-[var(--theme-bg-subtle)] rounded-md hover:bg-opacity-80">取消</button><button onClick={() => onImport(jsonString)} className="px-4 py-2 text-sm bg-[var(--theme-indigo)] text-white rounded-md hover:bg-[var(--theme-indigo-hover)]">导入</button></div>
            </div>
        </div>
    );
};
  
interface Lip3dViewerProps {
  mesh: LipMesh;
  textureUrl: string;
  ambientLightProps: { intensity: number; color: string };
  directionalLightProps: { intensity: number; color: string; position: { x: number; y: number; z: number } };
}

const Lip3dViewer = ({ mesh, textureUrl, ambientLightProps, directionalLightProps }: Lip3dViewerProps) => {
    const LipModel = ({ mesh, textureUrl }: { mesh: LipMesh; textureUrl: string }) => {
        const texture = useTexture(textureUrl);
        texture.flipY = false;

        const geometry = useMemo(() => createLipGeometry(mesh), [mesh]);

        return (
            <mesh geometry={geometry}>
                <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.6} metalness={0.2} />
            </mesh>
        );
    };

    return (
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 1.5], fov: 50 }}>
                <ambientLight intensity={ambientLightProps.intensity} color={ambientLightProps.color} />
                <directionalLight 
                    position={[directionalLightProps.position.x, directionalLightProps.position.y, directionalLightProps.position.z]} 
                    intensity={directionalLightProps.intensity}
                    color={directionalLightProps.color}
                />
                <directionalLight position={[-3, 2, -5]} intensity={1.0} />
                <React.Suspense fallback={<ModelLoader />}>
                    <LipModel mesh={mesh} textureUrl={textureUrl} />
                </React.Suspense>
                <OrbitControls enableZoom={true} enablePan={false} />
            </Canvas>
        </div>
    );
};

const ThreeDViewerModal = ({ isOpen, onClose, isLoading, mesh, error, textureUrl, downloadImage }: { isOpen: boolean; onClose: () => void; isLoading: boolean; mesh: LipMesh | null; error: string | null; textureUrl: string | null; downloadImage: (url: string | null, filename: string) => void; }) => {
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [ambientLightProps, setAmbientLightProps] = useState({ intensity: 1.2, color: '#ffffff' });
    const [directionalLightProps, setDirectionalLightProps] = useState({ intensity: 2.5, color: '#ffffff', position: { x: 3, y: 3, z: 5 } });
    
    if (!isOpen) return null;

    const handleAmbientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAmbientLightProps(prev => ({ ...prev, [name]: name === 'intensity' ? parseFloat(value) : value }));
    };

    const handleDirectionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDirectionalLightProps(prev => ({ ...prev, [name]: name === 'intensity' ? parseFloat(value) : value }));
    };
    
    const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDirectionalLightProps(prev => ({ ...prev, position: { ...prev.position, [name]: parseFloat(value) } }));
    };
    
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportGLB = async () => {
        if (!mesh || !textureUrl) return;

        const exporter = new GLTFExporter();
        const scene = new THREE.Scene();
        const geometry = createLipGeometry(mesh);

        const textureLoader = new THREE.TextureLoader();
        try {
            const texture = await textureLoader.loadAsync(textureUrl);
            texture.flipY = false;
            const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.2 });
            const lipMesh = new THREE.Mesh(geometry, material);
            scene.add(lipMesh);

            exporter.parse(
                scene,
                (gltf) => {
                    const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
                    downloadBlob(blob, 'lip_model.glb');
                },
                (error) => {
                    console.error('An error happened during GLTF exportation.', error);
                    alert('导出 GLB 失败。');
                },
                { binary: true }
            );
        } catch (err) {
            console.error('Error loading texture for export.', err);
            alert('导出 GLB 失败：无法加载贴图。');
        }
    };

    const handleExportOBJ = () => {
        if (!mesh) return;
        const exporter = new OBJExporter();
        const geometry = createLipGeometry(mesh);
        const material = new THREE.MeshBasicMaterial();
        const lipMesh = new THREE.Mesh(geometry, material);
        const objData = exporter.parse(lipMesh);
        const blob = new Blob([objData], { type: 'text/plain' });
        downloadBlob(blob, 'lip_model.obj');
    };
    
    const sliderClass = "w-full h-2 bg-[var(--theme-bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--theme-indigo)]";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-bg-panel)] rounded-lg p-6 w-full max-w-2xl aspect-square flex flex-col relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-lg font-bold">3D 模型预览</h2>
                     <div className="flex items-center space-x-2">
                        {mesh && textureUrl && !isLoading && !error && (
                            <>
                                <button onClick={handleExportGLB} className="px-3 py-1 text-xs bg-[var(--theme-bg-subtle)] rounded-md hover:bg-opacity-80 transition-transform active:scale-95">导出 GLB</button>
                                <button onClick={handleExportOBJ} className="px-3 py-1 text-xs bg-[var(--theme-bg-subtle)] rounded-md hover:bg-opacity-80 transition-transform active:scale-95">导出 OBJ</button>
                                <button onClick={() => downloadImage(textureUrl, 'lip_texture.png')} title="下载OBJ格式所需的贴图" className="px-3 py-1 text-xs bg-[var(--theme-bg-subtle)] rounded-md hover:bg-opacity-80 transition-transform active:scale-95">下载贴图</button>
                            </>
                        )}
                        <button onClick={() => setIsSettingsVisible(v => !v)} className="p-1.5 rounded-full hover:bg-[var(--theme-bg-subtle)] transition-colors" title="灯光设置"><SettingsIcon /></button>
                        <button onClick={onClose} className="transition-transform active:scale-90 p-1"><XIcon /></button>
                    </div>
                </div>

                {isSettingsVisible && (
                    <div className="absolute top-20 right-6 z-10 bg-[var(--theme-bg-panel)] bg-opacity-80 backdrop-blur-sm p-3 rounded-lg shadow-lg w-60 space-y-3">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">环境光</h4>
                            <div className="flex items-center justify-between"><label htmlFor="ambientColor" className="text-xs text-[var(--theme-text-muted)]">颜色</label><input id="ambientColor" type="color" name="color" value={ambientLightProps.color} onChange={handleAmbientChange} className="w-6 h-6 p-0 border-none rounded bg-transparent" /></div>
                            <div><label htmlFor="ambientIntensity" className="block text-xs text-[var(--theme-text-muted)] mb-1">强度 ({ambientLightProps.intensity.toFixed(1)})</label><input id="ambientIntensity" type="range" name="intensity" min="0" max="3" step="0.1" value={ambientLightProps.intensity} onChange={handleAmbientChange} className={sliderClass} /></div>
                        </div>
                        <div className="border-t border-[var(--theme-border)] my-2"></div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">主光源</h4>
                            <div className="flex items-center justify-between"><label htmlFor="dirColor" className="text-xs text-[var(--theme-text-muted)]">颜色</label><input id="dirColor" type="color" name="color" value={directionalLightProps.color} onChange={handleDirectionalChange} className="w-6 h-6 p-0 border-none rounded bg-transparent" /></div>
                            <div><label htmlFor="dirIntensity" className="block text-xs text-[var(--theme-text-muted)] mb-1">强度 ({directionalLightProps.intensity.toFixed(1)})</label><input id="dirIntensity" type="range" name="intensity" min="0" max="5" step="0.1" value={directionalLightProps.intensity} onChange={handleDirectionalChange} className={sliderClass} /></div>
                            <div><label htmlFor="dirX" className="block text-xs text-[var(--theme-text-muted)] mb-1">位置 X ({directionalLightProps.position.x.toFixed(1)})</label><input id="dirX" type="range" name="x" min="-10" max="10" step="0.5" value={directionalLightProps.position.x} onChange={handlePositionChange} className={sliderClass} /></div>
                            <div><label htmlFor="dirY" className="block text-xs text-[var(--theme-text-muted)] mb-1">位置 Y ({directionalLightProps.position.y.toFixed(1)})</label><input id="dirY" type="range" name="y" min="-10" max="10" step="0.5" value={directionalLightProps.position.y} onChange={handlePositionChange} className={sliderClass} /></div>
                            <div><label htmlFor="dirZ" className="block text-xs text-[var(--theme-text-muted)] mb-1">位置 Z ({directionalLightProps.position.z.toFixed(1)})</label><input id="dirZ" type="range" name="z" min="-10" max="10" step="0.5" value={directionalLightProps.position.z} onChange={handlePositionChange} className={sliderClass} /></div>
                        </div>
                    </div>
                )}
                
                <div className="flex-1 flex items-center justify-center bg-[var(--theme-bg-subtle)] rounded-md overflow-hidden min-h-0">
                    {isLoading && <div className="flex flex-col items-center"><SpinnerIcon className="w-10 h-10" /><p className="mt-2 text-sm text-[var(--theme-text-muted)]">AI 正在生成 3D 模型...</p></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {mesh && textureUrl && <Lip3dViewer mesh={mesh} textureUrl={textureUrl} ambientLightProps={ambientLightProps} directionalLightProps={directionalLightProps} />}
                </div>
                <p className="text-xs text-center text-[var(--theme-text-muted)] mt-2">拖动以旋转，滚轮以缩放</p>
            </div>
        </div>
    );
};

  const WorkspaceTabs = () => (
    <div className="flex-shrink-0 flex border-b border-[var(--theme-border)]">
        <button onClick={() => setActiveTab('photo')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center space-x-2 ${activeTab === 'photo' ? 'text-[var(--theme-indigo)] border-b-2 border-[var(--theme-indigo)]' : 'text-[var(--theme-text-muted)]'}`}><PhotoIcon className="w-5 h-5" /> <span>照片</span></button>
        <button onClick={() => setActiveTab('design')} disabled={!selectedPhoto} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 ${activeTab === 'design' ? 'text-[var(--theme-indigo)] border-b-2 border-[var(--theme-indigo)]' : 'text-[var(--theme-text-muted)]'}`}><SparklesIcon className="w-5 h-5" /> <span>设计</span></button>
        <button onClick={() => setActiveTab('history')} disabled={!selectedPhoto} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 ${activeTab === 'history' ? 'text-[var(--theme-indigo)] border-b-2 border-[var(--theme-indigo)]' : 'text-[var(--theme-text-muted)]'}`}><HistoryIcon className="w-5 h-5" /> <span>历史</span></button>
        <button onClick={() => setActiveTab('saved')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center space-x-2 ${activeTab === 'saved' ? 'text-[var(--theme-indigo)] border-b-2 border-[var(--theme-indigo)]' : 'text-[var(--theme-text-muted)]'}`}><StarIcon filled={activeTab === 'saved'} className="w-5 h-5" /> <span>收藏</span></button>
        <button onClick={() => setActiveTab('templates')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center space-x-2 ${activeTab === 'templates' ? 'text-[var(--theme-indigo)] border-b-2 border-[var(--theme-indigo)]' : 'text-[var(--theme-text-muted)]'}`}><BookmarkIcon filled={activeTab === 'templates'} className="w-5 h-5" /> <span>模板</span></button>
    </div>
  );

  const MobileFooterPanel = () => {
    const handleTabClick = (tabToActivate: ActiveTab) => {
        if (activeTab === tabToActivate) setIsMobilePanelExpanded(prev => !prev);
        else { setActiveTab(tabToActivate); setIsMobilePanelExpanded(true); }
    };
    const tabs: { name: ActiveTab; icon: React.FC<{ className?: string, filled?: boolean }>; label: string; disabled: boolean }[] = [
        { name: 'photo', icon: PhotoIcon, label: '照片', disabled: false }, { name: 'design', icon: SparklesIcon, label: '设计', disabled: !selectedPhoto },
        { name: 'history', icon: HistoryIcon, label: '历史', disabled: !selectedPhoto }, { name: 'saved', icon: StarIcon, label: '收藏', disabled: false }, { name: 'templates', icon: BookmarkIcon, label: '模板', disabled: false },
    ];
    return (
        <div className={`mobile-footer-panel ${isMobilePanelExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="panel-content-area">{activeTab === 'photo' && <PhotoPanel />}{activeTab === 'design' && <DesignPanel />}{activeTab === 'history' && <HistoryPanel />}{activeTab === 'saved' && <SavedPanel />}{activeTab === 'templates' && <TemplatesPanel />}</div>
            <div className="panel-tabs-bar">
                {tabs.map(tab => {
                    const IconComponent = tab.icon, isTabActive = activeTab === tab.name && isMobilePanelExpanded;
                    return (
                        <button key={tab.name} onClick={() => handleTabClick(tab.name)} disabled={tab.disabled} className={`flex-1 p-3 text-sm font-semibold flex flex-col items-center justify-center space-y-1 disabled:opacity-50 transition-colors duration-200 ${isTabActive ? 'text-[var(--theme-indigo)]' : 'text-[var(--theme-text-muted)]'}`}>
                            <IconComponent className="w-6 h-6" filled={isTabActive} /><span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
  };
  
  const MobileEditorToolbar = () => {
    const panelHeight = isMobilePanelExpanded ? (window.innerHeight * 0.6) : 80;
    if (!selectedPhoto) return null;
    return (
        <div className="mobile-editor-toolbar" style={{ bottom: `${panelHeight + 16}px` }}>
            <button onClick={handleUndo} disabled={!canUndo || isLoading['applyStyle']} className="p-2.5 rounded-lg bg-[var(--theme-bg-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"><UndoIcon /></button>
            <button onClick={handleRedo} disabled={!canRedo || isLoading['applyStyle']} className="p-2.5 rounded-lg bg-[var(--theme-bg-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"><RedoIcon /></button>
            <div className="w-px h-6 bg-[var(--theme-border)] mx-1"></div>
            {selectedPhoto?.compliance?.isCompliant && <button onClick={() => setViewMode(v => v === 'closeup' ? 'full' : 'closeup')} disabled={isLoading['applyStyle']} className="px-3 py-1.5 text-sm bg-[var(--theme-bg-subtle)] rounded-lg hover:bg-opacity-80 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">{viewMode === 'closeup' ? '查看全脸' : '查看特写'}</button>}
            {activeOperation && (
             <>
               <button onClick={handleSaveDesign} disabled={isLoading['applyStyle']} className={`p-2.5 rounded-lg bg-[var(--theme-bg-subtle)] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isCurrentDesignSaved ? 'text-yellow-400' : ''}`}><StarIcon filled={isCurrentDesignSaved} /></button>
               <button onClick={handleOpenSaveTemplateModal} className="p-2.5 rounded-lg bg-[var(--theme-bg-subtle)] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"><BookmarkIcon className="w-5 h-5" /></button>
               <button onClick={() => setShareModalState({ isOpen: true, operation: activeOperation, originalUrl: selectedPhoto?.url })} disabled={isLoading['applyStyle']} className="p-2.5 rounded-lg bg-[var(--theme-bg-subtle)] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"><ShareIcon /></button>
                <button onClick={handleGenerate3dModel} disabled={isLoading['applyStyle']} className="p-2.5 rounded-lg bg-[var(--theme-bg-subtle)] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"><CubeTransparentIcon /></button>
             </>
            )}
        </div>
    );
  };
  
  const Footer = () => (
    <footer className="flex-shrink-0 h-10 flex items-center justify-center text-xs text-[var(--theme-text-muted)] bg-[var(--theme-bg-base)] border-t border-[var(--theme-border)] px-4 text-center opacity-75">
      <span>Copyright © 2025 射频细胞</span><span className="mx-2">|</span><span>唇相人相世相</span><span className="mx-2">|</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--theme-indigo)]">京 ICP 备 20009050 号-3</a>
    </footer>
  );

  return (
    <>
      {!isAppReady && <SplashScreen progress={loadingProgress} />}
      <div className={`h-[100svh] w-screen flex flex-col transition-opacity duration-500 ${isAppReady ? 'opacity-100' : 'opacity-0'}`}>
        <Header />
        <main className="flex-1 flex overflow-hidden pt-14">
          {!isMobile && (
            <div className="w-96 border-r border-[var(--theme-border)] flex-shrink-0 flex flex-col">
              <WorkspaceTabs />
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'photo' && <PhotoPanel />} {activeTab === 'design' && <DesignPanel />}
                {activeTab === 'history' && <HistoryPanel />} {activeTab === 'saved' && <SavedPanel />}
                {activeTab === 'templates' && <TemplatesPanel />}
              </div>
            </div>
          )}
          <EditorCanvas />
          {isMobile && <MobileFooterPanel />} {isMobile && <MobileEditorToolbar />}
        </main>
        <Footer />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <CameraModal isOpen={cameraModalOpen} onClose={() => setCameraModalOpen(false)} onCapture={(url) => processNewPhoto(url, `capture_${Date.now()}.png`)} />
        <NineGridModal />
        <ZoomableImageModal />
        <SettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
        <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
        <HowToUseModal isOpen={howToUseModalOpen} onClose={() => setHowToUseModalOpen(false)} />
        <ShareModal isOpen={shareModalState.isOpen} onClose={() => setShareModalState({ isOpen: false, operation: null, originalUrl: null })} operation={shareModalState.operation} originalUrl={shareModalState.originalUrl} />
        <SaveTemplateModal
            isOpen={templateModalState.isOpen}
            onClose={() => setTemplateModalState({ isOpen: false, prompt: null, isLoadingDetails: false, initialDetails: null })}
            onSave={handleSaveTemplate}
            prompt={templateModalState.prompt}
            isLoadingDetails={templateModalState.isLoadingDetails}
            initialDetails={templateModalState.initialDetails}
        />
        <ImportTemplateModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImportTemplate} />
        <LipCropTool isOpen={croppingState.isOpen} photo={croppingState.photo} onClose={() => setCroppingState({ isOpen: false, photo: null })} onConfirm={handleConfirmCrop} />
        <ThreeDViewerModal 
            isOpen={threeDModalState.isOpen} 
            onClose={() => setThreeDModalState({ isOpen: false, isLoading: false, mesh: null, error: null, textureUrl: null })} 
            isLoading={threeDModalState.isLoading} 
            mesh={threeDModalState.mesh} 
            error={threeDModalState.error} 
            textureUrl={threeDModalState.textureUrl}
            downloadImage={downloadImage}
        />
      </div>
    </>
  );
};

export default App;