import { screeningDisclaimer } from "@/data/diseases";
import { realModelConfig } from "@/services/realModelConfig";
import { REAL_MODEL_STEPS, type AIService, type ImageQualityCheck, type RealInferenceResponse, type ScreeningResult } from "@/services/modelTypes";

const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));
const validateResponse = (value: unknown): value is RealInferenceResponse => { if (!value || typeof value !== "object") return false; const item = value as Partial<RealInferenceResponse>; return !!item.model && typeof item.confidence === "number" && Array.isArray(item.probabilities) && !!item.risk && typeof item.explanation === "string" && Array.isArray(item.recommendedNextSteps); };
const qualityCheck = async (file: File): Promise<ImageQualityCheck> => {
  const issues: string[] = [];
  if (!file.type.startsWith("image/")) issues.push("Unsupported MIME type");
  if (file.size > 10 * 1024 * 1024) issues.push("File exceeds 10 MB");
  const dimensions = await new Promise<{ width?: number; height?: number }>(resolve => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = () => resolve({}); image.src = URL.createObjectURL(file); });
  if (dimensions.width && dimensions.height && Math.min(dimensions.width, dimensions.height) < 256) issues.push("Minimum dimension is 256 px");
  return { valid: issues.length === 0, mimeType: file.type, bytes: file.size, ...dimensions, issues };
};
const postWithTimeout = async (file: File, quality: ImageQualityCheck): Promise<RealInferenceResponse> => {
  if (!realModelConfig) throw new Error("No real model endpoint is configured.");
  const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), realModelConfig.timeoutMs);
  try { const body = new FormData(); body.append("image", file, file.name || "image"); body.append("quality", JSON.stringify(quality)); const response = await fetch(realModelConfig.endpoint, { method: "POST", body, signal: controller.signal, headers: { Accept: "application/json" } }); if (!response.ok) throw new Error(`Model endpoint returned HTTP ${response.status}`); const payload: unknown = await response.json(); if (!validateResponse(payload)) throw new Error("Model response did not match the documented contract."); return { ...payload, quality }; } finally { window.clearTimeout(timeout); }
};
export const RealAIService: AIService = { metadata: { status: "MODEL UNAVAILABLE", provider: realModelConfig?.provider || "No endpoint configured", modelName: realModelConfig?.modelName || "Unknown", modelVersion: realModelConfig?.modelVersion || "Unknown", endpoint: realModelConfig?.endpoint }, scan: async (file, onProgress): Promise<ScreeningResult> => { const quality = await qualityCheck(file); onProgress?.(REAL_MODEL_STEPS[0], 0); await wait(250); if (!quality.valid) throw new Error(`Image quality check failed: ${quality.issues.join(", ")}`); onProgress?.(REAL_MODEL_STEPS[1], 1); await wait(250); onProgress?.(REAL_MODEL_STEPS[2], 2); const response = await postWithTimeout(file, quality); onProgress?.(REAL_MODEL_STEPS[3], 3); await wait(100); onProgress?.(REAL_MODEL_STEPS[4], 4); await wait(100); onProgress?.(REAL_MODEL_STEPS[5], 5); return { ...response, id: `real-${Date.now()}`, timestamp: new Date().toISOString(), mode: "REAL MODEL CONNECTED", disclaimer: screeningDisclaimer }; } };
export const realModelResponseContract = { request: "multipart/form-data with image=<binary file> and quality=<JSON string>", response: "application/json matching RealInferenceResponse", requiredFields: ["model.name", "model.version", "probabilities[]", "confidence", "risk.level", "risk.score", "risk.rationale", "explanation", "recommendedNextSteps[]"] };
