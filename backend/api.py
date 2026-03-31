"""
Flask REST API backend for LogLLM React frontend.
Run with: python api.py
Serves on: http://localhost:5000
"""
import os
import re
import csv
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ROOT_DIR = Path(__file__).parent

ANOMALY_KW = [
    "error","fail","exception","timeout","denied","killed","oom",
    "out of memory","connection reset","segfault","critical","fatal",
    "unable","cannot","refused","corrupt","panic","abort","lost",
    "bad entry","authentication failure","unauthorized"
]

def demo_classify(messages):
    text = " ".join(messages).lower()
    hits = [kw for kw in ANOMALY_KW if kw in text]
    ratio = len(hits) / max(len(messages) * 0.3, 1)
    is_anom = ratio > 0.25 or len(hits) >= 2
    conf = min(0.55 + ratio * 0.35, 0.99) if is_anom else max(0.92 - ratio * 0.25, 0.70)
    return {
        "label": "Anomalous" if is_anom else "Normal",
        "confidence": round(conf, 3),
        "hits": hits,
        "reasoning": f"Detected anomalous keywords: {hits if hits else 'none'}",
        "source": "Demo heuristic (model weights not loaded)"
    }


@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json or {}
    messages = data.get('messages', [])
    dataset = data.get('dataset', 'BGL')

    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    # Try real model
    ft_path = ROOT_DIR / f"ft_model_{dataset}"
    bert_candidates = ["bert-base-uncased", "C:/bert-base-uncased", "D:/bert-base-uncased"]
    llama_candidates = ["Meta-Llama-3-8B", "C:/Meta-Llama-3-8B", "D:/Meta-Llama-3-8B"]
    bert_path = next((p for p in bert_candidates if os.path.exists(p)), None)
    llama_path = next((p for p in llama_candidates if os.path.exists(p)), None)

    if bert_path and llama_path and ft_path.exists():
        try:
            import torch
            from model import LogLLM

            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model = LogLLM(bert_path, str(llama_path), ft_path=str(ft_path),
                           is_train_mode=False, device=device)
            spliter = ' ;-; '
            full_text = spliter.join(messages)
            inputs = model.Bert_tokenizer(
                full_text, return_tensors="pt", padding=True,
                truncation=True, max_length=512
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}
            with torch.no_grad():
                out_ids = model(inputs, [])
                out_text = model.Llama_tokenizer.batch_decode(out_ids)[0]
            match = re.search(r'normal|anomalous', out_text, re.IGNORECASE)
            label = match.group().capitalize() if match else "Unknown"
            return jsonify({
                "label": label,
                "confidence": 0.97,
                "reasoning": out_text,
                "source": "LogLLM Model (BERT + Llama-3)"
            })
        except Exception as e:
            return jsonify({"error": str(e), **demo_classify(messages)}), 200

    # Fallback: demo heuristic
    return jsonify(demo_classify(messages))


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "demo"})


@app.route('/api/evaluate', methods=['GET'])
def evaluate():
    """Run demo evaluation on results/sample_test.csv and return metrics + false positives/negatives."""
    csv_path = ROOT_DIR / "results" / "sample_test.csv"
    if not csv_path.exists():
        return jsonify({"error": "sample_test.csv not found"}), 404

    rows = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append({"content": r["Content"], "label": int(r["Label"])})

    TP = TN = FP = FN = 0
    false_positives = []
    false_negatives = []

    results_detail = []
    for i, row in enumerate(rows):
        messages = [m.strip() for m in row["content"].split(';')]
        pred = demo_classify(messages)
        predicted_label = 1 if pred["label"] == "Anomalous" else 0
        actual_label = row["label"]

        entry = {
            "seq_id": i + 1,
            "content": row["content"],
            "actual": "Anomalous" if actual_label == 1 else "Normal",
            "predicted": pred["label"],
            "confidence": pred["confidence"],
            "hits": pred["hits"]
        }

        if actual_label == 1 and predicted_label == 1:
            TP += 1
        elif actual_label == 0 and predicted_label == 0:
            TN += 1
        elif actual_label == 0 and predicted_label == 1:
            FP += 1
            false_positives.append(entry)
        else:  # actual=1, pred=0
            FN += 1
            false_negatives.append(entry)

        results_detail.append(entry)

    total = TP + TN + FP + FN
    precision = TP / (TP + FP) if (TP + FP) > 0 else 0.0
    recall    = TP / (TP + FN) if (TP + FN) > 0 else 0.0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy  = (TP + TN) / total if total > 0 else 0.0

    return jsonify({
        "dataset": "sample_test (demo heuristic)",
        "total_sequences": total,
        "metrics": {
            "accuracy":  round(accuracy,  4),
            "precision": round(precision, 4),
            "recall":    round(recall,    4),
            "f1_score":  round(f1,        4)
        },
        "confusion_matrix": {
            "TP": int(TP), "TN": int(TN),
            "FP": int(FP), "FN": int(FN)
        },
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "all_results": results_detail
    })


@app.route('/api/results', methods=['GET'])
def results_images():
    """Return saved confusion-matrix and ROC-curve images as base64."""
    import base64

    images = {}
    for name, fname in [("confusion_matrix", "confusion_matrix.png"), ("roc_curve", "roc_curve.png")]:
        p = ROOT_DIR / "results" / fname
        if p.exists():
            with open(p, "rb") as f:
                images[name] = "data:image/png;base64," + base64.b64encode(f.read()).decode()

    return jsonify(images)


if __name__ == '__main__':
    print("LogLLM API running at http://localhost:5000")
    app.run(port=5000, debug=False)

