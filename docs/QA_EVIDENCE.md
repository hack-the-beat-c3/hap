# QA Evidence — 타로섯다 1장 MVP

- Verified Commit: `0fed3aa`
- Verified: 2026-08-29 (Asia/Seoul)
- Browser: Chrome 151.0.7922.174
- Viewports: mobile full E2E `390×844`, desktop result check `1440×900`

## 자동 검증

| 검증 | 결과 |
|---|---|
| `pnpm test` | PASS — 5/5 |
| `pnpm run test:assets` | PASS — PNG 22장, 각 1024×1536 |
| `pnpm run lint` | PASS |
| `pnpm run build` | PASS |
| 브라우저 E2E | PASS — 입력→사주 확인→1장→PNG |

브라우저 E2E에서 콘솔 오류 0, HTTP 400+ 응답 0, 사용자 데이터 네트워크 요청 0, Storage 항목 0을 확인했다. 추첨 후 생년월일은 React 상태와 DOM에서 제거됐고 다운로드 파일 `hap-tarot-00.png`가 생성됐다. JavaScript 엔진의 GC 시점까지 보장한다는 주장은 하지 않는다.

## 화면 증거

- [모바일 입력](qa/01-hero-mobile.png)
- [모바일 사주 확인](qa/02-saju-mobile.png)
- [모바일 결과](qa/03-result-mobile.png)
- [데스크톱 결과](qa/04-result-desktop.png)
- [다운로드 PNG](qa/hap-tarot-00.png)

## 범위 경계

백엔드, 룸 통신, 멀티플레이, 순위·족보·베팅·재추첨은 이 커밋의 구현 범위가 아니다. 파티 대시보드는 별도 PR `1470887`이며 통합 완료로 주장하지 않는다.
