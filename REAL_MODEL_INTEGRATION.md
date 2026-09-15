# CHILLI-SHIELD real model integration architecture

## Current status

The project remains in **DEMO MODE** unless `VITE_REAL_MODEL_ENDPOINT` is configured at build time and the endpoint returns a validated response. No trained model, dataset, accuracy value, prediction, or performance claim is included in this project.

The router has three explicit states:

| Status | Meaning | Scanner behavior |
|---|---|---|
| `DEMO MODE` | No real endpoint is configured. | Uses the existing `DemoAIService` and marks the result as simulated. |
| `REAL MODEL CONNECTED` | A configured endpoint returned a valid response matching the contract. | Uses the returned model metadata, probabilities, confidence, risk, explanation, and next steps. |
| `MODEL UNAVAILABLE` | A configured endpoint timed out, returned an error, or failed contract validation. | Keeps the unavailable reason visible and returns a DemoAIService fallback result. |

The UI never labels a result as real merely because an endpoint URL exists. The status changes to `REAL MODEL CONNECTED` only after the response passes validation.

## Files created or modified

| File | Change |
|---|---|
| `client/src/services/modelTypes.ts` | Shared model status, metadata, quality, probability, risk, inference response, and service interfaces. |
| `client/src/services/realModelConfig.ts` | Reads non-secret build-time configuration from `VITE_REAL_MODEL_*` variables. No credentials belong here. |
| `client/src/services/RealAIService.ts` | Real adapter boundary: image quality check, multipart request, timeout, response validation, and normalized result metadata. |
| `client/src/services/AIServiceRouter.ts` | Chooses DemoAIService when no endpoint is configured, RealAIService when configured, and keeps DemoAIService as fallback after real-service failure. |
| `client/src/pages/Scanner.tsx` | Routes scans through the service router and shows model status, model name/version, unavailable reasons, and fallback behavior without redesigning the existing visual system. |
| `REAL_MODEL_INTEGRATION.md` | This implementation and handoff guide. |

## Image input

`RealAIService.scan(file, onProgress?)` receives a browser `File` object from the scanner upload flow. Before a request is made, it checks the MIME type, a 10 MB maximum size, and the smallest image dimension when the browser can read it. The request is sent as `multipart/form-data`:

```text
image=<binary image file>
quality=<JSON string containing the quality check result>
```

The current adapter uses a same-origin-safe configurable endpoint. A production deployment should normally use a same-origin backend route such as `/api/real-model/infer`, not a browser-visible vendor URL with credentials.

Configure the optional `VITE_REAL_MODEL_*` values through the project’s environment/secret configuration; this change intentionally does not create or edit `.env` files.

## Required model response

The endpoint must return `application/json` with this shape:

```json
{
  "model": {
    "name": "your-model-name",
    "version": "2026-09-15",
    "provider": "your-serving-system"
  },
  "probabilities": [
    {
      "classId": "curl-virus",
      "label": "Chilli Leaf Curl / Curl Virus",
      "probability": 0.82
    }
  ],
  "confidence": 0.82,
  "risk": {
    "level": "HIGH",
    "score": 74,
    "rationale": "The returned class distribution crosses the configured high-risk threshold."
  },
  "explanation": "A validated model explanation for the returned class distribution.",
  "recommendedNextSteps": [
    "Inspect surrounding plants and leaf undersides",
    "Seek local agronomic confirmation before treating"
  ]
}
```

`probability` and `confidence` are normalized to the range `0..1`. `risk.score` is optional at the conceptual level but should be supplied by the backend so the client does not invent risk from an uncalibrated class score. The backend owns threshold calibration and explanation generation. The client validates required fields but does not claim that the model is accurate.

## Where the trained model connects

The connection point is `postWithTimeout()` in `client/src/services/RealAIService.ts`. That function is intentionally small: it receives the image, sends the multipart request, validates the response contract, and returns a normalized `RealInferenceResponse`. Replace the backend endpoint implementation without changing the scanner UI or `DemoAIService`.

## How to replace the demo later

1. Provide a trained model and its serving endpoint outside this repository, together with a reviewed class taxonomy matching the disease-library IDs.
2. Implement a secure backend route that accepts the image, performs server-side preprocessing, invokes the model, calculates calibrated confidence/risk, and returns the documented JSON contract.
3. Set `VITE_REAL_MODEL_ENDPOINT` to that same-origin route and set the model provider/name/version variables at build time.
4. Test valid images, invalid images, timeouts, malformed responses, unknown classes, and backend errors. Confirm the scanner shows `REAL MODEL CONNECTED` only for validated responses.
5. Keep `DemoAIService` enabled as the explicit fallback until real-model testing is complete and a product owner accepts the serving behavior.

No code path should be changed to force `REAL MODEL CONNECTED`. That label is earned only by a successful, validated response from the configured endpoint.

## Backend and deployment requirements

A real deployment needs a server-side inference boundary, authentication and authorization, request size limits, MIME/content validation, rate limiting, structured logs, timeout handling, model version pinning, and monitoring for malformed or low-quality inputs. The backend should avoid exposing provider API keys or private model URLs to the browser. If images are stored for evaluation, retention, consent, deletion, and access controls must be defined before enabling storage.

The backend should also own model-specific preprocessing, class mapping, calibration, threshold configuration, explanation generation, and audit metadata. The browser should treat those fields as a screening response, not as proof of disease or agronomic advice. Laboratory or qualified agronomic confirmation remains the escalation path for consequential field decisions.

## What is not included

This change does not include a trained model, model weights, dataset, training code, performance metrics, claims of accuracy, a live inference endpoint, authentication credentials, or any statement that real AI inference is active.
