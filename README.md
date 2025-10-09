# Zeropamine ⏳

집중력을 위한 미니멀한 뽀모도로 타이머 웹앱

## ✨ 주요 기능

- 🎨 **아름다운 모래시계 애니메이션**: 집중 시간엔 모래가 줄어들고, 휴식 시간엔 차오릅니다
- ⏱️ **커스터마이징 가능한 타이머**: 집중/휴식 시간을 자유롭게 설정 (기본: 25분/5분)
- 🔄 **자동 전환**: 집중과 휴식이 자동으로 전환됩니다
- 💾 **로컬 저장소**: 설정이 브라우저에 자동 저장됩니다
- 🔔 **알림 기능**: 타이머 종료 시 브라우저 알림을 받을 수 있습니다
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱에서 완벽하게 작동합니다
- ♿ **접근성**: ARIA 라벨과 시맨틱 HTML로 스크린 리더를 지원합니다

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **State Management**: React Hooks

## 🚀 시작하기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm run start
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── layout.tsx            # 레이아웃
│   └── globals.css           # 전역 스타일
├── components/
│   ├── pomodoro/
│   │   ├── Hourglass.tsx     # 모래시계 애니메이션 컴포넌트
│   │   ├── Timer.tsx         # 타이머 표시 컴포넌트
│   │   ├── Controls.tsx      # 제어 버튼 컴포넌트
│   │   └── SettingsDialog.tsx # 설정 다이얼로그
│   └── ui/                   # shadcn/ui 컴포넌트
├── hooks/
│   └── usePomodoro.ts        # 뽀모도로 로직 & 상태 관리
└── types/
    └── pomodoro.ts           # TypeScript 타입 정의
```

## 🎯 사용 방법

1. **시작**: '시작' 버튼을 눌러 타이머를 시작합니다
2. **일시정지**: 언제든지 타이머를 일시정지할 수 있습니다
3. **리셋**: 현재 세션을 초기화합니다
4. **설정**: 집중/휴식 시간, 자동 시작 여부를 설정합니다
5. **알림**: 첫 방문 시 알림 권한을 허용하면 타이머 종료 시 알림을 받습니다

## 🎨 디자인 컨셉

- **배경**: 부드러운 회색 그라데이션으로 집중을 방해하지 않는 차분한 분위기
- **모래시계**: 하얀색 모래시계로 시각적 피드백 제공
- **타이머**: 큰 모노스페이스 폰트로 가독성 극대화
- **버튼**: 반투명 효과로 현대적이고 미니멀한 느낌

## 📝 라이선스

MIT License
