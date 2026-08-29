# D5: ERD (Entity Relationship Diagram) & 데이터 모델

- **Owner**: 미정
- **Reviewer**: 미정
- **Status**: Draft
- **Related ADR**: ADR-0002
- **Related Claims**: 없음
- **Last Verified Commit**: 07a88de

---

## 1. 논리 데이터 모델 (In-Memory / State Model)

```mermaid
erDiagram
    Room ||--o{ Participant : contains
    Participant ||--|| DerivedProfile : derives
    Participant ||--o| Card : draws
    Room ||--o| GameResult : produces

    Room {
        string id PK "룸 6자리 PIN (수명: 파티 종료 시 삭제)"
        string status "WAITING | PLAYING | REVEALED"
        datetime createdAt "생성 일시 (TTL: 24시간)"
    }

    Participant {
        string id PK "참가자 세션 ID"
        string nickname "파티용 닉네임"
        boolean isHost "호스트 여부"
        int joinedOrder "입장 순서 (1~15)"
        string rawBirthDate "NOT STORED (클라이언트 로컬 계산 후 폐기)"
        string rawBirthTime "NOT STORED (클라이언트 로컬 계산 후 폐기)"
    }

    DerivedProfile {
        string participantId FK "참가자 ID"
        string primaryElement "주 오행 (木|火|土|金|水)"
        json elementCounts "오행 수치 {木, 火, 土, 金, 水}"
        string deficientElement "부족 오행 (클라이언트 계산)"
    }

    Card {
        int cardNumber PK "0~21 (메이저 아르카나 22장)"
        string cardName "타로 카드명"
        int houseRank "하우스 룰 승부 서열"
    }

    GameResult {
        string winnerParticipantId "최강 운세 우승자 ID"
        datetime revealedAt "공개 일시"
    }
```

---

## 2. PII(개인정보) 저장 정책

1. **원본 생년월일 / 출생시각**:
   - 브라우저 클라이언트 메모리에서 사주 오행 계산 즉시 폐기되며, 서버/로그/DB/스토리지에 일체 저장되지 않습니다 (`NOT STORED`).
2. **파티 룸 데이터 수명 (TTL)**:
   - 파티 종료 또는 세션 만료 시 모든 인메모리 룸 및 파생 프로필 데이터는 즉시 삭제됩니다.
