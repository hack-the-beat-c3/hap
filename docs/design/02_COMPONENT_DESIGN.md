# D2: 컴포넌트 설계서 (Component Design)

- **Owner**: 김형준 (@procloudkim), 김경민 (@kyoungmin24)
- **Reviewer**: 팀 Reviewer
- **Status**: Completed (타로 1장 운세 + 파티 룸 + 오행 보완 케미 & 1:1 QR)
- **Related ADR**: ADR-0001, ADR-0002, ADR-0003
- **Related Claims**: 없음
- **Last Verified Commit**: bd5e97d

---

## 1. 아키텍처 개요

본 프로젝트는 React 19 + TypeScript + Vite 기반의 브라우저 단일 페이지 애플리케이션(SPA)입니다.
Ponytail 개발 원칙에 따라 무거운 외부 상태관리 라이브러리 없이 표준 React 훅과 순수 비즈니스 로직 함수로 구성됩니다.

---

## 2. 모듈 및 컴포넌트 구조

```
src/
├── domain/                         # 타로 1장 운세 및 사주 파생 로직
│   ├── saju.ts                     # 간이 사주 계산
│   └── tarot.ts                    # 22장 Web Crypto 무가중 1장 선택
├── data/
│   └── tarot.ts                    # 메이저 아르카나 22장 정적 메타데이터
├── lib/
│   ├── ohaeng.ts                   # 사주 5행 분포 계산
│   ├── room.ts                     # 룸 상태 및 채널 동기화
│   ├── chemistry/                  # 오행 보완 케미 순수 로직 (100% Testable)
│   │   ├── pickDeficientElement.ts # 부족 오행 산출
│   │   ├── classifyRelation.ts     # 4종 상생 관계 분류
│   │   └── generatePartyMission.ts # 룸 참가자 지목 및 미션 도출
│   └── match/                      # 1:1 현장 QR 매칭 로직
│       ├── encodeDecodePayload.ts  # QR 페이로드 안전 직렬화
│       └── calculateSynergyMatch.ts# 1:1 케미 점수 & 대화 주제 생성
├── components/
│   ├── TarotSoloFlow.tsx           # 1인 타로 운세 뽑기 & PNG 다운로드
│   ├── Recap.tsx                   # 멀티 룸 리캡 매트릭스 & 공유
│   ├── chemistry/                  # 오행 케미 컴포넌트 (ElementalChemistryCard 등)
│   └── match/                      # 1:1 QR 매칭 컴포넌트 (MatchHubModal 등)
└── App.tsx                         # 3대 모드 통합 쉘
```

---

## 3. 상태 소유권 및 책임

| 레이어 | 컴포넌트 / 모듈 | 책임 | 상태 소유권 |
|---|---|---|---|
| **Tarot Solo** | `TarotSoloFlow` | 동의 → 생년월일 → 사주 확인 → 타로 1장 → PNG 저장 | Local State (`step`, `draw`) |
| **Party Room** | `Party` / `RoomChannel` | 룸 생성(PIN), 참가자 입장, 카드 일괄 공개 | BroadcastChannel / In-Memory |
| **Chemistry** | `generatePartyMission` | 룸 참가자 중 부족 오행 1~3명 지목 미션 도출 | Pure Function |
| **1:1 Match** | `MatchHubModal` | 내 QR 표시, 상대방 스캔/선택, 1:1 궁합 리포트 | Local State (`connections`) |
