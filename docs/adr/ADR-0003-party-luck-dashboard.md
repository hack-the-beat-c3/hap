# ADR-0003: 파티 운빨 매치 대시보드

- Status: Accepted
- Date: 2026-08-29
- Owners: 김형준 (`@procloudkim`), 통합 리뷰어 미배정
- Related: `docs/prd/tarot-seotda-party-match.md`, `src/PartyMatchDashboard.tsx`

## Context

개인 사주·타로 결과에 파티 재미를 더하려면 참가자별 카드와 오행을 한 화면에서 비교해야 한다. 다른 세션에서 main 흐름과 데이터 수집을 개발 중이므로 이 변경이 해당 코드를 소유하면 충돌한다.

## Decision

- 대시보드는 `ParticipantResult[]`를 입력받는 독립 React 컴포넌트로 제공한다.
- 카드의 1~22위 하우스 순위로 운빨 승부를, 오행 관계로 궁합을 각각 판정한다.
- 같은 카드 순위는 공동 결과로 처리한다.
- 원본 생년월일, 네트워크, 룸 상태, 저장소는 이 컴포넌트가 소유하지 않는다.
- main 통합 시 기존 결과 배열을 props로 전달한다.

## Alternatives

- 별도 백엔드·룸 구현: main과 책임이 겹치고 병합 비용이 커 제외한다.
- 전역 store: props 한 단계로 충분해 제외한다.
- 카드 순위와 오행을 합산한 점수: 규칙이 불투명해 분리한다.

## Consequences

- main 구현과 독립적으로 개발·테스트하고 작은 단위로 병합할 수 있다.
- 실시간 갱신과 영속성은 데이터를 제공하는 상위 흐름의 책임이다.

## Verification / Rollback

- 순위 정렬, 동점, 상생·상극·동행 판정을 실행 가능한 단일 테스트로 검증한다.
- React·TypeScript 빌드와 lint를 통과한다.
- 통합이 보류되면 컴포넌트 import를 하지 않는 것만으로 기존 흐름에 영향이 없다.
