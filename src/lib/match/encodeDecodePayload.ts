import type { SharedSajuPayload } from '../../types/match';
import type { ParticipantProfile } from '../../types/element';

const PREFIX = 'HAP:';

/**
 * 참가자 프로필을 QR 코드용 안전한 문자열로 인코딩합니다.
 * (원본 생년월일 제외, 닉네임과 오행 분포만 포함)
 */
export function encodeSajuPayload(profile: ParticipantProfile): string {
  const payload: SharedSajuPayload = {
    version: 1,
    id: profile.id,
    nickname: profile.nickname,
    primaryElement: profile.primaryElement,
    elements: profile.elements,
    timestamp: Date.now(),
  };

  const json = JSON.stringify(payload);
  // UTF-8 안전 Base64 인코딩
  const base64 = btoa(encodeURIComponent(json));
  return `${PREFIX}${base64}`;
}

/**
 * 인코딩된 QR 문자열을 디코딩하여 SharedSajuPayload로 복원합니다.
 */
export function decodeSajuPayload(code: string): SharedSajuPayload | null {
  if (!code || typeof code !== 'string') return null;

  try {
    const raw = code.startsWith(PREFIX) ? code.slice(PREFIX.length) : code;
    const json = decodeURIComponent(atob(raw));
    const data = JSON.parse(json) as Partial<SharedSajuPayload>;

    if (
      data.version === 1 &&
      typeof data.id === 'string' &&
      typeof data.nickname === 'string' &&
      typeof data.primaryElement === 'string' &&
      data.elements &&
      typeof data.elements === 'object'
    ) {
      return data as SharedSajuPayload;
    }
    return null;
  } catch {
    return null;
  }
}
