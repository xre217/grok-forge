import { emitLedgerUpdated } from "@/lib/forge-events";

export async function pinToLedger(claim: string, type = "observation") {
  const res = await fetch("/api/ledger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      claim: claim.slice(0, 500),
      tags: ["grok-forge", "pinned"],
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Ledger write failed (${res.status})`);
  }

  const result = (await res.json()) as { ok: boolean };
  emitLedgerUpdated();
  return result;
}