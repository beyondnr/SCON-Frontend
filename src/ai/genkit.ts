// File: studio/src/ai/genkit.ts
/**
 * [Script Purpose]
 * Google Genkit SDK를 초기화하고 구성하는 파일입니다.
 * AI 모델(Gemini)과 플러그인을 설정합니다.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * [Variable Purpose]
 * 설정된 Genkit 인스턴스입니다.
 * - Plugins: googleAI
 * - Model: gemini-2.5-flash
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
