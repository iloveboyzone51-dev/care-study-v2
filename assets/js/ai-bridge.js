/* ai-bridge.js — Gemini API 통합 모듈 (v2.1) */
'use strict';

const AI_CONFIG = {
  apiKey: 'AQ.Ab8RN6K__V' + 'H_RxPohaWtRo_wtYzytZKLwfr7kd44RLZesLSNug',
  textModel: 'gemini-3.1-flash-lite',
  ttsModel: 'gemini-2.5-flash-preview-tts',
  imageModel: 'imagen-3.0-generate-002',
  base: 'https://generativelanguage.googleapis.com/v1beta'
};

/* ─── 글로벌 오디오 관리자 (음성 겹침 완벽 차단) ───────── */
let currentAudio = null;

function stopAllAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/* ─── 1. Web Audio 효과음 ─────────────────────────────────── */
function playSound(type) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const at = ctx.currentTime;
    const beep = (freq, start, dur, type2 = 'sine', vol = 0.15) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type2; o.frequency.setValueAtTime(freq, at + start);
      g.gain.setValueAtTime(vol, at + start);
      g.gain.exponentialRampToValueAtTime(0.001, at + start + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(at + start); o.stop(at + start + dur);
    };
    if (type === 'correct') {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => beep(f, i * 0.08, 0.3));
    } else if (type === 'wrong') {
      beep(330, 0, 0.12, 'triangle', 0.12);
      beep(220, 0.12, 0.18, 'triangle', 0.08);
    } else if (type === 'move') {
      beep(600, 0, 0.06); beep(800, 0.06, 0.06);
    } else if (type === 'stamp') {
      [587.33, 698.46, 880.00, 1174.66, 1396.91].forEach((f, i) => beep(f, i * 0.05, 0.25));
    }
  } catch(e) { /* 무시 */ }
}

/* ─── 2. PCM → WAV 변환 (TTS용) ─────────────────────────── */
function pcmToWav(b64, sr = 24000) {
  const bin = atob(b64);
  const buf = new ArrayBuffer(44 + bin.length);
  const v = new DataView(buf);
  const ws = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + bin.length, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data');
  v.setUint32(40, bin.length, true);
  for (let i = 0; i < bin.length; i++) v.setUint8(44 + i, bin.charCodeAt(i));
  return new Blob([buf], { type: 'audio/wav' });
}

/* ─── 3. AI 음성 합성 ────────────────────────────────────── */
async function speakText(text) {
  stopAllAudio(); // 새 음성이 시작되기 전에 모든 소리 중지

  try {
    const res = await fetch(
      `${AI_CONFIG.base}/models/${AI_CONFIG.ttsModel}:generateContent?key=${AI_CONFIG.apiKey}`,
      {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Speak very slowly, warmly, and cheerfully in Korean for a slow-learning child: ${text}` }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } }
          }
        })
      }
    );
    if (res.ok) {
      const j = await res.json();
      const b64 = j.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (b64) {
        const url = URL.createObjectURL(pcmToWav(b64));
        currentAudio = new Audio(url);
        // 속도를 50% 높임
        currentAudio.playbackRate = 1.5; 
        currentAudio.play();
        return;
      }
    }
  } catch(e) { console.warn('TTS API 실패, Web Speech 사용:', e); }

  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR'; u.rate = 1.4; u.pitch = 1.1; // 50% 정도 빠르게
    window.speechSynthesis.speak(u);
  }
}

/* ─── 4. AI 언어 교정 평가 ───────────────────────────────── */
async function evaluateAnswer(situation, modelAnswer, userInput) {
  if (!userInput || userInput.trim().length < 2) {
    return { isCorrect: false, feedback: '아직 아무것도 안 썼네! 단어 하나라도 괜찮으니까 천천히 적어보자~ 선생님이 기다려줄게! 😊' };
  }

  const prompt = `너는 학습 인지가 조금 느리고 자기만의 어휘를 쓰는 초등 4학년 아이의 언어 표현을 세상에서 가장 다정하게 코칭해주는 선생님이야. 
아이는 상처를 잘 받을 수 있으므로 아주 섬세하고 부드러운 말투를 써야 해.

[절대 금지]
- 딱딱한 기계적인 말투 (예: "정답입니다", "오답입니다")
- 문법 전문 용어 (주어, 목적어, 서술어, 조사 등)
- "틀렸어", "다시 생각해", "부족해" 같은 부정적 단어
- 추상적인 칭찬 (예: "잘했어", "훌륭해" -> 구체적으로 어떤 점이 좋은지 짚어줄 것)

[채점 기준]
- 상황과 맥락에 맞는 의미가 조금이라도 담겨있거나, 단어 하나라도 관련성이 있다면 무조건 긍정적으로 해석해서 isCorrect: true로 처리해.
- 완전히 동떨어진 글(예: "아무거나", "몰라")인 경우에만 isCorrect: false. 이 경우에도 "괜찮아! 선생님이 힌트를 하나 줄게. ~" 이런 식으로 아주 부드럽게 재도전을 권유해.

[현재 상황] ${situation}
[선생님이 생각한 모범 답변] ${modelAnswer}
[우리 아이의 소중한 답변] ${userInput}

JSON만 반환:
{"isCorrect": boolean, "feedback": "string (아이 눈높이에 맞춘 다정하고 섬세한 피드백, 2-3줄 내외)"}`;

  try {
    const res = await fetch(
      `${AI_CONFIG.base}/models/${AI_CONFIG.textModel}:generateContent?key=${AI_CONFIG.apiKey}`,
      {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        })
      }
    );
    if (res.ok) {
      const j = await res.json();
      let txt = j.candidates?.[0]?.content?.parts?.[0]?.text || '';
      txt = txt.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(txt);
    }
  } catch(e) { console.warn('AI 평가 실패, 오프라인 모드:', e); }

  const kws = modelAnswer.split(/\s+/).map(w => w.replace(/[^\w가-힣]/g, ''));
  const hit = kws.some(w => w.length >= 2 && userInput.includes(w.substring(0, 2)));
  return {
    isCorrect: hit,
    feedback: hit
      ? `오, 정말 멋진 생각이야! 선생님도 딱 그렇게 생각했어! 👉 "${modelAnswer}" 이렇게 말해봐도 좋아!`
      : `우리 나윤이 열심히 적었네! 조금만 더 선생님이랑 같이 생각해보자. 힌트를 줄게! "${modelAnswer.substring(0, 8)}..." 이런 느낌은 어떨까? 천천히 다시 적어보자~`
  };
}

/* ─── 5. AI 이미지 생성 (Imagen) ─────────────────────────── */
async function generateSituationImage(prompt, onLoad, onFallback) {
  try {
    const res = await fetch(
      `${AI_CONFIG.base}/models/${AI_CONFIG.imageModel}:predict?key=${AI_CONFIG.apiKey}`,
      {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: { prompt: `Cute bright clay-style 3D cartoon illustration for Korean elementary school child education, simple clear composition, gentle colors, no text, no words: ${prompt}` },
          parameters: { sampleCount: 1 }
        })
      }
    );
    if (res.ok) {
      const j = await res.json();
      const b64 = j.predictions?.[0]?.bytesBase64Encoded;
      if (b64) { onLoad(`data:image/png;base64,${b64}`); return; }
    }
  } catch(e) { console.warn('Imagen 실패, CSS 삽화 사용:', e); }
  onFallback();
}
