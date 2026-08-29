# D4: 시퀀스 다이어그램 (Sequence Diagram)

- **Owner**: 김형준 (@procloudkim), 김경민 (@kyoungmin24)
- **Reviewer**: 팀 Reviewer
- **Status**: Completed (1인 타로 운세 + 멀티 룸 오행 케미 및 1:1 QR 매칭)
- **Related ADR**: ADR-0001, ADR-0002, ADR-0003
- **Related Claims**: 없음
- **Last Verified Commit**: bd5e97d

---

## 1. 1인 타로 운세 & PNG 저장 시퀀스 (UC-01)

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as Browser UI
    participant S as Saju Module
    participant T as Tarot Module
    participant C as Canvas

    UI-->>U: 필수 동의 & 생년월일 입력
    U->>UI: 동의 + 생년월일 제출
    UI->>S: calculateTodaySaju(BirthInput)
    S-->>UI: SajuResult
    UI-->>U: 오늘의 간이 사주 확인
    U->>UI: 행운의 타로 1장 뽑기
    UI->>T: drawOneCard(TAROT_CARDS, crypto)
    T-->>UI: TarotCard 1장 (Web Crypto 균등 선택)
    UI->>UI: DrawResult 확정 + 생년월일 폐기
    UI-->>U: 카드 이미지 & 해설 & 사주 결과
    U->>UI: PNG로 저장 클릭
    UI->>C: renderResultPng(canvas, DrawResult)
    C-->>U: 1080x1350 PNG 파일 다운로드
```

---

## 2. 멀티 파티 룸 동시 공개 & 오행 케미 및 1:1 QR 시퀀스 (UC-03)

```mermaid
sequenceDiagram
    autonumber
    actor Host as 호스트 브라우저
    actor Guest as 게스트 브라우저
    participant Channel as Room Channel

    Note over Host,Guest: 전원 카드 1장 배분 완료 및 준비 상태

    Host->>Channel: reveal(pin) (일괄 공개 트리거)
    Channel-->>Host: RoomState (REVEALED, 최강 운세 우승자)
    Channel-->>Guest: RoomState (REVEALED, 최강 운세 우승자)

    rect rgb(30, 41, 59)
        Note over Host,Guest: [클라이언트 독립 연산]<br/>1. pickDeficientElement(myElements)<br/>2. generatePartyMission(participants)
        Host->>Host: ElementalChemistryCard 렌더링 (지목 1~3명 & 미션)
        Guest->>Guest: ElementalChemistryCard 렌더링 (지목 1~3명 & 미션)
    end

    opt 1:1 현장 QR 매칭 시
        Host->>Guest: 내 사주 QR 코드 제시 (SharedSajuPayload)
        Guest->>Guest: calculateSynergyMatch(me, partner)
        Guest->>Guest: 1:1 시너지 점수 & 대화 카드 팝업
    end
```
