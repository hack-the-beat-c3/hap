# D4. 시퀀스 다이어그램 — 타로섯다

- Owner: 김형준 (`@procloudkim`)
- Reviewer: 미배정
- Status: Proposed
- Related ADR: [`ADR-0001-tarot-mvp-architecture.md`](../adr/ADR-0001-tarot-mvp-architecture.md)
- Related Claims: 없음 — 제품 내부 설계 계약
- Last Verified Commit: `1f9bca6` (Vite 스타터, 아래 시퀀스 미구현)

## 1. 경계와 상태

- 모든 참여자는 한 브라우저 안의 UI 또는 로컬 모듈이다. API, 백엔드, 데이터베이스, 실시간 연결은 없다.
- 상태는 `HERO_INPUT → SAJU_CONFIRM → DRAWING → RESULT`로만 전이한다.
- 성공한 추첨 이후 `SAJU_CONFIRM`이나 두 번째 추첨으로 돌아가는 전이는 없다.
- `BirthInput`은 확인 단계까지만 메모리에 유지하고 카드가 확정되면 지운다.

## 2. 정상 흐름: 동의·생년월일 → 사주 확인 → 한 장 → PNG

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as Browser UI
    participant S as Saju Module
    participant T as Tarot Module
    participant C as Canvas
    participant D as Download Helper

    UI-->>U: 히어로·필수 동의·생년월일 입력
    U->>UI: 동의 + 생년월일 제출
    UI->>UI: 동의·날짜 검증
    UI->>S: calculateTodaySaju(BirthInput, today)
    S-->>UI: SajuResult
    UI-->>U: 입력 정보 + 오늘의 간이 사주 확인
    U->>UI: 타로카드로 오늘의 행운 1장 뽑아보기
    UI->>UI: CTA 잠금, step = DRAWING
    UI->>T: drawOneCard(TAROT_CARDS, crypto)
    T->>T: 카탈로그 검증 + 균등 index 선택
    T-->>UI: TarotCard 한 장
    UI->>UI: DrawResult 확정 + BirthInput 폐기
    UI-->>U: 카드 이미지·해설 + 사주 연결 결과
    U->>UI: PNG로 저장
    UI->>C: renderResultPng(canvas, DrawResult)
    C-->>UI: DownloadArtifact
    UI->>D: downloadArtifact(DownloadArtifact)
    D->>D: Object URL 생성 + 임시 링크 클릭
    D-->>UI: 다운로드 시작
    D->>D: 다음 작업 큐에서 Object URL 해제
```

정상 흐름에서 네트워크 요청은 빌드의 정적 자산뿐이다. 생년월일, 사주 결과, 카드 결과를 요청·URL·로그·브라우저 저장소에 기록하지 않는다.

## 3. 예외: 미동의 또는 잘못된 날짜

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as Browser UI
    participant S as Saju Module

    U->>UI: 제출
    UI->>UI: 동의·날짜 검증
    alt 필수 동의 누락
        UI-->>U: 첫 미동의 항목 오류 + 포커스
    else 빈 값·파싱 불가·미래 날짜
        UI-->>U: 날짜 오류 + 입력 포커스
    else 입력 유효
        UI->>S: calculateTodaySaju(BirthInput, today)
        alt 계산 실패
            S-->>UI: SAJU_CALCULATION_FAILED
            UI-->>U: 임의 결과 없이 입력 수정 안내
        else 계산 성공
            S-->>UI: SajuResult
            UI-->>U: 입력 정보 + 간이 사주 확인
        end
    end
```

오류 경로에서는 카드 선택을 호출하지 않는다. 계산 성공 전까지 입력값은 사용자가 고칠 수 있도록 현재 폼 메모리에만 남는다.

## 4. 분기: 확인 화면에서 다시 입력

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as Browser UI
    participant S as Saju Module

    UI-->>U: 생년월일 + SajuResult 확인
    U->>UI: 다시 입력
    UI-->>U: 기존 생년월일이 있는 입력 화면
    U->>UI: 날짜 수정 후 제출
    UI->>S: calculateTodaySaju(수정한 BirthInput, today)
    S-->>UI: 새 SajuResult
    UI-->>U: 수정 정보 + 새 간이 사주 확인
```

이 분기는 카드가 확정되기 전에만 가능하다.

## 5. 예외: 추첨 실패와 중복 클릭

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as Browser UI
    participant T as Tarot Module

    U->>UI: 타로카드로 오늘의 행운 1장 뽑아보기
    UI->>UI: 즉시 CTA 잠금
    UI->>T: drawOneCard(TAROT_CARDS, crypto)
    par 빠른 추가 클릭
        U->>UI: 같은 CTA 다시 클릭
        UI-->>U: 잠긴 상태 유지, 추가 호출 없음
    and 첫 호출 처리
        alt 카탈로그 또는 Web Crypto 실패
            T-->>UI: CARD_CATALOG_INVALID 또는 SECURE_RANDOM_UNAVAILABLE
            UI-->>U: 결과 없음 + 같은 CTA 재시도 허용
        else 성공
            T-->>UI: TarotCard 한 장
            UI->>UI: DrawResult 확정 + BirthInput 폐기
            UI-->>U: 결과 표시, 추첨 CTA 제거
        end
    end
```

실패 전 재시도는 허용하지만 성공한 결과 뒤 재추첨은 없다. `Math.random()` 대체도 없다.

## 6. 예외: 이미지 또는 PNG 생성 실패

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant UI as Result UI
    participant I as Local Card Image
    participant C as Canvas
    participant D as Download Helper

    UI->>I: 동일 출처 카드 이미지 로드
    alt 이미지 로드 실패
        I-->>UI: IMAGE_LOAD_FAILED
        UI-->>U: 카드명·해설·사주 텍스트 유지 + 저장 비활성화
    else 이미지 로드 성공
        I-->>UI: ImageBitmap 또는 HTMLImageElement
        U->>UI: PNG로 저장
        UI->>C: renderResultPng(canvas, DrawResult)
        alt Canvas 또는 toBlob 실패
            C-->>UI: CANVAS_EXPORT_FAILED
            UI-->>U: 결과 유지 + 저장 재시도
        else Blob 생성 성공
            C-->>UI: DownloadArtifact
            UI->>D: downloadArtifact(DownloadArtifact)
            D->>D: Object URL 생성 + 임시 링크 클릭
            D-->>UI: 다운로드 시작
            D->>D: 다음 작업 큐에서 Object URL 해제
        end
    end
```

다운로드 실패는 이미 확정된 카드 결과를 바꾸지 않는다.

## 7. 구현 대조 체크리스트

- [ ] 실제 컴포넌트·함수·상태 이름이 D2·D3와 일치한다.
- [ ] 정확한 CTA 문구와 `HERO_INPUT → SAJU_CONFIRM → DRAWING → RESULT` 전이가 일치한다.
- [ ] 한 성공 흐름에서 `drawOneCard` 호출과 `DrawResult`가 각각 하나다.
- [ ] 계산 전·확인 중·추첨 후의 생년월일 수명이 문서대로인지 확인한다.
- [ ] 이미지·Canvas·Blob 실패에서도 HTML 결과와 확정 카드가 유지된다.
- [ ] Network·URL·콘솔·Storage에 사용자 데이터가 없음을 확인한다.
- [ ] 구현 증거를 `docs/QA_EVIDENCE.md`에 URL, 시각, viewport, commit SHA와 함께 연결한다.
