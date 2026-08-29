# D2: 컴포넌트 설계서 (Component Design)

- **Owner**: 미정
- **Reviewer**: 미정
- **Status**: Draft
- **Related ADR**: ADR-0002
- **Related Claims**: 없음
- **Last Verified Commit**: 07a88de

---

## 1. 아키텍처 개요

본 프로젝트는 React 19 + TypeScript + Vite 기반의 브라우저 단일 페이지 애플리케이션(SPA)입니다.
Ponytail 개발 원칙에 따라 무거운 전역 상태 라이브러리 없이 표준 React 훅과 순수 비즈니스 로직 함수로 구성됩니다.

---

## 2. 모듈 및 컴포넌트 구조

```
src/
├── types/
│   └── element.ts                  # 오행, 참가자, 케미 관계, 미션 결과 공통 인터페이스
├── lib/
│   └── chemistry/                  # 오행 보완 케미 순수 도메인 로직 (100% Unit Testable)
│       ├── constants.ts            # 5행 순환표, 상생표, 컬러/키워드 메타데이터
│       ├── pickDeficientElement.ts # 부족 오행 산출 순수 함수 (결정론적)
│       ├── classifyRelation.ts     # 상생 기반 4종 관계 분류기 (채움/밀어줌/받음/닮음)
│       ├── generatePartyMission.ts # 룸 참가자 선별 및 아이스브레이킹 미션 도출기
│       └── __tests__/              # Vitest 단위 테스트 스위트
├── components/
│   └── chemistry/                  # 프레젠테이션 UI 컴포넌트
│       ├── ElementalBadge.tsx      # 오행 시각화 뱃지 (a11y 지원)
│       ├── ElementalChemistryCard.tsx # 리캡 화면용 케미 미션 카드
│       ├── ShareableResultCard.tsx # SNS 공유용 안전한 결과 카드
│       ├── PartyChemistryPlayground.tsx # 인터랙티브 파티 시뮬레이터
│       └── chemistry.css           # 반응형 (390×844 / 1440×900) & 접근성 스타일
└── App.tsx                         # 루트 엔트리포인트
```

---

## 3. 상태 소유권 및 책임

| 레이어 | 컴포넌트 / 모듈 | 책임 | 상태 소유권 |
|---|---|---|---|
| **Domain Logic** | `pickDeficientElement` | 사주 5행 분포 중 부족 오행 추출 | Stateless (순수 함수) |
| **Domain Logic** | `classifyRelation` | 두 주 오행/부족 오행 간의 관계 분류 | Stateless (순수 함수) |
| **Domain Logic** | `generatePartyMission` | 룸 참가자 필터링 및 1~3명 지목 미션 생성 | Stateless (순수 함수) |
| **UI** | `ElementalChemistryCard` | 부족 오행 및 지목된 파티원, 미션 문구 표시 | Props 기반 순수 UI |
| **UI** | `ShareableResultCard` | 타인 닉네임 제외 소셜 공유 카드 렌더링 및 복사 | Local State (`copied`) |
| **Simulator** | `PartyChemistryPlayground` | 파티 룸 프리셋 및 참가자 동적 조작 데모 | Local State (`participants`, `myElements`) |
