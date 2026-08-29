# D3. 타로섯다 인터페이스 정의서

- Owner: 김형준 (`@procloudkim`)
- Reviewer: 미배정
- Status: Implemented — Review pending
- Related ADR: [`ADR-0001-tarot-mvp-architecture.md`](../adr/ADR-0001-tarot-mvp-architecture.md)
- Related Claims: 없음 — 제품 내부 설계 계약
- Last Verified Commit: `0fed3aa`

> `0fed3aa`에서 아래 단일 사용자 정적 웹 인터페이스와 로컬 처리 경계를 구현·검증했다.

## 1. 제품 경계

- 한 사용자가 한 브라우저 세션에서 오늘의 간이 사주를 확인하고 메이저 아르카나 22장 중 정확히 1장을 뽑는다.
- 멀티플레이, 룸, 호스트/게스트, 순위, 우승자, 족보, 베팅, 재뽑기는 없다.
- 출생일은 입력 정보·사주 확인 단계까지만 브라우저 메모리에 유지하고 카드 확정 시 폐기한다.
- API, 실시간 연결, 인증, 데이터베이스, 브라우저 영속 저장소, 분석 도구를 사용하지 않는다.
- 결과는 엔터테인먼트용이며 중요한 의사결정의 근거가 아님을 입력 전과 결과 화면에 표시한다.

## 2. 사용자 흐름과 화면 출력

```text
HERO_INPUT -> SAJU_CONFIRM -> DRAWING -> RESULT
RESULT --[PNG로 저장 액션]--> Browser Download
```

| 단계 | 사용자 입력 | 화면 출력 | 다음 동작 |
|---|---|---|---|
| `HERO_INPUT` | 개인정보 처리 안내 동의, 엔터테인먼트 고지 확인, 생년월일 | 파티 콘셉트 히어로, 필수 동의, 네이티브 날짜 입력 | 유효성 검증 후 로컬 사주 계산 |
| `SAJU_CONFIRM` | `다시 입력` 또는 `타로카드로 오늘의 행운 1장 뽑아보기` | 입력한 생년월일, 오늘의 대표 오행, 제목, 한 줄 해설, 기준일, 간이 해석 고지 | CTA 클릭 시 Web Crypto로 한 장 선택 |
| `DRAWING` | 없음 | 카드 뒷면과 짧은 공개 전환 | 선택된 한 장을 즉시 결과로 확정 |
| `RESULT` | 없음 | 카드 이미지, 한·영문 이름, 카드 해설, 사주 연결 문구, 고지 | `PNG로 저장` |
| `RESULT` 내 PNG 저장 액션 | 저장 버튼 | Canvas로 만든 1080×1350 PNG | 네이티브 파일 다운로드 후 `RESULT` 유지 |

생년월일 입력은 의존성 없는 `<input type="date">`를 사용하고 모든 컨트롤에 label, 키보드 포커스, 오류 연결을 제공한다.

## 3. 로컬 TypeScript 계약

### 3.1 상태와 입력

```ts
type AppStep =
  | 'HERO_INPUT'
  | 'SAJU_CONFIRM'
  | 'DRAWING'
  | 'RESULT'

type Element = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER'

type ConsentState = {
  privacyAccepted: boolean
  entertainmentNoticeAccepted: boolean
}

// EPHEMERAL: 확인 단계까지만 메모리에 있고 카드 확정 직후 빈 값으로 교체한다.
type BirthInput = {
  birthDate: string // YYYY-MM-DD
}

type SajuResult = {
  calculatedFor: string // 오늘의 로컬 날짜, YYYY-MM-DD
  primaryElement: Element
  title: string
  summary: string
  advice: string
  disclaimer: string
}

type AppErrorCode =
  | 'CONSENT_REQUIRED'
  | 'INVALID_BIRTH_DATE'
  | 'SAJU_CALCULATION_FAILED'
  | 'CARD_CATALOG_INVALID'
  | 'SECURE_RANDOM_UNAVAILABLE'
  | 'IMAGE_LOAD_FAILED'
  | 'CANVAS_EXPORT_FAILED'

type AppError = {
  code: AppErrorCode
  message: string
  field?: 'privacyConsent' | 'entertainmentNotice' | 'birthDate'
  retryable: boolean
}

type AppState = {
  step: AppStep
  consent: ConsentState
  birthInput: BirthInput
  saju: SajuResult | null
  draw: DrawResult | null
  error: AppError | null
}
```

`birthInput.birthDate`는 확인 화면에서 수정할 수 있도록 유지하되 카드가 성공적으로 확정되면 즉시 `''`로 덮어쓴다. `SajuResult`에는 생년월일이나 출생시각을 복제하지 않는다.

### 3.2 22장 정적 카드 카탈로그

```ts
type CardId =
  | 'THE_FOOL'
  | 'THE_MAGICIAN'
  | 'THE_HIGH_PRIESTESS'
  | 'THE_EMPRESS'
  | 'THE_EMPEROR'
  | 'THE_HIEROPHANT'
  | 'THE_LOVERS'
  | 'THE_CHARIOT'
  | 'STRENGTH'
  | 'THE_HERMIT'
  | 'WHEEL_OF_FORTUNE'
  | 'JUSTICE'
  | 'THE_HANGED_MAN'
  | 'DEATH'
  | 'TEMPERANCE'
  | 'THE_DEVIL'
  | 'THE_TOWER'
  | 'THE_STAR'
  | 'THE_MOON'
  | 'THE_SUN'
  | 'JUDGEMENT'
  | 'THE_WORLD'

type TarotCard = {
  id: CardId
  arcanaNumber: number // 0..21, unique
  nameKo: string
  nameEn: string
  imagePath: string // 동일 출처 정적 WebP
  summary: string
  description: string
  partyMessage: string
}

declare const TAROT_CARDS: readonly TarotCard[] // exactly 22
```

카탈로그 빌드 검증은 다음 조건을 모두 확인한다.

- 배열 길이 `22`
- `id` 22개가 모두 고유
- `arcanaNumber`가 중복 없이 `0..21`
- 모든 이미지 경로와 필수 문구가 비어 있지 않음
- 순위, 당첨금, 희소도, 확률 가중치 필드가 없음

### 3.3 사주·추첨·결과 함수

```ts
type DrawResult = {
  card: TarotCard
  saju: SajuResult
  drawnAt: string
}

function calculateTodaySaju(
  birthInput: Readonly<BirthInput>,
  today: Date,
): SajuResult

function drawOneCard(
  cards: readonly TarotCard[],
  crypto: Pick<Crypto, 'getRandomValues'>,
): TarotCard

function createDrawResult(
  card: TarotCard,
  saju: SajuResult,
  now: Date,
): DrawResult
```

`drawOneCard`는 `crypto.getRandomValues()`로 32비트 정수를 만들고 rejection sampling으로 `0..21`을 균등 선택한다. 단순 `% 22`는 modulo bias가 있으므로 사용하지 않는다.

```ts
function randomIndex22(crypto: Pick<Crypto, 'getRandomValues'>): number {
  const range = 2 ** 32
  const limit = Math.floor(range / 22) * 22
  const value = new Uint32Array(1)

  do {
    crypto.getRandomValues(value)
  } while (value[0] >= limit)

  return value[0] % 22
}
```

`AppState.draw !== null`이면 추첨 버튼을 숨기거나 비활성화한다. 한 페이지 세션에서 두 번째 `drawOneCard` 호출은 허용하지 않는다. 새로고침하면 메모리가 초기화되는 제한은 화면 카피에 표시하며, 이를 막기 위한 fingerprint·쿠키·서버 저장은 만들지 않는다.

## 4. 정확한 확률

22장에 가중치가 없고 rejection sampling이 정상 실행된다는 전제다.

| 사건 | 정확한 확률 |
|---|---|
| 특정 카드 한 장을 뽑을 확률 | `1/22` = 약 `4.54545%` |
| 미리 정한 `k`장의 카드 집합 중 하나를 뽑을 확률 | `k/22` |
| 한 세션에서 카드 두 장을 받거나 중복 카드를 받을 확률 | `0` — 두 번째 추첨 기능 없음 |
| 순위·우승 확률 | 해당 없음 — 순위와 경쟁 기능 없음 |

통계 표본은 참고 자료일 뿐이다. 정확한 균등성은 rejection sampling 코드 검토와 경계값 테스트로 검증한다.

## 5. Canvas PNG 다운로드 계약

```ts
type DownloadArtifact = {
  filename: string
  mimeType: 'image/png'
  width: 1080
  height: 1350
  blob: Blob
}

async function renderResultPng(
  canvas: HTMLCanvasElement,
  result: Readonly<DrawResult>,
): Promise<DownloadArtifact>

function downloadArtifact(artifact: DownloadArtifact): void
```

PNG에는 다음 내용만 그린다.

- 서비스명과 파티 비주얼
- 카드 이미지와 한·영문 이름
- 카드 한 줄 해설
- 오늘의 대표 오행과 연결 문구
- 엔터테인먼트용 고지

생년월일과 동의 상태는 PNG에 넣지 않는다. 카드 이미지와 글꼴은 Canvas 오염을 막기 위해 동일 출처의 빌드 자산을 사용한다. `canvas.toBlob('image/png')` 결과로 Object URL을 만들고 `<a download>` 클릭 다음 작업 큐에서 `URL.revokeObjectURL()`로 해제한다. 렌더링 또는 Blob 생성이 실패하면 `CANVAS_EXPORT_FAILED`를 표시하고 현재 결과 화면은 유지한다.

## 6. 오류와 UI 처리

| 코드 | 발생 조건 | UI 처리 |
|---|---|---|
| `CONSENT_REQUIRED` | 필수 동의 미선택 | 첫 미동의 체크박스로 포커스 이동 |
| `INVALID_BIRTH_DATE` | 빈 값, 파싱 불가, 미래 날짜 | 날짜 입력 하단 오류 표시 |
| `SAJU_CALCULATION_FAILED` | 지원하지 않는 계산 입력 | 입력 수정 제공; 임의 결과 생성 금지 |
| `CARD_CATALOG_INVALID` | 22장/고유성/필수 자산 검증 실패 | 추첨 차단과 새로고침 안내 |
| `SECURE_RANDOM_UNAVAILABLE` | Web Crypto 미지원 | 추첨 차단; `Math.random()` 대체 금지 |
| `IMAGE_LOAD_FAILED` | 결과 이미지 로드 실패 | 텍스트 결과 유지, PNG 저장 비활성화 |
| `CANVAS_EXPORT_FAILED` | Canvas/Blob 생성 실패 | 결과 유지, 다시 저장 가능 |

오류는 사용자 입력값, 생년월일, 스택 트레이스를 콘솔이나 외부 서비스로 전송하지 않는다.

## 7. 네트워크·저장 계약

```text
REST API              없음
Realtime/WebSocket    없음
Backend               없음
Database              없음
localStorage          사용 안 함
sessionStorage        사용 안 함
IndexedDB             사용 안 함
Cookies               사용 안 함
Analytics/Error SaaS  사용 안 함
```

배포 후 네트워크 요청은 문서·JavaScript·CSS·동일 출처 이미지·글꼴 같은 정적 자산에 한정한다. 생년월일, 사주 결과, 카드 결과는 요청 payload나 URL query/hash에 포함하지 않는다.

## 8. 구현 수용 기준

- 동의 전에는 날짜 입력 처리와 사주 계산을 시작하지 않는다.
- 유효한 생년월일로 오늘의 간이 사주 확인 화면까지 도달한다.
- 확인 화면에서 입력한 생년월일을 확인·수정할 수 있고 카드 확정 뒤에는 DOM과 상태에서 사라진다.
- 원본 생년월일은 카드 확정 후 상태·DOM에 남지 않으며 URL·브라우저 저장소에는 어느 단계에서도 기록되지 않는다.
- 카탈로그는 정확히 22장이고 각 카드 ID·번호·이미지·문구가 유효하다.
- 한 세션에 정확히 한 장만 뽑히며 모든 카드의 이론 확률은 `1/22`다.
- 결과에 순위, 우승자, 베팅, 재뽑기 UI가 없다.
- 결과 카드 이미지·해설·사주 문구가 모바일과 데스크톱에 표시된다.
- 1080×1350 PNG가 네이티브 다운로드되고 생년월일이 포함되지 않는다.
- DevTools Network에 API 요청 0건, Storage에 사용자 데이터 0건이다.
- 구현 후 실제 화면과 테스트 증거를 `docs/QA_EVIDENCE.md`에 연결하고 `Last Verified Commit`을 갱신한다.
