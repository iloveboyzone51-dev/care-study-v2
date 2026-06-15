/* attention.js — 보리 캐릭터 & 집중 보조 (v2.1 정적 UI) */
'use strict';

/* ─── 보리 SVG 주입 ──────────────────────────────────────── */
function injectBori() {
  if (document.getElementById('bori-wrapper')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'bori-wrapper';
  wrapper.innerHTML = `
    <div id="bori-bubble" class="bori-bubble hidden">
      <p id="bori-text"></p>
    </div>
    <div id="bori-body" onclick="boriTapped()">
      <svg id="bori-svg" viewBox="0 0 100 120" width="80" height="96">
        <!-- 꽁지 깃털 -->
        <ellipse cx="50" cy="29" rx="4.5" ry="8" fill="#FFE066" transform="rotate(0,50,29)"/>
        <ellipse cx="42" cy="32" rx="3.5" ry="7" fill="#FFD633" transform="rotate(-18,42,32)"/>
        <ellipse cx="58" cy="32" rx="3.5" ry="7" fill="#FFD633" transform="rotate(18,58,32)"/>
        <!-- 몸통 -->
        <ellipse cx="50" cy="80" rx="26" ry="28" fill="#FFE566"/>
        <!-- 날개 -->
        <ellipse cx="24" cy="82" rx="10" ry="5.5" fill="#FFD633" transform="rotate(-25,24,82)"/>
        <ellipse cx="76" cy="82" rx="10" ry="5.5" fill="#FFD633" transform="rotate(25,76,82)"/>
        <!-- 머리 -->
        <ellipse cx="50" cy="50" rx="22" ry="20" fill="#FFE566"/>
        <!-- 볼 블러시 -->
        <ellipse cx="33" cy="55" rx="5" ry="3" fill="#FFB7C5" opacity="0.65"/>
        <ellipse cx="67" cy="55" rx="5" ry="3" fill="#FFB7C5" opacity="0.65"/>
        <!-- 눈 -->
        <ellipse id="b-eye-l" cx="41" cy="48" rx="4" ry="4.2" fill="#2C3E50"/>
        <ellipse id="b-eye-r" cx="59" cy="48" rx="4" ry="4.2" fill="#2C3E50"/>
        <circle cx="42.5" cy="46.5" r="1.4" fill="white"/>
        <circle cx="60.5" cy="46.5" r="1.4" fill="white"/>
        <!-- 부리 -->
        <polygon id="b-beak" points="50,57 44,63 56,63" fill="#FF9800"/>
        <!-- 입 -->
        <path id="b-mouth" d="M 44,62 Q 50,69 56,62" fill="none" stroke="#2C3E50" stroke-width="2.2" stroke-linecap="round"/>
        <!-- 발 -->
        <line x1="40" y1="108" x2="34" y2="118" stroke="#FF9800" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="108" x2="43" y2="118" stroke="#FF9800" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="108" x2="66" y2="118" stroke="#FF9800" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="108" x2="57" y2="118" stroke="#FF9800" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>
  `;
  document.body.appendChild(wrapper);
}

/* ─── 보리 감정 변경 ─────────────────────────────────────── */
function setBoriEmotion(emotion) {
  const mouth = document.getElementById('b-mouth');
  const eyeL = document.getElementById('b-eye-l');
  const eyeR = document.getElementById('b-eye-r');
  if (!mouth) return;
  if (emotion === 'happy') {
    mouth.setAttribute('d', 'M 44,62 Q 50,69 56,62');
    eyeL.setAttribute('ry', '4.2'); eyeR.setAttribute('ry', '4.2');
  } else if (emotion === 'thinking') {
    mouth.setAttribute('d', 'M 44,63 L 56,63');
    eyeL.setAttribute('ry', '2.5'); eyeR.setAttribute('ry', '2.5');
  } else if (emotion === 'cheering') {
    mouth.setAttribute('d', 'M 42,61 Q 50,71 58,61');
    eyeL.setAttribute('ry', '4.8'); eyeR.setAttribute('ry', '4.8');
  } else if (emotion === 'sad') {
    mouth.setAttribute('d', 'M 44,68 Q 50,62 56,68');
    eyeL.setAttribute('ry', '2'); eyeR.setAttribute('ry', '2');
  }
}

/* ─── 보리 말풍선 ────────────────────────────────────────── */
let boriMsgTimer;
function showBoriMessage(msg, duration = 4500, emotion = 'happy') {
  const bubble = document.getElementById('bori-bubble');
  const text = document.getElementById('bori-text');
  if (!bubble || !text) return;
  text.innerHTML = msg;
  bubble.classList.remove('hidden');
  setBoriEmotion(emotion);
  clearTimeout(boriMsgTimer);
  boriMsgTimer = setTimeout(() => bubble.classList.add('hidden'), duration);
}

window.currentBoriContext = null;

async function boriTapped() {
  const bubble = document.getElementById('bori-bubble');
  const text = document.getElementById('bori-text');
  
  if (window.currentBoriContext) {
    // AI 힌트 모드
    setBoriEmotion('thinking');
    bubble.classList.remove('hidden');
    text.innerHTML = '<span class="ai-spinner"></span> 보리가 생각 중 삐약...';
    
    const hint = await askBoriHint(window.currentBoriContext);
    showBoriMessage(hint, 6000, 'cheering');
    if (typeof speakText === 'function') speakText(hint);
  } else {
    // 기본 모드
    const msgs = [
      '천천히 해도 괜찮아! 선생님이 기다려줄게 😊',
      '우리 나윤이, 정말 잘하고 있어!',
      '어렵다고 느껴지면 아빠한테 도와달라고 해볼까? 🐣',
      '거의 다 왔어! 조금만 더 생각해보자!',
    ];
    const m = msgs[Math.floor(Math.random() * msgs.length)];
    showBoriMessage(m, 4000, 'cheering');
    if (typeof speakText === 'function') speakText(m);
  }
}

/* ─── 아이들 집중 유지 (30초 무반응 감지) ─────────────────── */
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const msgs = [
      '아직 안 끝났어? 천천히 생각나는 대로 써봐도 돼~ 😊',
      '조금 쉬고 싶어? 심호흡 한 번 크게 하고 다시 해보자!',
      '어려운 거 있으면 선생님이나 아빠한테 물어봐! 🐣',
    ];
    const m = msgs[Math.floor(Math.random() * msgs.length)];
    showBoriMessage(m, 5000, 'thinking');
    if (typeof speakText === 'function') speakText(m);
  }, 45000); // 30초는 너무 짧아 재촉하는 느낌을 줄 수 있으므로 45초로 연장
}

window.addEventListener('DOMContentLoaded', () => {
  injectBori();
  resetIdle();
  ['click', 'keydown', 'touchstart', 'scroll'].forEach(e =>
    document.addEventListener(e, resetIdle, { passive: true })
  );
});
