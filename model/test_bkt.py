"""Checks the EM implementation before it is trusted on real data."""
import numpy as np
from bkt import fit_skill, simulate, predict

rng = np.random.default_rng(7)
cases = [(0.20, 0.15, 0.20, 0.10), (0.40, 0.10, 0.25, 0.05), (0.10, 0.25, 0.15, 0.08)]
for true in cases:
    seqs = simulate(3000, 12, true, rng)
    est, ll, trace = fit_skill(seqs, restarts=3, seed=1)
    diffs = np.diff(trace)
    assert (diffs > -1e-6).all(), "log-likelihood must never decrease under EM"
    err = max(abs(a - b) for a, b in zip(true, est))
    print("true", true, "fitted", tuple(round(x, 3) for x in est), "max abs error", round(err, 3))
    assert err < 0.04, "parameter recovery failed"

# Hand-checked single update: P(L)=0.5, T=0.1, G=0.2, S=0.1, answer correct
# posterior = 0.5*0.9 / (0.5*0.9 + 0.5*0.2) = 0.45/0.55 = 0.81818...
# next P(L) = 0.81818 + 0.18182*0.1 = 0.83636...
p = (0.5, 0.1, 0.2, 0.1)
pred = predict([1, 1], p)
assert abs(pred[0] - (0.5 * 0.9 + 0.5 * 0.2)) < 1e-12
pl1 = 0.45 / 0.55
pl1 = pl1 + (1 - pl1) * 0.1
assert abs(pred[1] - (pl1 * 0.9 + (1 - pl1) * 0.2)) < 1e-12
print("all checks passed")
