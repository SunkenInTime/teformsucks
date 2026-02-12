export const SOUND_MUTED_KEY = "teform-muted";
export const SOUND_MUTED_EVENT = "teform-sound-muted";

export function getSoundMuted() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SOUND_MUTED_KEY) === "true";
}

export function setSoundMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_MUTED_KEY, muted ? "true" : "false");
  window.dispatchEvent(new CustomEvent(SOUND_MUTED_EVENT, { detail: muted }));
}
