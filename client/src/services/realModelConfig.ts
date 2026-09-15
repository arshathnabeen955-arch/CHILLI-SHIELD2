import type { ModelMetadata } from "@/services/modelTypes";

export type RealModelConfig = { endpoint: string; healthEndpoint?: string; provider: string; modelName: string; modelVersion: string; timeoutMs: number };
const endpoint = (import.meta.env.VITE_REAL_MODEL_ENDPOINT || "").trim();
export const realModelConfig: RealModelConfig | null = endpoint ? {
  endpoint,
  healthEndpoint: (import.meta.env.VITE_REAL_MODEL_HEALTH_ENDPOINT || "").trim() || undefined,
  provider: import.meta.env.VITE_REAL_MODEL_PROVIDER || "Configured provider",
  modelName: import.meta.env.VITE_REAL_MODEL_NAME || "Configured model",
  modelVersion: import.meta.env.VITE_REAL_MODEL_VERSION || "Unspecified",
  timeoutMs: Number(import.meta.env.VITE_REAL_MODEL_TIMEOUT_MS || 20000),
} : null;
export const configuredModelMetadata = (): ModelMetadata | null => realModelConfig ? { status: "MODEL UNAVAILABLE", provider: realModelConfig.provider, modelName: realModelConfig.modelName, modelVersion: realModelConfig.modelVersion, endpoint: realModelConfig.endpoint } : null;
