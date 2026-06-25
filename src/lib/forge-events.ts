export const FORGE_LEDGER_UPDATED = "forge:ledger-updated";

export function emitLedgerUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FORGE_LEDGER_UPDATED));
}