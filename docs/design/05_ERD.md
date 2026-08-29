# D5: ERD (Entity Relationship Diagram) & 데이터 모델

- **Owner**: 김형준 (@procloudkim), 김경민 (@kyoungmin24)
- **Reviewer**: 팀 Reviewer
- **Status**: Completed (1인 타로 운세 + 멀티 룸 오행 케미 및 1:1 QR)
- **Related ADR**: ADR-0001, ADR-0002, ADR-0003
- **Related Claims**: 없음
- **Last Verified Commit**: bd5e97d

---

## 1. 논리 데이터 모델 (In-Memory / State Model)

```mermaid
erDiagram
    Room ||--o{ Participant : contains
    Participant ||--|| DerivedProfile : derives
    Participant ||--o| TarotCard : draws
    Room ||--o| GameResult : produces
    Participant ||--o{ MatchedConnection : matches

    Room {
        string pin PK "룸 6자리 PIN (수명: 파티 세션)"
        string status "WAITING | REVEALED"
        datetime createdAt
    }

    Participant {
        string id PK "참가자 세션 ID"
        string nickname "파티 닉네임"
        boolean isHost "호스트 여부"
        string rawBirthDate "NOT STORED (클라이언트 로컬 계산 후 즉시 폐기)"
    }

    DerivedProfile {
        string participantId FK
        string primaryElement "주 오행"
        json elementCounts "5행 분포 {木, 火, 土, 金, 水}"
        string deficientElement "부족 오행"
    }

    TarotCard {
        int number PK "0~21 (메이저 아르카나 22장)"
        string name "카드명"
        string keyword "키워드"
        int houseRank "하우스 룰 승부 서열"
    }

    MatchedConnection {
        string partnerNickname "매칭된 파티원 닉네임"
        string partnerPrimaryElement "상대방 주 오행"
        int score "75~99점 시너지 스코어"
        datetime matchedAt
    }
```

---

## 2. PII (개인정보) 저장 정책

1. **원본 생년월일 / 출생시각**:
   - 브라우저 클라이언트 메모리에서 사주 오행 계산 즉시 폐기되며, 서버/로그/스토리지에 일체 저장되지 않습니다 (`NOT STORED`).
2. **세션 수명**:
   - 모든 인메모리 룸 상태 및 파생 데이터는 파티 종료 시 즉시 삭제됩니다.
