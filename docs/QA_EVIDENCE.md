# QA Evidence

이 문서는 AGENTS.md §4 "공통 보조 산출물"과 제출 게이트 요구사항에 따라 검증 결과를 기록한다. 각 항목은 URL(로컬 dev 서버, 아직 배포 URL 없음), 시각, viewport, commit SHA, 캡처를 포함한다.

## 팀원 3 — 사주·오행 엔진 (ADR-0001)

- 검증일: 2026-08-29
- 검증자: Claude Code(PM) — Playwright(로컬 headless brave-browser)로 직접 구동
- 대상 URL: http://localhost:5173/ (로컬 `pnpm run dev`, 아직 배포 URL 없음)
- Commit SHA: `596c832` (branch `docs/adr-0001-saju-engine`, PR #1)
- 관련 ADR: [ADR-0001](adr/ADR-0001-saju-engine.md) (Status: Accepted)
- 관련 Claims: [C001–C006](../wiki/claims.md)

### 자동 테스트

| 명령 | 결과 |
|---|---|
| `pnpm run test` (vitest) | 11/11 통과 (`src/saju/engine.test.ts` 9건, `src/kstToday.test.ts` 2건) |
| `pnpm run build` (`tsc -b && vite build`) | 0 TypeScript 오류, 빌드 성공 |
| `pnpm run lint` (oxlint) | 통과 |

### 브라우저 시나리오 (viewport별)

| # | 시나리오 | Viewport | 시각(KST) | 콘솔 오류 | 캡처 |
|---|---|---|---|---|---|
| 1 | 폼 초기 로드 | 390×844 | 2026-08-29 17:10 | 0건 | `qa-evidence/2026-08-29-01-form-mobile-390x844.png` |
| 2 | 양력 입력(1995-06-15, 출생시각 모름, 닉네임 "테스트") → 결과 화면 | 390×844 | 2026-08-29 17:10 | 0건 | `qa-evidence/2026-08-29-02-result-mobile-390x844.png` |
| 3 | 음력 라디오 전환 → 연/월/일 입력 + 윤달 체크박스 노출 확인 | 390×844 | 2026-08-29 17:10 | 0건 | `qa-evidence/2026-08-29-03-lunar-toggle-mobile-390x844.png` |
| 4 | 동일 폼 데스크톱 레이아웃 확인 | 1440×900 | 2026-08-29 17:10 | 0건 | `qa-evidence/2026-08-29-04-form-desktop-1440x900.png` |

결과 화면(#2)에서 확인된 내용: `dominantElement`(화), `elementBalance` 5개 오행 막대(목1·화2·토1·금0·수2), `todaySummary` 엔터테인먼트 문구, 고정 안내 문구 2줄("엔터테인먼트용 결과이며 실제 중요한 결정의 근거로 사용하지 마세요.", "시간주를 제외한 간이 해석입니다."), "다시 입력" 버튼 — 모두 정상 표시.

### 개인정보 비전송 검증

- `grep -rnE "fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|console\." src/App.tsx src/saju/SajuForm.tsx src/kstToday.ts src/kstToday.test.ts` → 결과 없음(clean)
- `grep -rn "new Date(" src/saju src/kstToday.ts` → `src/kstToday.ts`의 KST 변환 지점 1건만 존재 (경계 주입 지점, 의도된 유일한 예외)
- Playwright 브라우저 콘솔 리스너(`console`/`pageerror` 이벤트)로 폼 제출·결과 전환·음력 전환 전 구간 감시 — 오류 0건, 네트워크 요청 관찰 안 됨(서버 자체가 없음)
- `SajuResult` 타입(`src/saju/engine.ts`)에는 원본 생년월일·시각 필드가 없음 — `timeProvided: boolean` 플래그만 존재

### 결정성

- `src/saju/engine.test.ts`의 "is deterministic for the same input and injected today" 테스트로 동일 입력·동일 `today` 주입 시 결과가 완전히 동일함을 확인.

### 알려진 한계 / 향후 확인 필요

- ADR-0001 Verification 표의 `ASSUMPTION` 항목(2023년 윤2월, 2025년 설날=1/29)은 KASI 직접 재확인 전이며, 이번 구현의 자동 테스트에는 사용하지 않음(엔진은 실제 라이브러리의 `setLunarDate`/`setSolarDate` 반환값으로만 판단).
- 배포된 URL이 아직 없어 로컬 dev 서버 기준으로 검증함. 배포 후 동일 시나리오 재검증 필요.
