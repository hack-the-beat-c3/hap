# Wiki Log

## 2026-08-29

- 사주·오행 관련 10개 소스 항목을 catalog했다: 직접 사용한 6개, ADR 검증표의 가설 2개, 채택하지 않은 대안 2개. 중복 URL을 합쳐 VERIFIED/ASSUMPTION 근거 9개를 `research/raw/`에 ingest했다.
- ADR-0001이 작성·승인되었고, Phase 2/3 구현이 C001~C006을 참조해 출시되었다. C007~C008은 ADR 검증표에만 남아 있으며 코드의 검증된 사실로 취급하지 않는다.
- `manseryeok-js`, `kor-lunar-js`는 재검증 없이 `docs/adr/ADR-0001-saju-engine.md` Alternatives 절로만 연결했다.
- ADR-0004(팀원 2 개인정보 동의·입력 플로우)가 작성·승인되었고 `src/consent/`로 구현이 출시되었다. 새 외부 Claim은 추가되지 않음 — ADR-0001의 계산 계약을 그대로 재사용했기 때문. `docs/adr/ADR-0001-tarot-mvp-architecture.md`(별도 미병합 브랜치)와 ADR 번호 0001이 중복됨을 확인했으나 다른 팀원의 브랜치라 이 세션에서 임의로 재번호하지 않았고, 팀 조율이 필요하다고 기록해 둔다.
