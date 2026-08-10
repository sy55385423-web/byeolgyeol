import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * 우선순위:
 * 1) GEMINI_API_KEY → Google Gemini 2.0 Flash
 * 2) ANTHROPIC_API_KEY → Claude Sonnet (종량 과금)
 * 3) 없으면 로컬 claude CLI OAuth 세션
 */
export async function generateCompletion(
  userPrompt: string,
  systemPrompt: string,
): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    return generateWithGemini(userPrompt, systemPrompt);
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return generateWithApiKey(userPrompt, systemPrompt);
  }
  return generateWithOAuth(userPrompt, systemPrompt);
}

async function generateWithGemini(
  userPrompt: string,
  systemPrompt: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      maxOutputTokens: 3500,
      temperature: 0.4,
    },
  });
  const text = result.response.text();
  if (!text) throw new Error("Gemini 응답이 비어 있습니다.");
  return text;
}

async function generateWithApiKey(
  userPrompt: string,
  systemPrompt: string,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3500,
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
