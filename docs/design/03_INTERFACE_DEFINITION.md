# D3: 인터페이스 정의서 (Interface Definition)

- **Owner**: 김형준 (@procloudkim), 김경민 (@kyoungmin24)
- **Reviewer**: 팀 Reviewer
- **Status**: Completed (타로 1장 운세 + 오행 보완 케미 및 1:1 QR)
- **Related ADR**: ADR-0001, ADR-0002, ADR-0003
- **Related Claims**: 없음
- **Last Verified Commit**: bd5e97d

---

## 1. 1인 타로 운세 인터페이스 (`src/domain/`)

```typescript
export type Element = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';

export interface SajuResult {
  birthDate: string;
  dayPillar: {
    ganji: string;
    korean: string;
    element: Element;
  };
  interpretation: string;
}

export interface TarotCard {
  number: number;
  name: string;
  englishName: string;
  keyword: string;
  interpretation: string;
  image: string;
}

export interface DrawResult {
  card: TarotCard;
  saju: SajuResult;
  drawnAt: string;
}
```

---

## 2. 오행 케미 및 1:1 QR 인터페이스 (`src/types/`)

```typescript
export type FiveElement = '木' | '火' | '土' | '金' | '水';

export interface ElementCounts {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

export type RelationType = 'complement' | 'generate' | 'support' | 'mirror';

export interface SharedSajuPayload {
  version: 1;
  id: string;
  nickname: string;
  primaryElement: FiveElement;
  elements: ElementCounts;
  timestamp: number;
}

export interface SynergyMatchResult {
  score: number;
  synergyTitle: string;
  synergyTagline: string;
  relationType: RelationType;
  relationLabel: string;
  me: { nickname: string; primaryElement: FiveElement; deficientElement: FiveElement };
  partner: { nickname: string; primaryElement: FiveElement; deficientElement: FiveElement };
  synergyAnalysis: string;
  conversationTopics: string[];
  matchedAt: number;
}
```
