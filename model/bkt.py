"""
Bayesian Knowledge Tracing (Corbett & Anderson, 1994).

Two hidden states per skill: 0 = not yet learned, 1 = learned.
    P(L0)  probability the skill is already learned before the first attempt
    P(T)   probability of moving from not-learned to learned after an attempt
    P(G)   probability of answering correctly while not learned (guess)
    P(S)   probability of answering incorrectly while learned (slip)
No forgetting: once learned, a skill stays learned.

Parameters are fitted per skill with the Expectation-Maximisation
(Baum-Welch) algorithm, vectorised over all student sequences of that skill.
"""
import numpy as np


def pad(seqs):
    """List of 0/1 lists -> (obs matrix, mask matrix), shape (n_seq, max_len)."""
    n, m = len(seqs), max(len(s) for s in seqs)
    obs = np.zeros((n, m))
    mask = np.zeros((n, m), dtype=bool)
    for i, s in enumerate(seqs):
        obs[i, : len(s)] = s
        mask[i, : len(s)] = True
    return obs, mask


def _emission(obs, g, s):
    # e[..., 0] = P(o | not learned), e[..., 1] = P(o | learned)
    e0 = np.where(obs == 1, g, 1 - g)
    e1 = np.where(obs == 1, 1 - s, s)
    return np.stack([e0, e1], axis=-1)


def e_step(obs, mask, p):
    l0, t, g, s = p
    n, m = obs.shape
    A = np.array([[1 - t, t], [0.0, 1.0]])
    e = _emission(obs, g, s)
    alpha = np.zeros((n, m, 2))
    c = np.ones((n, m))  # scaling factors
    a = np.array([1 - l0, l0]) * e[:, 0]
    c[:, 0] = a.sum(1)
    alpha[:, 0] = a / c[:, 0:1]
    for k in range(1, m):
        a = (alpha[:, k - 1] @ A) * e[:, k]
        ck = a.sum(1)
        live = mask[:, k]
        c[live, k] = ck[live]
        alpha[live, k] = a[live] / ck[live, None]
        alpha[~live, k] = alpha[~live, k - 1]
    beta = np.ones((n, m, 2))
    xi01 = np.zeros((n, m))       # expected 0 -> 1 transitions
    from0 = np.zeros((n, m))      # expected time in state 0 that is followed by another attempt
    for k in range(m - 2, -1, -1):
        live = mask[:, k + 1]
        b = (e[:, k + 1] * beta[:, k + 1]) @ A.T / c[:, k + 1:k + 2]
        beta[live, k] = b[live]
        x = alpha[:, k, 0] * t * e[:, k + 1, 1] * beta[:, k + 1, 1] / c[:, k + 1]
        xi01[live, k] = x[live]
    gamma = alpha * beta
    gamma /= gamma.sum(-1, keepdims=True)
    nxt = np.zeros_like(mask)
    nxt[:, :-1] = mask[:, 1:]
    from0 = np.where(nxt, gamma[..., 0], 0.0)
    ll = np.log(c[mask]).sum()
    return gamma, xi01, from0, ll


def m_step(obs, mask, gamma, xi01, from0):
    g0 = np.where(mask, gamma[..., 0], 0.0)
    g1 = np.where(mask, gamma[..., 1], 0.0)
    l0 = gamma[:, 0, 1].mean()
    t = xi01.sum() / max(from0.sum(), 1e-12)
    g = (g0 * obs).sum() / max(g0.sum(), 1e-12)
    s = (g1 * (1 - obs)).sum() / max(g1.sum(), 1e-12)
    eps = 1e-4
    return tuple(float(np.clip(v, eps, 1 - eps)) for v in (l0, t, g, s))


def fit_skill(seqs, restarts=5, iters=200, tol=1e-6, seed=0):
    """Returns (params, log-likelihood, list of log-likelihood per iteration of the chosen run)."""
    obs, mask = pad(seqs)
    rng = np.random.default_rng(seed)
    best = None
    for r in range(restarts):
        p = (rng.uniform(0.05, 0.6), rng.uniform(0.05, 0.4),
             rng.uniform(0.05, 0.3), rng.uniform(0.05, 0.2))
        trace = []
        for _ in range(iters):
            gamma, xi01, from0, ll = e_step(obs, mask, p)
            trace.append(ll)
            p = m_step(obs, mask, gamma, xi01, from0)
            if len(trace) > 1 and abs(trace[-1] - trace[-2]) < tol:
                break
        _, _, _, ll = e_step(obs, mask, p)
        degenerate = p[2] >= 0.5 or p[3] >= 0.5
        key = (not degenerate, ll)
        if best is None or key > best[0]:
            best = (key, p, ll, trace)
    return best[1], best[2], best[3]


def predict(seq, p):
    """P(correct) for each attempt, computed before that attempt is observed."""
    l0, t, g, s = p
    pl, out = l0, []
    for o in seq:
        out.append(pl * (1 - s) + (1 - pl) * g)
        post = pl * (1 - s) / (pl * (1 - s) + (1 - pl) * g) if o else pl * s / (pl * s + (1 - pl) * (1 - g))
        pl = post + (1 - post) * t
    return out


def simulate(n_students, length, p, rng):
    l0, t, g, s = p
    seqs = []
    for _ in range(n_students):
        known = rng.random() < l0
        seq = []
        for _ in range(length):
            seq.append(int(rng.random() < ((1 - s) if known else g)))
            if not known and rng.random() < t:
                known = True
        seqs.append(seq)
    return seqs
