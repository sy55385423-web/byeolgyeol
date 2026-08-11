import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * 우선순위:
 * 1) BYTEZ_API_KEY → Bytez (api.bytez.com, 모델명은 아래 BYTEZ_MODEL 참고 — 오픈소스 모델 호스팅)
 * 2) GEMINI_API_KEY → Google Gemini (모델명은 아래 GEMINI_MODEL 참고)
 * 3) ANTHROPIC_API_KEY → Claude Sonnet (종량 과금)
 * 4) NVIDIA_API_KEY → NVIDIA NIM (build.nvidia.com) — ⚠️ 무료 티어는 상업적 이용 불가라 최후순위로만 둠
 * 5) 없으면 로컬 claude CLI OAuth 세션
 */

// Bytez는 HuggingFace 모델 경로를 그대로 model ID로 씀. Qwen처럼 오픈소스 모델은
// provider-key 없이 바로 호출 가능. 계정에서 접근 가능한 정확한 태그로 교체할 것.
const BYTEZ_MODEL = "Qwen/Qwen2.5-7B-Instruct";

// gemini-2.0-flash는 2026-06-01부로 서비스 종료됨. 모델이 또 바뀌어 매 요청이 실패하면
// https://ai.google.dev/gemini-api/docs/models 에서 현재 무료 티어 모델명을 확인해 아래 값을 교체할 것.
const GEMINI_MODEL = "gemini-2.5-flash";

// build.nvidia.com 대시보드에서 실제로 발급받은/접근 가능한 모델 ID로 교체할 것.
const NVIDIA_MODEL = "meta/llama-3.3-70b-instruct";

export async function generateCompletion(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number = 4000,
): Promise<string> {
  if (process.env.BYTEZ_API_KEY) {
    return generateWithBytez(userPrompt, systemPrompt, maxTokens);
  }
  if (process.env.GEMINI_API_KEY) {
    return generateWithGemini(userPrompt, systemPrompt, maxTokens);
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return generateWithApiKey(userPrompt, systemPrompt, maxTokens);
  }
  if (process.env.NVIDIA_API_KEY) {
    return generateWithNvidia(userPrompt, systemPrompt, maxTokens);
  }
  return generateWithOAuth(userPrompt, systemPrompt);
}

async function generateWithBytez(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number,
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch("https://api.bytez.com/models/v2/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BYTEZ_API_KEY}`,
        },
        body: JSON.stringify({
          model: BYTEZ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_completion_tokens: maxTokens,
          temperature: 0.75,
          stream: false,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Bytez API 오류 (${res.status}): ${errText.slice(0, 500)}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Bytez 응답이 비어 있습니다.");
      return text;
    } catch (err) {
      lastErr = err;
      if (attempt < 1) await new Promise((r) => setTimeout(r, 400));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastErr;
}

async function generateWithNvidia(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number,
): Promise<string> {
  let lastErr: unknown;
  // 최대 2번만 시도 — 큰 모델이라 시도당 오래 걸릴 수 있어, 각 시도에 20초 타임아웃을 걸어
  // 응답이 멈춰도(hang) 무한정 기다리지 않고 다음 시도나 백업 텍스트로 넘어가게 함.
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: maxTokens,
          temperature: 0.75,
          stream: false,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`NVIDIA API 오류 (${res.status}): ${errText.slice(0, 500)}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("NVIDIA 응답이 비어 있습니다.");
      return text;
    } catch (err) {
      lastErr = err;
      if (attempt < 1) await new Promise((r) => setTimeout(r, 400));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastErr;
}

async function generateWithGemini(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  // 무료 티어 순간 과부하(429)나 일시 오류(503)에 대비해 짧게 재시도
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.75,
        },
      });
      const text = result.response.text();
      if (!text) throw new Error("Gemini 응답이 비어 있습니다.");
      return text;
    } catch (err) {
      lastErr = err;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function generateWithApiKey(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("모델 응답에서 텍스트를 찾을 수 없습니다.");
  }
  return textBlock.text;
}

async function generateWithOAuth(
  userPrompt: string,
  systemPrompt: string,
): Promise<string> {
  let resultText: string | null = null;

  for await (const message of query({
    prompt: userPrompt,
    options: {
      systemPrompt,
      tools: [],
      maxTurns: 1,
    },
  })) {
    if (message.type === "result") {
      if (message.subtype === "success") {
        resultText = message.result;
      } else {
        throw new Error(
          `claude 로그인 세션으로 응답을 생성하지 못했습니다 (${message.subtype}). 터미널에서 'claude login'을 실행했는지 확인해 주세요.`,
        );
      }
    }
  }

  if (!resultText) {
    throw new Error(
      "claude 로그인 세션을 찾지 못했습니다. 터미널에서 'claude login'을 실행한 뒤 다시 시도해 주세요.",
    );
  }
  return resultText;
}
