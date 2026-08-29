# Wiki Claims — HAP (합)

주장 상태: `VERIFIED`, `ASSUMPTION`, `EXPERIMENT`, `CONFLICT`, `REJECTED`

| Claim ID | 주장 내용 | 상태 | 근거 / 출처 | 반영 위치 |
|---|---|---|---|---|
| `CLM-001` | 생년월일 원본 데이터는 서버에 저장하지 않고 클라이언트에서만 계산한다. | `VERIFIED` | 개인정보 보호법, AGENTS.md §2.2 | `D1`, `D5`, `src/lib/chemistry/` |
| `CLM-002` | 오행 케미 결과는 타로 카드 셔플 및 승부 순위에 일체 영향을 주지 않는다. | `VERIFIED` | 게임 공정성 하드룰, AGENTS.md §2.1 | `ADR-0002`, `D1` |
| `CLM-003` | 부족 오행 산출은 5행 분포 중 최솟값을 결정론적으로 추출한다. | `VERIFIED` | PRD §4.2, 단위 테스트 100% | `pickDeficientElement.ts` |
| `CLM-004` | 1:1 QR 교환 시 PII가 제외된 닉네임과 오행 분포만 전송된다. | `VERIFIED` | ADR-0003, 단위 테스트 | `encodeDecodePayload.ts` |
