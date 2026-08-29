import type { FiveElement, SajuResult } from '../saju/engine'

export interface ParticipantDerivedPayload {
  nickname: string
  dominantElement: FiveElement
  elementBalance: Record<FiveElement, number>
  calculationVersion: SajuResult['calculationVersion']
}

export function buildParticipantPayload(
  nickname: string,
  result: SajuResult,
): ParticipantDerivedPayload {
  return {
    nickname,
    dominantElement: result.dominantElement,
    elementBalance: result.elementBalance,
    calculationVersion: result.calculationVersion,
  }
}
