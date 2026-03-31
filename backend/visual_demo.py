import os
import random
import numpy as np
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (precision_score, recall_score, f1_score, accuracy_score,
                             confusion_matrix, ConfusionMatrixDisplay, roc_curve, auc)


def make_synthetic_logs(n_samples=1000, max_seq_len=10):
    normal_tokens = ["ok", "connected", "success", "read", "write", "cached"]
    anomalous_tokens = ["error", "fail", "timeout", "exception", "segfault", "denied"]

    texts = []
    labels = []
    for i in range(n_samples):
        seq_len = random.randint(3, max_seq_len)
        if random.random() < 0.15:  # anomaly ratio 15%
            # make anomalies contain some anomalous tokens
            tokens = random.choices(normal_tokens, k=seq_len-2) + random.choices(anomalous_tokens, k=2)
            random.shuffle(tokens)
            labels.append(1)
        else:
            tokens = random.choices(normal_tokens, k=seq_len)
            labels.append(0)
        texts.append(' ; '.join(tokens))
    return texts, np.array(labels)


def run_demo():
    os.makedirs('results', exist_ok=True)

    print('Generating synthetic dataset...')
    X_texts, y = make_synthetic_logs(n_samples=1000, max_seq_len=12)

    # split
    split = int(0.8 * len(X_texts))
    X_train, X_test = X_texts[:split], X_texts[split:]
    y_train, y_test = y[:split], y[split:]

    print('Vectorizing texts...')
    vec = TfidfVectorizer(ngram_range=(1,2), max_features=2000)
    Xtr = vec.fit_transform(X_train)
    Xte = vec.transform(X_test)

    print('Training classifier...')
    clf = LogisticRegression(max_iter=1000)
    clf.fit(Xtr, y_train)

    print('Evaluating...')
    probs = clf.predict_proba(Xte)[:, 1]
    preds = (probs >= 0.5).astype(int)

    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)
    acc = accuracy_score(y_test, preds)

    print(f'Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}, Acc: {acc:.4f}')

    # confusion matrix
    cm = confusion_matrix(y_test, preds)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['normal', 'anomalous'])
    fig, ax = plt.subplots(figsize=(5,4))
    disp.plot(ax=ax)
    fig.suptitle('Confusion Matrix')
    cm_path = os.path.join('results', 'confusion_matrix.png')
    fig.savefig(cm_path, bbox_inches='tight')
    plt.close(fig)

    # ROC
    fpr, tpr, _ = roc_curve(y_test, probs)
    roc_auc = auc(fpr, tpr)
    fig2, ax2 = plt.subplots(figsize=(5,4))
    ax2.plot(fpr, tpr, label=f'AUC = {roc_auc:.3f}')
    ax2.plot([0,1],[0,1],'--', color='gray')
    ax2.set_xlabel('False Positive Rate')
    ax2.set_ylabel('True Positive Rate')
    ax2.set_title('ROC Curve')
    ax2.legend(loc='lower right')
    roc_path = os.path.join('results', 'roc_curve.png')
    fig2.savefig(roc_path, bbox_inches='tight')
    plt.close(fig2)

    # Save a small sample CSV for inspection
    try:
        import pandas as pd
        df = pd.DataFrame({'Content': X_test, 'Label': y_test})
        df.to_csv(os.path.join('results','sample_test.csv'), index=False)
    except Exception:
        pass

    print('\nSaved visual outputs:')
    print(' -', cm_path)
    print(' -', roc_path)
    print('\nYou can open the PNGs in the results/ folder to show the instructor.')


if __name__ == '__main__':
    run_demo()
