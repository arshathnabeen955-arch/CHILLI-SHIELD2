export type ModelStatus = "DEMO MODE" | "REAL MODEL CONNECTED" | "MODEL UNAVAILABLE";

export type ModelMetadata = { status: ModelStatus; provider: string; modelName: string; modelVersion: string; endpoint?: string; reason?: string };
export type ImageQualityCheck = { valid: boolean; mimeType: string; bytes: number; width?: number; height?: number; issues: string[] };
export type ClassProbability = { classId: string; label: string; probability: number };
export type RiskAssessment = { level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "UNKNOWN"; score: number | null; rationale: string };
export type RealInferenceResponse = { model: { name: string; version: string; provider?: string }; probabilities: ClassProbability[]; confidence: number; risk: RiskAssessment; explanation: string; recommendedNextSteps: string[]; quality?: ImageQualityCheck };
export type ScreeningResult = RealInferenceResponse & { id: string; timestamp: string; mode: ModelStatus; disclaimer: string; overallHealthScore?: number; overallRiskLevel?: string; topCondition?: string; conditions?: Array<{ name: string; confidence: number; risk: string; indicators: string[] }>; nextSteps?: string[] };
export type AIService = { metadata: ModelMetadata; scan: (file: File, onProgress?: (step: string, index: number) => void) => Promise<ScreeningResult> };

export const MODEL_STATUS_COPY: Record<ModelStatus, string> = {
  "DEMO MODE": "Simulated output only · no trained model is connected",
  "REAL MODEL CONNECTED": "A configured model endpoint returned a screening result",
  "MODEL UNAVAILABLE": "The configured model endpoint could not be reached or validated",
};
export const REAL_MODEL_STEPS = ["IMAGE QUALITY CHECK", "PREPROCESSING", "REAL MODEL INFERENCE", "CLASS PROBABILITIES", "CONFIDENCE + RISK", "EXPLANATION"];
export const DEMO_MODEL_METADATA: ModelMetadata = { status: "DEMO MODE", provider: "CHILLI-SHIELD demo", modelName: "DemoAIService", modelVersion: "demo-2026" };
export const unavailableMetadata = (reason: string, endpoint?: string): ModelMetadata => ({ status: "MODEL UNAVAILABLE", provider: "Configured endpoint", modelName: "Unknown", modelVersion: "Unknown", endpoint, reason });
export const isModelStatus = (value: unknown): value is ModelStatus => value === "DEMO MODE" || value === "REAL MODEL CONNECTED" || value === "MODEL UNAVAILABLE";
