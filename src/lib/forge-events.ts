export const FORGE_LEDGER_UPDATED = "forge:ledger-updated";
export const FORGE_CHAT_SENT = "forge:chat-sent";
export const FORGE_CREW_ACTIVITY_UPDATED = "forge:crew-activity-updated";

export function emitLedgerUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FORGE_LEDGER_UPDATED));
}

export function emitChatSent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FORGE_CHAT_SENT));
}

export function emitCrewActivityUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FORGE_CREW_ACTIVITY_UPDATED));
}