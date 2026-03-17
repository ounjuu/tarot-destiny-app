# 🌙 LunaTarot

AI 기반 타로 카드 리딩 웹 애플리케이션

> https://tarot-destiny-app.vercel.app

> 달빛이 비추는 당신의 운명

<p align="center">
  <img width="705" height="697" alt="image" src="https://github.com/user-attachments/assets/730265aa-643c-40e7-b59c-4bafe74fddea" />
</p>

## 소개

LunaTarot은 타로 카드를 뽑고, AI가 카드 조합을 분석하여 맞춤형 해석을 제공하는 타로 리딩 서비스입니다.

### 주요 기능

- 🎴 **10가지 운세 카테고리** — 연애운, 커플운, 우정운, 시험운, 적성운, 학업운, 이직운, 건강운, 전생운, 회사운
- 🃏 **부채꼴 카드 뽑기** — 20장 중 6장을 선택하는 인터랙티브 UI
- ✨ **카드 뒤집기 애니메이션** — 6장을 뽑은 후 한 장씩 순차적으로 공개
- 🔮 **AI 타로 해석** — Gemini AI를 활용한 카드 조합 기반 맞춤형 리딩
- 📊 **운세 점수** — 카테고리별 운세 점수(%) 제공
- 💕 **카테고리별 스프레드** — 연애운은 하트 배치, 나머지는 2x3 그리드
- 📱 **모바일 앱뷰** — 모바일 최적화 반응형 UI

## 기술 스택

| 구분 | 기술 |
|------|------|
| **프론트엔드** | Next.js, React, TypeScript |
| **스타일링** | Tailwind CSS |
| **AI** | Google Gemini API |
| **패키지 매니저** | Yarn |
| **배포** | Vercel |

## 프로젝트 구조

```
tarot-destiny-app/
├── frontend/
│   ├── public/cards/              # 파스텔 동물 카드 SVG (22장)
│   │   └── rider-waite/           # Rider-Waite 클래식 카드 (22장)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/tarot/         # AI 타로 해석 API
│   │   │   ├── page.tsx           # 메인 페이지
│   │   │   ├── layout.tsx         # 레이아웃
│   │   │   └── globals.css        # 글로벌 스타일
│   │   ├── components/            # UI 컴포넌트
│   │   ├── data/                  # 타로 카드 데이터
│   │   └── lib/                   # 유틸리티
│   └── package.json
└── shared/types/                  # 공유 타입
```

## 시작하기

### 1. 의존성 설치

```bash
cd frontend
yarn install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Gemini API 키를 입력합니다:

```
GEMINI_API_KEY=your_api_key_here
```

API 키는 [Google AI Studio](https://aistudio.google.com/apikey)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
yarn dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 카드 디자인

두 가지 카드 디자인을 카테고리별로 사용합니다.

### Rider-Waite 클래식
연애운, 커플운, 시험운, 학업운, 이직운, 건강운, 전생운, 회사운에서 사용됩니다.
퍼블릭 도메인인 Rider-Waite 타로 카드 이미지를 활용했습니다.

### 파스텔 동물 카드
우정운, 적성운에서 사용됩니다.
메이저 아르카나 22장을 파스텔 스타일의 귀여운 동물 캐릭터로 디자인했습니다.
