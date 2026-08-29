# PROCESS — 김종한 (`@jong-k`)

- Status: **PR #5 Ralph 통합 인계 준비 완료**
- R&R: **통합 DRI — 최신 main에 김형준 타로 제출본 적용**
- Source PR: [#5](https://github.com/hack-the-beat-c3/hap/pull/5) (`5fadcf4`)
- Validated Seed: [`ralph-seed.yaml`](ralph-seed.yaml) (`seed_4ba8a580736c`)

## Ralph 실행 계약

- [ ] 최신 `main`에서 새 통합 브랜치를 만들고 force push·main 직접 작업을 하지 않는다.
- [ ] Codex에서 `$ralph`를 호출해 이 디렉터리의 `ralph-seed.yaml` 원문을 `seed_content`로 전달한다.
- [ ] 새 `lineage_id`는 `ralph-pr5-jong-k-<uuid>` 형식으로 만들고 QA를 생략하지 않는다.
- [ ] main의 `/`, `?pin=`, 룸·공유 덱을 보존하고 PR #5의 `App` 전체를 덮어쓰지 않는다.
- [ ] 카드 해설·PNG는 참가자 흐름에 이식하고 호스트 공개 전 카드 정보를 DOM/payload에 싣지 않는다.

## 완료 조건

- [ ] Seed의 모든 acceptance criterion이 통과했다.
- [ ] ADR, D1~D5, `docs/QA_EVIDENCE.md`가 통합 코드와 일치한다.
- [ ] 테스트·자산 검사·lint·build·모바일 다중 세션 검증 증거를 PR에 남겼다.
- [ ] 작업 브랜치가 clean하고 upstream push가 완료됐다.
