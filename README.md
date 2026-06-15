# 스마트 케어 학습 시스템 v2.1 🌿
나윤이를 위한 맞춤형, 아빠표 홈스쿨링 웹 애플리케이션입니다.

---

## 🤖 안티그래비티(AI 에이전트) 인수인계서
> 이 섹션은 다른 PC(또는 새로운 세션)에서 안티그래비티를 실행했을 때, 이전의 컨텍스트를 100% 복원하기 위한 가이드입니다. 
> **새로운 환경에서 AI를 켰다면 가장 먼저 이 내용을 읽고 현재 아키텍처를 파악하세요.**

### 1. 프로젝트 철학 및 사용자 대상
- **대상**: 인지가 다소 느리고 학습 능력이 또래보다 부족한 초등학교 4학년 아이.
- **철학**: "틀렸어"라는 차가운 지적보다는, 무조건적인 칭찬과 아주 부드러운 유도(힌트)를 통해 아이의 상처를 방지하고 동기를 부여해야 합니다.
- **말투**: 세상에서 가장 다정하고 따뜻한 선생님의 말투. 오디오 속도는 1.4~1.5 배속으로 시원하지만 다정하게.

### 2. 기술 스택 및 구조
- **Front-end**: 순수 HTML, CSS(Vanilla), JavaScript. 프레임워크 없음.
- **Hosting**: GitHub Pages (`iloveboyzone51-dev.github.io/care-study-v2/`)
- **Storage**: 브라우저 `localStorage` 기반 (학습 이력, 나뭇잎, 연속 출석일 등 보존)
- **AI Integration**:
  - `ai-bridge.js`를 통해 Gemini API 통신.
  - Text 모델: `gemini-3.1-flash-lite` (정답 평가, 따뜻한 편지 생성 및 **보리 힌트 조력자 역할 수행**)
  - TTS 모델: `gemini-2.5-flash-preview-tts` (다정한 음성 피드백)
  - Image 모델: `imagen-3.0-generate-002` (상황에 맞는 그림 즉석 생성, 버그 픽스 완료)
- **Audio Control**: 음성이 겹치지 않도록 `window.currentAudio` 전역 객체로 중앙 제어. 발화 전 기존 오디오 무조건 정지.
- **Data Layer (v2.2 추가)**: `question_bank.js`를 통해 5과목(국/영/수/과/사)의 단원별 문제은행(Pool)을 구축하여 동적 렌더링.

### 3. 디렉토리 아키텍처
- `/index.html`: 메인 대시보드 (파트 1: 아빠와 학습, 파트 2: 스스로 학습 완벽 분리)
- `/assets/css/base.css`: 전역 스타일 (애니메이션은 최소화, 차분한 UI)
- `/assets/js/engine.js`: LocalStorage 데이터 관리 (attendance, attention 등)
- `/assets/data/question_bank.js`: 국/영/수/과/사 초4 단원별 문제은행 DB
- `/assets/js/attention.js`: 보리 캐릭터 UI 처리 (클릭 시 실시간 AI 힌트 발동)
- `/assets/js/ai-bridge.js`: 프롬프트 설정 및 API 통신 (코어 로직)
- `/days/YYYY-MM-DD/`: 매일 갱신되는 학습지 폴더. (예: `days/2026-06-15/`)
  - `block-a.html`: 아빠와 함께하는 30분 활동 (상황극, 딜레마, 집중미션 등 총 7스테이지)
  - `block-b.html`: 아이 혼자 푸는 문제 (국/영/수/과 원-플로우 진행)

### 4. 새로운 문제(Next Day) 생성 가이드 (AI Action Item)
아버님께서 "내일 문제 만들어줘"라고 요청하시면 AI는 다음을 수행해야 합니다.
1. `/days/YYYY-MM-DD/` (새로운 날짜) 폴더를 생성합니다.
2. 이전 날짜의 `block-a.html`과 `block-b.html`을 복사한 뒤, 내부에 하드코딩된 **문제 데이터(`SCENARIOS`, 국/영/수/과 콘텐츠)만 교체**합니다.
3. `index.html` 내에 있는 **오늘 날짜 변수(`getTodayString()` 혹은 라우팅 로직)**가 새로운 폴더를 향하도록 수정하거나 확인합니다.
4. Git Add, Commit, Push 하여 GitHub Pages에 배포합니다.

---

## 👨‍👧 아버님을 위한 가이드

- **데이터 저장**: 아이의 기록(나무, 잎사귀)은 **집 노트북(크롬)**에 계속 저장됩니다. 회사에서 작업하신 기록과 분리되어 있으니 걱정하지 않으셔도 됩니다.
- **이어하기**: 집이나 새로운 컴퓨터에서 작업을 이어가실 때는 안티그래비티 창에 아래 문장을 복사해서 붙여넣어 주세요!

> "안티그래비티, https://github.com/iloveboyzone51-dev/care-study-v2.git 저장소를 로컬로 클론(Clone)하고, README.md의 인수인계서를 읽은 뒤에 작업 준비를 해줘!"
