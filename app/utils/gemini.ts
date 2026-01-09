import { GoogleGenAI } from '@google/genai';

/**
 * Gemini AI 工具类
 * 使用新版本 Google GenAI SDK
 */

/**
 * 调用 Gemini API 生成内容
 * @param prompt 提示词
 * @param apiKey API 密钥
 * @param options 生成配置选项
 * @returns 生成的文本内容
 */
export async function generateWithGemini(
  prompt: string,
  apiKey: string,
  options?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: options?.temperature ?? 0.7,
        topK: options?.topK ?? 40,
        topP: options?.topP ?? 0.95,
        maxOutputTokens: options?.maxOutputTokens ?? 2048,
      }
    });

    const text = response.text;

    if (!text) {
      throw new Error('Gemini API 返回空结果');
    }

    return text;
  } catch (error) {
    console.error('Gemini API 调用失败:', error);
    throw error;
  }
}


/**
 * 验证 API 密钥是否有效
 * @param apiKey API 密钥
 * @returns 是否有效
 */
export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    await generateWithGemini('Hello', apiKey, { maxOutputTokens: 10 });
    return true;
  } catch (error) {
    console.error('API 密钥验证失败:', error);
    return false;
  }
}