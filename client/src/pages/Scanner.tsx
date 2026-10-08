import {
  Check,
  CheckCircle2,
  FileImage,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  ScreeningDisclaimer,
} from "@/components/Disclaimer";

import {
  getCurrentModelMetadata,
  scanWithFallback,
} from "@/services/AIServiceRouter";

import {
  MODEL_STATUS_COPY,
  REAL_MODEL_STEPS,
  type ModelMetadata,
} from "@/services/modelTypes";

import {
  getFileSize,
  getHealthScoreLabel,
  getHealthScoreTone,
  getHistory,
  getRiskTone,
  leafImagePath,
  saveHistory,
  scannerSteps,
  validateFile,
} from "@/data/diseases";

type ScanState = "idle" | "ready" | "loading" | "result" | "error";

function Scanner() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ScanState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [modelMetadata, setModelMetadata] = useState<ModelMetadata>(
    () => getCurrentModelMetadata()
  );
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setHistory(getHistory());

    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const acceptFile = (next: File) => {
    setError("");

    if (!validateFile(next)) {
      setState("error");
      setError("Use a JPG, PNG, or WebP image up to 10 MB.");
      return;
    }

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFile(next);
    setName(next.name);
    setPreview(URL.createObjectURL(next));
    setState("ready");
  };

  const loadDemo = () => {
    setError("");
    setFile(null);
    setName("chilli-leaf-demo.jpg");
    setPreview(leafImagePath);
    setState("ready");
  };

  const run = async () => {
    if (!preview) {
      return;
    }

    setState("loading");
    setStep(0);
    setError("");

    try {
      let input: File;

      if (file) {
        input = file;
      } else {
        const response = await fetch(preview);
        const blob = await response.blob();

        input = new File(
          [blob],
          name || "chilli-image.jpg",
          {
            type: blob.type || "image/jpeg",
          }
        );
      }

      const output = await scanWithFallback(
        input,
        (_stepName, index) => {
          setStep(index);
        }
      );

      setModelMetadata(output.metadata);
      setUsedFallback(output.usedFallback);
      setResult(output.result);

      const probabilities = [
        ...(output.result.probabilities || []),
      ];

      probabilities.sort(
        (a: any, b: any) =>
          b.probability - a.probability
      );

      const topPrediction =
        probabilities.length > 0
          ? probabilities[0].label
          : "Unclassified";

      const riskScore =
        output.result.risk?.score ?? 0;

      const overallHealthScore =
        output.result.overallHealthScore ??
        Math.max(0, 100 - riskScore);

      const overallRiskLevel =
        output.result.overallRiskLevel ??
        output.result.risk?.level ??
        "UNKNOWN";

      saveHistory({
        ...output.result,
        overallHealthScore,
        overallRiskLevel,
        topCondition: topPrediction,
        mode:
          output.result.mode ||
          output.metadata.status,
      });

      setHistory(getHistory());
      setState("result");
    } catch (scanError) {
      setState("error");

      if (scanError instanceof Error) {
        setError(scanError.message);
      } else {
        setError(
          "The screening service could not process this image."
        );
      }
    }
  };

  const reset = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setState("idle");
    setFile(null);
    setName("");
    setPreview("");
    setResult(null);
    setStep(0);
    setError("");
    setUsedFallback(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const activeSteps =
    modelMetadata.status === "DEMO MODE"
      ? scannerSteps
      : REAL_MODEL_STEPS;

  const currentStepLabel =
    activeSteps[step] || activeSteps[0];

  return (
    <div className="container py-14 md:py-20">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow">
            01 / AI scanner
          </p>

          <h1 className="display-lg mt-5 text-[#2D5016]">
            Put the leaf in context.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-[#66705E]">
            {modelMetadata.status === "DEMO MODE"
              ? "Upload a clear chilli plant image and walk through a simulated screening flow."
              : "Upload a clear chilli plant image and send it to the configured AI screening endpoint. Results are shown only after response validation."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusPill status={modelMetadata.status} />

            <span className="font-mono text-[.62rem] uppercase tracking-[.12em] text-[#8A9286]">
              {modelMetadata.modelName}
              {" · "}
              {modelMetadata.modelVersion}
            </span>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-start">

          {/* UPLOAD CARD */}
          <section
            className="rounded-[2rem] border border-[#2D5016]/12 bg-[#FCFBF7] p-5 shadow-[0_20px_60px_rgba(45,80,22,.06)] md:p-8"
            aria-labelledby="upload-heading"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[.62rem] uppercase tracking-[.15em] text-[#8A9286]">
                  Local image check
                </p>

                <h2
                  id="upload-heading"
                  className="mt-2 font-display text-2xl text-[#2D5016]"
                >
                  Upload a plant photo
                </h2>
              </div>

              <span className="rounded-full bg-[#2D5016]/8 px-3 py-1.5 font-mono text-[.6rem] font-medium tracking-[.14em] text-[#2D5016]">
                JPG · PNG · WEBP
              </span>
            </div>

            {/* DROP ZONE */}
            <button
              type="button"
              onClick={() => {
                inputRef.current?.click();
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();

                const dropped =
                  event.dataTransfer.files[0];

                if (dropped) {
                  acceptFile(dropped);
                }
              }}
              className={
                state === "error"
                  ? "mt-7 flex min-h-[300px] w-full flex-col items-center justify-center rounded-[1.4rem] border-2 border-dashed border-[#B85C4D] bg-[#B85C4D]/5 px-6 text-center"
                  : preview
                    ? "mt-7 flex min-h-[300px] w-full flex-col items-center justify-center rounded-[1.4rem] border-2 border-dashed border-[#2D5016]/25 bg-[#2D5016]/[.03] px-6 text-center"
                    : "mt-7 flex min-h-[300px] w-full flex-col items-center justify-center rounded-[1.4rem] border-2 border-dashed border-[#2D5016]/20 bg-[#F5F3ED] px-6 text-center hover:border-[#B85C4D]/60"
              }
              aria-label="Choose a chilli plant image"
            >
              {preview ? (
                <div className="relative w-full max-w-sm">
                  <img
                    src={preview}
                    alt="Selected chilli plant preview"
                    className="mx-auto max-h-64 rounded-xl object-cover shadow-sm"
                  />

                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#2D5016] px-2 py-1 font-mono text-[.6rem] uppercase tracking-wide text-[#F5F3ED]">
                    <Check size={12} />
                    Ready
                  </span>
                </div>
              ) : (
                <>
                  <span className="mb-4 grid size-14 place-items-center rounded-full bg-[#2D5016]/10 text-[#2D5016]">
                    <Upload size={21} />
                  </span>

                  <span className="font-display text-xl text-[#2D5016]">
                    Drop a leaf photo here
                  </span>

                  <span className="mt-2 text-sm text-[#7C8479]">
                    or choose a file from your device
                  </span>
                </>
              )}
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const next =
                  event.target.files?.[0];

                if (next) {
                  acceptFile(next);
                }
              }}
            />

            {/* FILE INFORMATION */}
            {name && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#E9E7DE] px-4 py-3">
                <span className="flex min-w-0 items-center gap-3 text-sm">
                  <FileImage
                    size={17}
                    className="shrink-0 text-[#2D5016]"
                  />

                  <span className="truncate">
                    {name}
                  </span>

                  {file && (
                    <span className="shrink-0 font-mono text-[.62rem] text-[#7C8479]">
                      {getFileSize(file.size)}
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={reset}
                  aria-label="Remove selected image"
                  className="text-[#7C8479] hover:text-[#B85C4D]"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-[#B85C4D]/15 bg-[#B85C4D]/5 px-4 py-3"
              >
                <p className="text-sm font-medium text-[#8E3E33]">
                  {error}
                </p>
              </div>
            )}

            {/* SCANNING */}
            {state === "loading" ? (
              <div
                className="mt-6 rounded-2xl bg-[#2D5016] p-5 text-[#F5F3ED]"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  <span className="font-mono text-xs font-medium tracking-[.14em]">
                    {currentStepLabel}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-6 gap-1">
                  {activeSteps.map(
                    (item, index) => (
                      <div
                        key={item}
                        className={
                          index <= step
                            ? "h-1 rounded-full bg-[#B85C4D]"
                            : "h-1 rounded-full bg-[#F5F3ED]/25"
                        }
                      />
                    )
                  )}
                </div>

                <p className="mt-3 text-xs text-[#C6D3B8]">
                  {modelMetadata.status === "DEMO MODE"
                    ? "This demo flow does not call a real AI model."
                    : "Processing the image through the configured real-model pipeline."}
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!preview}
                  onClick={run}
                  className="button-primary flex-1 px-5 py-4 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={16} />

                  {modelMetadata.status === "DEMO MODE"
                    ? "Run demo screen"
                    : "Run AI screen"}
                </button>

                <button
                  type="button"
                  onClick={loadDemo}
                  className="button-secondary flex-1 px-5 py-4"
                >
                  Use sample leaf
                </button>
              </div>
            )}

            <p className="mt-5 flex items-center gap-2 font-mono text-[.61rem] uppercase tracking-[.12em] text-[#7C8479]">
              <ShieldAlert size={13} />

              {modelMetadata.status === "DEMO MODE"
                ? "Images are not uploaded anywhere."
                : "Images are sent only to the configured model endpoint."}
            </p>
          </section>

          {/* RIGHT SIDE */}
          <aside className="space-y-5">

            {modelMetadata.status === "DEMO MODE" && (
              <DemoBanner />
            )}

            <ModelStatusBadge
              metadata={modelMetadata}
              usedFallback={usedFallback}
            />

            <div className="rounded-[2rem] border border-[#2D5016]/12 bg-[#E9E7DE] p-6">
              <p className="eyebrow">
                Before you scan
              </p>

              <h2 className="mt-4 font-display text-2xl text-[#2D5016]">
                A good photo makes a better question.
              </h2>

              <ul className="mt-6 grid gap-4 text-sm text-[#66705E]">
                <li className="flex gap-3">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-[#2D5016]"
                  />
                  Use daylight where possible
                </li>

                <li className="flex gap-3">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-[#2D5016]"
                  />
                  Include the whole leaf and some stem
                </li>

                <li className="flex gap-3">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-[#2D5016]"
                  />
                  Avoid blur and heavy glare
                </li>

                <li className="flex gap-3">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-[#2D5016]"
                  />
                  Keep the leaf clearly visible
                </li>
              </ul>
            </div>

            <ScreeningDisclaimer compact />
          </aside>
        </div>

        {state === "result" && result && (
          <ResultPanel
            result={result}
            metadata={modelMetadata}
            onReset={reset}
          />
        )}

        <HistoryPanel history={history} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS PILL                                                                */
/* -------------------------------------------------------------------------- */

function StatusPill({
  status,
}: {
  status: ModelMetadata["status"];
}) {
  if (status === "REAL MODEL CONNECTED") {
    return (
      <span className="rounded-full bg-[#5A7D4F]/10 px-3 py-1.5 font-mono text-[.6rem] font-medium tracking-[.12em] text-[#5A7D4F]">
        REAL MODEL CONNECTED
      </span>
    );
  }

  if (status === "MODEL UNAVAILABLE") {
    return (
      <span className="rounded-full bg-[#B85C4D]/10 px-3 py-1.5 font-mono text-[.6rem] font-medium tracking-[.12em] text-[#B85C4D]">
        MODEL UNAVAILABLE
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#D4A574]/15 px-3 py-1.5 font-mono text-[.6rem] font-medium tracking-[.12em] text-[#8A632E]">
      DEMO MODE
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* MODEL STATUS                                                               */
/* -------------------------------------------------------------------------- */

function ModelStatusBadge({
  metadata,
  usedFallback,
}: {
  metadata: ModelMetadata;
  usedFallback: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#2D5016]/12 bg-[#FCFBF7] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[.6rem] uppercase tracking-[.14em] text-[#8A9286]">
          Model status
        </span>

        <StatusPill status={metadata.status} />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#34412D]">
        {metadata.modelName}
        {" · "}
        {metadata.modelVersion}
      </p>

      <p className="mt-1 text-xs leading-relaxed text-[#7C8479]">
        {MODEL_STATUS_COPY[metadata.status]}.
      </p>

      {usedFallback && (
        <p className="mt-3 border-t border-[#B85C4D]/15 pt-3 text-xs font-medium text-[#713930]">
          The configured endpoint was unavailable,
          so DemoAIService supplied this fallback
          result.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RESULT PANEL                                                               */
/* -------------------------------------------------------------------------- */

function ResultPanel({
  result,
  metadata,
  onReset,
}: {
  result: any;
  metadata: ModelMetadata;
  onReset: () => void;
}) {
  const probabilities = [
    ...(result.probabilities || []),
  ];

  probabilities.sort(
    (a: any, b: any) =>
      b.probability - a.probability
  );

  const topPrediction =
    probabilities[0];

  const score =
    result.overallHealthScore ??
    Math.max(
      0,
      100 - (result.risk?.score ?? 0)
    );

  const risk =
    result.overallRiskLevel ??
    result.risk?.level ??
    "UNKNOWN";

  const top =
    topPrediction?.label ||
    result.topCondition ||
    "Unclassified";

  const conditions =
    result.conditions ||
    probabilities.map(
      (item: any) => {
        const confidence = Math.round(
          item.probability * 100
        );

        let itemRisk = "LOW";

        if (confidence >= 90) {
          itemRisk = "HIGH";
        } else if (confidence >= 60) {
          itemRisk = "MODERATE";
        }

        return {
          name: item.label,
          confidence,
          risk: itemRisk,
          indicators: [
            "Model class probability",
          ],
        };
      }
    );

  const nextSteps =
    result.nextSteps ||
    result.recommendedNextSteps ||
    [];

  const safeScore = Math.max(
    0,
    Math.min(100, score)
  );

  return (
    <section
      className="mt-12 border-t border-[#2D5016]/15 pt-12"
      aria-labelledby="result-heading"
    >
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">
            Screening report
          </p>

          <h2
            id="result-heading"
            className="display-lg mt-4 text-[#2D5016]"
          >
            What the model returned.
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="button-secondary w-fit px-4 py-3"
        >
          <RotateCcw size={15} />
          New screen
        </button>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">

        {/* SCORE */}
        <div className="rounded-[2rem] bg-[#2D5016] p-7 text-[#F5F3ED]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[.61rem] uppercase tracking-[.16em] text-[#C6D3B8]">
              Overall screen
            </span>

            <StatusPill status={metadata.status} />
          </div>

          <div className="mt-8 flex items-end gap-2">
            <span className="font-display text-8xl leading-none">
              {safeScore}
            </span>

            <span className="mb-2 font-mono text-xs text-[#C6D3B8]">
              / 100
              <br />
              health score
            </span>
          </div>

          <p className="mt-4 text-xs uppercase tracking-[.1em] text-[#C6D3B8]">
            {getHealthScoreLabel(safeScore)}
          </p>

          <p className="mt-5 font-mono text-xs tracking-[.15em] text-[#F0B5A8]">
            {risk} RISK BAND
          </p>

          <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#F5F3ED]/20">
            <div
              className="h-full rounded-full bg-[#B85C4D] transition-all duration-700"
              style={{
                width: safeScore + "%",
              }}
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-[#D9DDCB]">
            {result.explanation}
          </p>
        </div>

        {/* DETAILS */}
        <div className="grid gap-5 rounded-[2rem] border border-[#2D5016]/12 bg-[#FCFBF7] p-6 md:p-7">

          <div>
            <p className="font-mono text-[.61rem] uppercase tracking-[.14em] text-[#8A9286]">
              Top condition match
            </p>

            <h3 className="mt-2 font-display text-3xl text-[#2D5016]">
              {top}
            </h3>

            {topPrediction && (
              <p className="mt-2 text-sm font-medium text-[#5A7D4F]">
                {Math.round(
                  topPrediction.probability * 100
                )}
                % model probability
              </p>
            )}

            <p className="mt-2 text-xs text-[#7C8479]">
              {result.model?.name}
              {" · "}
              {result.model?.version}
            </p>
          </div>

          {/* PROBABILITIES */}
          <div className="grid gap-3 sm:grid-cols-2">
            {conditions.map(
              (item: any) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-[#2D5016]/10 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[#34412D]">
                      {item.name}
                    </p>

                    <span
                      className="shrink-0 font-mono text-xs"
                      style={{
                        color: getRiskTone(
                          item.risk
                        ),
                      }}
                    >
                      {item.confidence}%
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 rounded-full bg-[#E9E7DE]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:
                          item.confidence +
                          "%",
                        background:
                          getRiskTone(
                            item.risk
                          ),
                      }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-[#7C8479]">
                    {item.indicators.join(
                      " · "
                    )}
                  </p>
                </div>
              )
            )}
          </div>

          {/* NEXT CHECKS */}
          <div className="border-t border-[#2D5016]/10 pt-5">
            <p className="font-mono text-[.61rem] uppercase tracking-[.14em] text-[#B85C4D]">
              Next checks
            </p>

            <ul className="mt-3 grid gap-2 text-sm text-[#66705E]">
              {nextSteps.map(
                (item: string) => (
                  <li
                    key={item}
                    className="flex gap-2"
                  >
                    <span className="text-[#B85C4D]">
                      →
                    </span>

                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ScreeningDisclaimer />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* HISTORY                                                                    */
/* -------------------------------------------------------------------------- */

function HistoryPanel({
  history,
}: {
  history: any[];
}) {
  return (
    <section className="mt-16 border-t border-[#2D5016]/10 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">
            Local history
          </p>

          <h2 className="mt-3 font-display text-2xl text-[#2D5016]">
            Recent screens
          </h2>
        </div>

        <span className="font-mono text-xs text-[#7C8479]">
          {history.length} saved
        </span>
      </div>

      {history.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-[#2D5016]/15 p-6 text-sm text-[#7C8479]">
          Your completed screens will appear
          here. History is stored only in this
          browser.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {history
            .slice(0, 3)
            .map((item) => {
              const historyMode =
                item.mode ||
                item.metadata?.status ||
                "DEMO MODE";

              const historyScore =
                item.overallHealthScore ??
                Math.max(
                  0,
                  100 -
                    (item.risk?.score ??
                      0)
                );

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#2D5016]/10 bg-[#FCFBF7] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[.62rem] text-[#7C8479]">
                      {new Date(
                        item.timestamp
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>

                    <span
                      className="font-mono text-xs"
                      style={{
                        color:
                          getHealthScoreTone(
                            historyScore
                          ),
                      }}
                    >
                      {getHealthScoreLabel(
                        historyScore
                      )}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#34412D]">
                    {item.topCondition ||
                      item.probabilities?.[0]
                        ?.label ||
                      "Unclassified"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#7C8479]">
                      Score {historyScore}/100
                    </span>

                    <span className="text-[#C6C7BE]">
                      ·
                    </span>

                    <span
                      className={
                        historyMode ===
                        "REAL MODEL CONNECTED"
                          ? "font-mono text-[.58rem] tracking-[.08em] text-[#5A7D4F]"
                          : historyMode ===
                              "MODEL UNAVAILABLE"
                            ? "font-mono text-[.58rem] tracking-[.08em] text-[#B85C4D]"
                            : "font-mono text-[.58rem] tracking-[.08em] text-[#8A632E]"
                      }
                    >
                      {historyMode}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}

export default Scanner;