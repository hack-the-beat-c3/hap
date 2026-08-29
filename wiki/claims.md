# Claims

| Claim ID | 상태 | 주장 내용 | 근거/출처 | 반영 위치 |
|---|---|---|---|---|
| C001 | VERIFIED | `korean-lunar-calendar` v0.4.0은 양력↔음력 변환과 간지를 제공하며 MIT 라이선스다. | [npm 원문 기록](../research/raw/korean-lunar-calendar-npm.md) | `src/saju/engine.ts` |
| C002 | VERIFIED | 라이브러리 지원 범위는 음력 1000-01-01~2050-11-18, 양력 1000-02-13~2050-12-31이며 KARI/KASI 표준을 따른다. | [GitHub 원문 기록](../research/raw/korean-lunar-calendar-github.md) | `src/saju/engine.ts` 범위 검증 상수 |
| C003 | VERIFIED | 양력 2026-08-01(토)은 음력 2026-06-19이고 간지는 병오년 을미월 정미일이다. | [KASI 원문 기록](../research/raw/kasi-monthly-lunisolar.md) | `src/saju/engine.test.ts` KASI fixture; `docs/adr/ADR-0001-saju-engine.md` Verification 표 1행 |
| C004 | VERIFIED | 10천간은 각각 목·화·토·금·수와 음양에 배속된다. | [천간 원문 기록](../research/raw/wikipedia-heavenly-stems.md) | `src/saju/elements.ts`의 `STEM_ELEMENTS` |
| C005 | VERIFIED | 12지지는 각각 목·화·토·금·수에 배속된다. | [지지 원문 기록](../research/raw/wikipedia-earthly-branches.md) | `src/saju/elements.ts`의 `BRANCH_ELEMENTS` |
| C006 | VERIFIED | 사주 해석은 일주 천간인 일간을 중심으로 한다. | [사주 원문 기록](../research/raw/aks-saju.md) | `src/saju/engine.ts`의 `dominantElement` 동률 해소 규칙 |
| C007 | ASSUMPTION | 2023년에는 윤2월이 있었다. | [나무위키 기록](../research/raw/namuwiki-leap-month.md), [superkts 기록](../research/raw/superkts-calendar.md); KASI 직접 확인 전 | `docs/adr/ADR-0001-saju-engine.md` Verification 표의 윤2월 행 |
| C008 | ASSUMPTION | 음력 2025-01-01은 양력 2025-01-29이다. | [superkts 기록](../research/raw/superkts-calendar.md), [dallyeok 기록](../research/raw/dallyeok-calendar.md); KASI 직접 확인 전 | `docs/adr/ADR-0001-saju-engine.md` Verification 표의 2025년 음력 행 |
