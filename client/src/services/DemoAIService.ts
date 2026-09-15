import { demoResult, makeDemoResult, scannerSteps, screeningDisclaimer } from "@/data/diseases";

export type DemoScanResult = ReturnType<typeof makeDemoResult>;

export const DemoAIService = {
  scan: (onProgress?: (step: string, index: number) => void): Promise<DemoScanResult> => new Promise((resolve) => {
    let index = 0;
    const tick = () => {
      onProgress?.(scannerSteps[index], index);
      index += 1;
      if (index < scannerSteps.length) window.setTimeout(tick, 1000);
      else window.setTimeout(() => resolve(makeDemoResult()), 1000);
    };
    tick();
  }),
  sample: () => ({ ...demoResult, disclaimer: screeningDisclaimer, timestamp: new Date().toISOString(), id: "sample-result" }),
  disclaimer: screeningDisclaimer,
  mode: "DEMO MODE",
};
