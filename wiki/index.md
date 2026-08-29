# Wiki Index

- [Claims](claims.md): 사주·오행 엔진에 반영된 외부 사실과 미검증 가설의 근거·상태·반영 위치.
- [Log](log.md): 원문 ingest, 문서 연결, 검증 상태 변경 기록.
- [ADR-0001](../docs/adr/ADR-0001-saju-engine.md): 사주 엔진 선택, 개인정보 경계, 검증 및 롤백 결정.
- [ADR-0004](../docs/adr/ADR-0004-consent-birthdate-flow.md): 팀원 2 개인정보 동의·생년월일 입력·확인 플로우, ADR-0001 계약 재사용, 서버 payload allowlist 결정.

## 사주·오행 엔진 (팀원 3)

출시된 엔진은 `korean-lunar-calendar` v0.4.0을 브라우저에서 사용하며, 라이브러리 저장소의 지원 범위와 KASI 공식 기준 사례를 검증 경계로 삼는다. 천간·지지의 오행 배속과 일간 우선 동률 해소 규칙은 각각 백과 자료에 연결되어 있다.

2023년 윤2월과 2025년 설날 변환값은 ADR-0001의 검증표에 있는 `ASSUMPTION`이다. KASI 직접 확인 전에는 `VERIFIED`로 승격하거나 새로운 코드 사실로 사용하지 않는다. 검토 후 채택하지 않은 `manseryeok-js`와 `kor-lunar-js`는 ADR-0001의 Alternatives 절만 참조한다.

## 개인정보 동의·입력 플로우 (팀원 2)

`src/consent/ConsentFlow.tsx`는 동의(필수/선택, 기본 해제)→입력→확인→제출의 4단계 상태 머신이다. 새 외부 사실(Claim)은 추가하지 않으며, ADR-0001의 `calculateSaju`/`getTodayInKST`를 mock 없이 그대로 호출한다. 서버로 나가는 값은 `src/consent/allowlist.ts`의 `buildParticipantPayload`가 구성하는 `{nickname, dominantElement, elementBalance, calculationVersion}` 뿐이며, 원본 생년월일·출생시각·동의 상태는 이 타입에 구조적으로 들어갈 수 없다. `src/App.tsx`는 다른 팀원 브랜치와의 충돌을 피하기 위해 의도적으로 건드리지 않았다 — 실제 화면 합성은 팀 결정 대기 중이다(ADR-0004 Decision 11).
