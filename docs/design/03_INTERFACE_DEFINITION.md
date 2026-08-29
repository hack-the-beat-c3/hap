# D3: 인터페이스 정의서 (Interface Definition)

- **Owner**: 미정
- **Reviewer**: 미정
- **Status**: Draft
- **Related ADR**: ADR-0002
- **Related Claims**: 없음
- **Last Verified Commit**: 07a88de

---

## 1. 도메인 인터페이스 계약 (`src/types/element.ts`)

### 1.1 오행 타입 (`FiveElement`, `ElementCounts`)
```typescript
export type FiveElement = '木' | '火' | '土' | '金' | '水';

export interface ElementCounts {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}
```

### 1.2 참가자 프로필 (`ParticipantProfile`)
```typescript
export interface ParticipantProfile {
  id: string;
  nickname: string;
  primaryElement: FiveElement;
  elements: ElementCounts;
  isHost?: boolean;
  joinedOrder: number;
}
```

### 1.3 지목 대상 및 미션 결과 (`ElementalMissionResult`)
```typescript
export type RelationType = 'complement' | 'generate' | 'support' | 'mirror';

export interface MissionTarget {
  id: string;
  nickname: string;
  primaryElement: FiveElement;
  relationType: RelationType;
  relationLabel: string;
  explanation: string;
}

export interface ElementalMissionResult {
  myDeficientElement: FiveElement;
  isBalanced: boolean;
  elementNameKorean: string;
  elementHanja: FiveElement;
  elementKeyword: string;
  elementColor: string;
  elementBgColor: string;
  missionHeadline: string;
  missionDescription: string;
  targets: MissionTarget[];
  hasTargets: boolean;
  fallbackReason?: 'no_complement_in_room' | 'single_participant' | 'all_same_element';
}
```

---

## 2. 함수 시그니처

### `pickDeficientElement(elements: ElementCounts): DeficientElementResult`
- **입력**: 사주 5행 분포 객체
- **출력**: `{ deficientElement: FiveElement, isBalanced: boolean, minValue: number }`

### `classifyRelation(myPrimary: FiveElement, myDeficient: FiveElement, theirPrimary: FiveElement): RelationClassification`
- **입력**: 내 주 오행, 내 부족 오행, 상대 주 오행
- **출력**: `{ relationType: RelationType, relationLabel: string, explanation: string }`

### `generatePartyMission(options: GenerateMissionOptions): ElementalMissionResult`
- **입력**: `{ myId: string, participants: ParticipantProfile[] }`
- **출력**: `ElementalMissionResult`
