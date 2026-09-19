import { ThreatDetails } from '../types';

export interface AiAnalysisResult {
  explanation: string;
  businessImpact: string;
  recommendedResponse: string;
  futurePrevention: string[];
}

export async function analyzeThreatWithGemini(
  threat: ThreatDetails,
  onChunk?: (chunk: string) => void
): Promise<AiAnalysisResult> {
  const response = await fetch('/api/analyze-threat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threat, stream: true })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to generate Gemini AI Security Analysis.');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const data = await response.json();
    if (data.analysis) {
      return data.analysis;
    }
    throw new Error('Received empty response from Gemini API.');
  }

  const decoder = new TextDecoder();
  let accumulatedRaw = '';
  let parsedAnalysis: AiAnalysisResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const textChunk = decoder.decode(value, { stream: true });
    const lines = textChunk.split('\n\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const dataStr = trimmed.replace('data: ', '').trim();
        try {
          const payload = JSON.parse(dataStr);
          if (payload.chunk) {
            accumulatedRaw += payload.chunk;
            if (onChunk) onChunk(accumulatedRaw);
          }
          if (payload.done) {
            if (payload.analysis) {
              parsedAnalysis = payload.analysis;
            } else if (payload.fullText) {
              const clean = payload.fullText.replace(/```json/g, "").replace(/```/g, "").trim();
              parsedAnalysis = JSON.parse(clean);
            }
          }
          if (payload.error) {
            throw new Error(payload.error);
          }
        } catch (e: any) {
          if (e.message && !e.message.includes('JSON')) {
            console.warn('Stream parse notice:', e);
          }
        }
      }
    }
  }

  if (!parsedAnalysis && accumulatedRaw) {
    try {
      const clean = accumulatedRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedAnalysis = JSON.parse(clean);
    } catch (e) {
      console.warn('Raw JSON parse fallback:', e);
    }
  }

  if (parsedAnalysis) {
    return parsedAnalysis;
  } else {
    throw new Error('Could not parse valid AI analysis from Gemini stream.');
  }
}
