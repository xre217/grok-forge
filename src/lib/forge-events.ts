export const FORGE_LEDGER_UPDATED = "forge:ledger-updated";
export const FORGE_CHAT_SENT = "forge:chat-sent";

export function emitLedgerUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FORGE_LEDGER_UPDATED));
}

export function emitChatSent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FORGE_CHAT_SENT));
}