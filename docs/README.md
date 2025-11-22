# NextN - Firebase Studio Starter

Next.js 15 기반의 Firebase Studio 스타터 프로젝트입니다. 이 프로젝트는 인력 관리 및 비즈니스 운영을 위한 대시보드 애플리케이션의 기본 구조를 제공하며, Firebase와 Google의 Genkit AI SDK가 통합되어 있습니다.

## ✨ 주요 기능

*   **대시보드 (Dashboard)**: 주요 지표 및 일정 요약 카드
*   **보고서 (Reports)**: 급여 및 운영 보고서 테이블
*   **일정 관리 (Availability)**: 직원 일정 및 가용성 관리
*   **온보딩 (Onboarding)**: 다단계 계정 설정 및 매장/직원 등록 흐름
*   **AI 통합**: Genkit을 이용한 AI 기능 기반 마련

## 🛠 기술 스택

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, tailwind-merge, clsx
*   **UI Components**: Radix UI (via Shadcn UI pattern), Lucide React icons
*   **Backend/Auth**: Firebase (v11)
*   **AI**: Genkit (Google AI SDK)
*   **Charts**: Recharts
*   **Forms**: React Hook Form + Zod

## 🚀 시작하기 (Getting Started)

로컬 개발 환경에서 프로젝트를 실행하는 방법입니다.

### 필수 요구사항 (Prerequisites)

*   Node.js (v18 이상 권장)
*   npm 또는 yarn/pnpm

### 설치 (Installation)

1.  프로젝트 디렉토리로 이동합니다.
    ```bash
    cd studio
    ```

2.  의존성 패키지를 설치합니다.
    ```bash
    npm install
    ```

### 환경 변수 설정 (Environment Setup)

AI 기능(Genkit)을 사용하기 위해서는 API 키 설정이 필요할 수 있습니다. 루트 디렉토리에 `.env.local` 파일을 생성하고 필요한 환경 변수를 추가하세요. (예: Google GenAI 사용 시)

```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```

### 실행 (Running the App)

**1. 개발 서버 실행**

Next.js 개발 서버를 실행합니다. 이 프로젝트는 기본적으로 포트 **9002**를 사용하도록 설정되어 있습니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:9002`로 접속하여 확인합니다.

**2. Genkit 개발 도구 실행 (선택 사항)**

Genkit AI 개발 도구를 실행하려면 다음 명령어를 사용합니다.

```bash
npm run genkit:dev
```

## 📂 프로젝트 구조 (Project Structure)

```
studio/
├── src/
│   ├── ai/           # Genkit AI 관련 설정 및 로직
│   ├── app/          # Next.js App Router 페이지 및 레이아웃
│   │   ├── (app)/    # 인증된 사용자용 페이지 (대시보드 등)
│   │   ├── onboarding/ # 온보딩 흐름 페이지
│   │   └── ...
│   ├── components/   # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/       # 기본 UI 요소 (Button, Input 등)
│   │   └── layout/   # 레이아웃 컴포넌트 (Header, Sidebar)
│   ├── hooks/        # Custom React Hooks
│   └── lib/          # 유틸리티 함수, 타입 정의, Mock 데이터
├── public/           # 정적 파일
└── ...
```

## 📜 스크립트 (Scripts)

*   `npm run dev`: 개발 서버 실행 (Port 9002, Turbopack 사용)
*   `npm run build`: 프로덕션 빌드
*   `npm run start`: 프로덕션 서버 실행
*   `npm run lint`: 코드 린트 검사
*   `npm run genkit:dev`: Genkit 개발 UI 실행

## 🎨 디자인 시스템 (Design System)

*   **Typography**:
    *   Headline: `PT Sans` - 전문적이고 신뢰감을 주는 헤드라인 폰트
    *   Body: `Inter` - 가독성이 뛰어난 본문 폰트
    *   Code: `monospace`
*   **Color Palette**: `globals.css`에 정의된 CSS 변수 기반의 다크 모드 지원 시스템
    *   Primary: 브랜드 메인 컬러 (Blue 계열)
    *   Secondary, Accent, Muted: 계층 구조를 표현하는 보조 컬러
    *   Semantic Colors: Destructive (삭제/위험) 등 기능적 의미 전달
*   **Components**: [Radix UI](https://www.radix-ui.com/) Primitives 기반의 [shadcn/ui](https://ui.shadcn.com/) 라이브러리 사용으로 접근성과 커스터마이징 용이성 확보

## 🔄 데이터 흐름 (Data Flow)

1.  **State Management**:
    *   `React Context API`: 온보딩 프로세스 등 전역적인 상태 관리가 필요한 경우 사용 (`OnboardingContext`)
    *   `React Hook Form` + `Zod`: 복잡한 폼 데이터 처리 및 유효성 검사
2.  **Data Source**:
    *   현재는 `src/lib/mock-data.ts`를 통해 프론트엔드 로직 및 UI 프로토타이핑 검증
    *   향후 Firebase Firestore와 연동하여 실시간 데이터 동기화 예정
3.  **AI Integration**:
    *   Google Genkit SDK 초기화 (`src/ai/genkit.ts`) 및 Gemini 1.5 Flash 모델 설정 완료

## 💡 핵심 UX 특징 (Core UX Features)

*   **직관적인 대시보드**: 핵심 지표(예상 인건비, 승인 대기 건)를 요약 카드 형태로 최상단에 배치하여 업무 우선순위 파악 용이
*   **단계별 온보딩 (Wizard)**: 복잡한 초기 설정을 계정 -> 매장 -> 직원 등록의 단계로 나누어 사용자의 인지 부하 감소
*   **인터랙티브 피드백**: 데이터 갱신, 저장 등 주요 액션에 대해 `Toast` 알림을 제공하여 시스템 상태 명확히 전달
*   **반응형 레이아웃**: 데스크탑 및 모바일 환경에 최적화된 사이드바 및 그리드 시스템 적용

## 🗺️ 주요 흐름 (Main Flows)

1.  **초기 설정 (Onboarding)**
    *   사용자 계정 생성 및 이메일 검증 (Zod Schema)
    *   매장 운영 정보(영업 시간, 업종) 입력
    *   초기 직원 명단 등록 및 시급 설정
2.  **일정 관리 (Schedule Management)**
    *   대시보드에서 주간 일정 확인
    *   AI 추천 또는 수동 입력을 통한 근무 일정 편성 (구현 예정)
    *   관리자 승인 프로세스 (`ApproveButton`)

## 🔮 향후 개선 사항 (Future Improvements)

*   **Firebase Backend 연동**: Authentication, Firestore, Cloud Functions 연결
*   **AI 스케줄링 자동화**: 직원 가용성 및 매장 운영 시간을 기반으로 한 최적 스케줄 자동 생성 기능
*   **고급 리포트**: 기간별 인건비 추이, 직원별 근무 시간 분석 차트 고도화
*   **알림 시스템**: 모바일 푸시 알림 및 이메일 연동