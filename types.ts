export interface Photo {
  id: string;
  name: string;
  url: string; // base64 data URL
  compliance: {
    isCompliant: boolean;
    reason?: string;
  } | null;
  lipCloseup?: string; // base64 data URL
  manualCropRect?: { x: number; y: number; width: number; height: number }; // Relative coordinates
}

export interface OperationHistory {
  id: string;
  timestamp: number;
  type: 'style' | 'suggestion' | 'text' | 'nine-grid';
  prompt: string;
  resultUrl: string; // closeup base64 data URL
  fullResultUrl: string; // full photo base64 data URL
}

export interface AestheticPlan {
  injectionPlan?: string;
  volumeAndShapePlan?: string;
  lipLinerPlan?: string;
  makeupPlan?: string;
}

export interface StyleSuggestion {
  prompt: string;
  reason: string;
}

export interface StylePreset {
  name: string;
  prompt: string;
  description: string;
}

export interface SavedDesign {
  id: string;
  photoId: string;
  operation: OperationHistory;
  aestheticPlan: AestheticPlan | null;
  savedAt: number;
}

export interface MakeupSuggestion {
  overallLook?: string;
  eyeshadow?: string;
  blush?: string;
}

export interface NineGridSuggestion {
  prompt: string;
  description: string;
  keywords: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  createdAt: number;
}

export interface TemplateDetails {
  name: string;
  description: string;
}

export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export type Face = number[]; // indices of vertices, forming a triangle e.g., [0, 1, 2]

export interface LipMesh {
  vertices: Vertex[];
  faces: Face[];
}

export interface ContextualAnalysis {
  aestheticKeywords: string[];
  makeupKeywords: string[];
}

export interface ActionableIntent {
  suggestionText: string;
  actionPrompt: string;
}