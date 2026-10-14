"""
Fit and evaluate Bayesian Knowledge Tracing on the ASSISTments 2009-2010
skill-builder data, using the train/test split published with Piech et al. (2015),
"Deep Knowledge Tracing" (github.com/chrispiech/DeepKnowledgeTracing, data/assistments).

File format: three lines per student
    number of attempts
    skill id of each attempt
    correctness of each attempt (1 = correct, 0 = incorrect)

Usage:  python fit_bkt.py <folder containing builder_train.csv and builder_test.csv>
Writes model/results.json, which the app's Model page displays.
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
from sklearn.metrics import roc_auc_score, mean_squared_error, accuracy_score

from bkt import fit_skill, predict

DATA = Path(sys.argv[1])
OUT = Path(__file__).parent / "results.json"


def load(path):
    """Returns list of students; each student is a dict skill -> list of 0/1 in order."""
    lines = [l.strip().rstrip(",") for l in path.read_text().splitlines() if l.strip()]
    students = []
    for i in range(0, len(lines) - 2, 3):
        n = int(lines[i])
        skills, answers = lines[i + 1].split(","), lines[i + 2].split(",")
        assert len(skills) == n == len(answers)
        per_skill = defaultdict(list)
        for k, a in zip(skills, answers):
            per_skill[k].append(int(a))
        students.append(per_skill)
    return students


train, test = load(DATA / "builder_train.csv"), load(DATA / "builder_test.csv")

by_skill = defaultdict(list)
for st in train:
    for k, seq in st.items():
        by_skill[k].append(seq)

params = {}
for k, seqs in by_skill.items():
    params[k], _, _ = fit_skill(seqs, restarts=5, seed=42)

rate = {k: np.mean([x for s in seqs for x in s]) for k, seqs in by_skill.items()}

y, p_bkt, p_base = [], [], []
for st in test:
    for k, seq in st.items():
        if k not in params:
            continue
        y += seq
        p_bkt += predict(seq, params[k])
        p_base += [rate[k]] * len(seq)
y, p_bkt, p_base = map(np.array, (y, p_bkt, p_base))


def metrics(y, p):
    return {
        "auc": round(float(roc_auc_score(y, p)), 3),
        "rmse": round(float(np.sqrt(mean_squared_error(y, p))), 3),
        "accuracy": round(float(accuracy_score(y, (p >= 0.5).astype(int))), 3),
    }


P = np.array(list(params.values()))
names = ["prior", "learn", "guess", "slip"]
result = {
    "dataset": "ASSISTments 2009-2010 skill builder, train/test split from Piech et al. (2015)",
    "train": {"students": len(train), "attempts": int(sum(len(s) for st in train for s in st.values())),
              "skills": len(params)},
    "test": {"students": len(test), "attempts": int(len(y)),
             "correct_rate": round(float(y.mean()), 3)},
    "bkt": metrics(y, p_bkt),
    "baseline": metrics(y, p_base),
    "baseline_name": "Per-skill average correctness (no tracing)",
    "median_params": {n: round(float(np.median(P[:, i])), 2) for i, n in enumerate(names)},
    "param_quartiles": {n: [round(float(np.quantile(P[:, i], q)), 2) for q in (0.25, 0.5, 0.75)]
                        for i, n in enumerate(names)},
    "fit": "EM (Baum-Welch), 5 random restarts per skill, seed 42, non-degenerate fits preferred (guess < 0.5, slip < 0.5)",
}
OUT.write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
