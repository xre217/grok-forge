#!/usr/bin/env python3
"""Return a THRML-inspired planning signal for the PROJECT: VILO / JARVIS control surface.

The script uses the cloned THRML checkout when JAX dependencies are installed.
Until then, it returns a deterministic fallback with the same JSON shape so the
Next.js app can keep working.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from typing import Any


def _read_payload() -> dict[str, Any]:
    try:
        return json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        return {}


def _fallback(prompt: str, reason: str) -> dict[str, Any]:
    digest = hashlib.sha256(prompt.encode("utf-8")).digest()
    urgency = round(digest[0] / 255, 3)
    uncertainty = round(digest[1] / 255, 3)
    exploration = round(digest[2] / 255, 3)
    modes = ("observe", "plan", "execute", "verify")
    mode = modes[digest[3] % len(modes)]

    return {
        "engine": "deterministic-fallback",
        "using_thrml": False,
        "reason": reason,
        "mode": mode,
        "scores": {
            "urgency": urgency,
            "uncertainty": uncertainty,
            "exploration": exploration,
        },
        "recommendation": _recommend(mode, urgency, uncertainty, exploration),
    }


def _recommend(mode: str, urgency: float, uncertainty: float, exploration: float) -> str:
    if uncertainty > 0.72:
        return "Gather more runtime evidence before making broad changes."
    if urgency > 0.72:
        return "Act on the smallest useful next step and verify immediately."
    if exploration > 0.66:
        return "Explore adjacent tools or repos for a better integration point."
    return f"Proceed in {mode} mode with tight feedback loops."


def _thrml_sample(prompt: str) -> dict[str, Any]:
    repo_path = os.environ.get("THRML_REPO_PATH", "").strip()
    if not repo_path:
        raise ModuleNotFoundError("THRML_REPO_PATH not set")
    if repo_path not in sys.path:
        sys.path.insert(0, repo_path)

    import jax
    import jax.numpy as jnp
    from thrml import Block, SamplingSchedule, SpinNode, sample_states
    from thrml.models import IsingEBM, IsingSamplingProgram, hinton_init

    digest = hashlib.sha256(prompt.encode("utf-8")).digest()
    node_count = 6
    nodes = [SpinNode() for _ in range(node_count)]
    edges = [(nodes[i], nodes[i + 1]) for i in range(node_count - 1)]

    bias_values = [((digest[i] / 255) * 2) - 1 for i in range(node_count)]
    weight_values = [0.15 + (digest[i + node_count] / 255) * 0.7 for i in range(node_count - 1)]

    model = IsingEBM(
        nodes,
        edges,
        jnp.array(bias_values),
        jnp.array(weight_values),
        jnp.array(1.0),
    )
    free_blocks = [Block(nodes[::2]), Block(nodes[1::2])]
    program = IsingSamplingProgram(model, free_blocks, clamped_blocks=[])
    schedule = SamplingSchedule(n_warmup=32, n_samples=128, steps_per_sample=2)

    key = jax.random.key(int.from_bytes(digest[:4], "big"))
    init_key, sample_key = jax.random.split(key, 2)
    init_state = hinton_init(init_key, model, free_blocks, ())
    samples = sample_states(sample_key, program, schedule, init_state, [], [Block(nodes)])
    spin_samples = (samples[0].astype(jnp.int8) * 2) - 1
    magnetization = jnp.mean(spin_samples, axis=0)
    consensus = float(jnp.mean(jnp.abs(magnetization)))
    uncertainty = round(1.0 - consensus, 3)
    urgency = round(float(jnp.mean(spin_samples > 0)), 3)
    exploration = round(float(jnp.std(magnetization)), 3)

    mode = "execute" if urgency > 0.62 and uncertainty < 0.5 else "observe" if uncertainty > 0.65 else "verify"

    return {
        "engine": "thrml-ising",
        "using_thrml": True,
        "mode": mode,
        "scores": {
            "urgency": urgency,
            "uncertainty": uncertainty,
            "exploration": exploration,
        },
        "recommendation": _recommend(mode, urgency, uncertainty, exploration),
    }


def main() -> None:
    prompt = str(_read_payload().get("prompt", ""))
    try:
        result = _thrml_sample(prompt)
    except Exception as exc:
        result = _fallback(prompt, f"{exc.__class__.__name__}: {exc}")

    print(json.dumps(result, separators=(",", ":")))


if __name__ == "__main__":
    main()
