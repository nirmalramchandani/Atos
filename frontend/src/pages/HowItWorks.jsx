export default function HowItWorks() {
  const steps = [
    {
      title: 'Raw Log Ingestion',
      desc: 'Raw .log files are read line-by-line. Each line is a raw, unstructured log message — it may contain timestamps, host addresses, severity levels, component names, and free-form content. No parsing template is applied at this stage.',
    },
    {
      title: 'Sliding Window Grouping',
      desc: 'Log lines are grouped into fixed-size windows (default: 100 lines per window). Each window becomes one labelled sequence for training or inference. For HDFS, session-based grouping by Block ID is used. Windows slide with a configurable step to prevent missing boundary anomalies.',
    },
    {
      title: 'BERT Tokenization & Encoding',
      desc: 'Each log message in the window is tokenized independently by BERT-base-uncased (WordPiece tokenizer, max 128 tokens per message). BERT encodes each message into a 768-dimensional [CLS] pooler embedding that captures the full semantic meaning of that message.',
    },
    {
      title: 'Linear Projection (Bridge)',
      desc: 'A single trainable linear layer maps each 768-dim BERT embedding to a 4096-dim vector — matching Meta-Llama-3-8B\'s hidden dimension. This lightweight projector is the key architectural innovation that bridges the two model families.',
    },
    {
      title: 'Llama-3-8B Sequence Reasoning',
      desc: 'All projected message embeddings for the window are concatenated with instruction embeddings and passed into Llama-3-8B. The instruction prompt asks: "Is this sequence normal or anomalous?" Llama generates the answer auto-regressively using KV-Cache for efficiency.',
    },
    {
      title: 'LoRA Fine-tuning (Training)',
      desc: 'Both BERT and Llama-3 are fine-tuned using LoRA adapters (rank 4 for BERT, rank 8 for Llama-3 targeting q_proj & v_proj). 4-bit NF4 quantization (QLoRA) reduces VRAM to a practical level. Only ~1% of parameters are updated, preventing catastrophic forgetting of pre-trained knowledge.',
    },
    {
      title: 'Prediction & Evaluation',
      desc: 'The generated text is regex-matched for "normal" or "anomalous". Precision, Recall, and F1-Score are computed on held-out test sets and compared against 9 baseline methods (DeepLog, LogAnomaly, PLELog, FastLogAD, LogBERT, LogRobust, CNN, NeuralLog, RAPID).',
    },
  ]

  const training = [
    { phase: 'Phase 1', target: 'Projector only', detail: 'BERT and Llama-3 frozen. Only the linear bridge layer trains to align embedding spaces.' },
    { phase: 'Phase 2', target: 'Llama-3 LoRA', detail: 'Projector frozen. Llama-3 LoRA adapters fine-tune to learn anomaly classification from the bridged embeddings.' },
    { phase: 'Phase 3', target: 'BERT + Projector', detail: 'Joint fine-tuning of BERT LoRA adapters and projector for end-to-end semantic alignment.' },
  ]

  return (
    <div className="fade-in subpage">
      <div className="page-header">
        <div className="page-tag">TECHNICAL DEEP DIVE</div>
        <h1 className="page-title">How LogLLM Works</h1>
        <p className="page-sub">A step-by-step walkthrough of the complete pipeline from raw logs to anomaly label.</p>
      </div>

      {/* Steps */}
      {steps.map((s, i) => (
        <div key={i} className="step">
          <div className="step-num-wrap">{String(i + 1).padStart(2, '0')}</div>
          <div className="step-content">
            <div className="step-title">{s.title}</div>
            <div className="step-desc">{s.desc}</div>
          </div>
        </div>
      ))}

      {/* Architecture diagram */}
      <div className="section-title">🏗️ Model Architecture</div>
      <div className="arch-flow">
        {[
          { icon: '📋', name: 'Raw Logs',     dim: 'N messages' },
          null,
          { icon: '🔷', name: 'BERT Encoder', dim: '768-dim/msg' },
          null,
          { icon: '🔗', name: 'Projector',    dim: '768 → 4096' },
          null,
          { icon: '🦙', name: 'Llama-3-8B',   dim: 'Sequence reasoning' },
          null,
          { icon: '🎯', name: 'Prediction',   dim: 'normal / anomalous' },
        ].map((node, i) =>
          node === null
            ? <div key={i} className="arch-arrow">→</div>
            : (
              <div key={i} className="arch-node">
                <div className="an-icon">{node.icon}</div>
                <div className="an-name">{node.name}</div>
                <div className="an-dim">{node.dim}</div>
              </div>
            )
        )}
      </div>

      {/* Training phases */}
      <div className="section-title">🏋️ 3-Phase Training Strategy</div>
      <div className="card-grid card-grid-3" style={{ marginBottom: '2rem' }}>
        {training.map(({ phase, target, detail }) => (
          <div key={phase} className="card">
            <div className="badge badge-indigo" style={{ marginBottom: '.6rem' }}>{phase}</div>
            <div className="card-title">{target}</div>
            <div className="card-body">{detail}</div>
          </div>
        ))}
      </div>

      {/* LoRA details */}
      <div className="section-title">⚙️ LoRA Configuration</div>
      <div className="card-grid card-grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-title">🔷 BERT LoRA Config</div>
          <div className="code-block" style={{ marginTop: '.8rem' }}>
{`LoraConfig(
  task_type = FEATURE_EXTRACTION,
  r         = 4,       # rank
  lora_alpha = 32,
  lora_dropout = 0.01
)`}
          </div>
        </div>
        <div className="card">
          <div className="card-title">🦙 Llama-3 LoRA Config</div>
          <div className="code-block" style={{ marginTop: '.8rem' }}>
{`LoraConfig(
  r           = 8,
  lora_alpha  = 16,
  lora_dropout = 0.1,
  target_modules = ["q_proj", "v_proj"],
  bias      = "none",
  task_type = CAUSAL_LM
)`}
          </div>
        </div>
      </div>

      {/* Why LLMs work for logs */}
      <div className="section-title">🤔 Why LLMs Work for Log Analysis</div>
      <div className="card">
        <div className="card-grid card-grid-2">
          <div>
            <div className="tip-box info">
              <div>
                <strong>Pre-trained Language Understanding:</strong> BERT and Llama-3 were pre-trained on massive
                corpora including technical documentation. They already understand terms like "IOException",
                "Authentication failure", "Out of memory" semantically — without any task-specific training.
              </div>
            </div>
            <div className="tip-box info">
              <div>
                <strong>Generalisation to Unseen Formats:</strong> When a new service is deployed with
                different log formatting, LLMs can still understand the content because they reason about
                <em> meaning</em>, not pattern matching.
              </div>
            </div>
          </div>
          <div>
            <div className="tip-box success">
              <div>
                <strong>Instruction Following:</strong> Llama-3 is an instruction-following model. The prompt
                "Is this sequence normal or anomalous?" is a natural reasoning task that aligns with its
                pre-training, making fine-tuning very efficient.
              </div>
            </div>
            <div className="tip-box success">
              <div>
                <strong>Sequence-Level Context:</strong> By passing the entire window through one forward pass,
                Llama-3's attention mechanism can identify subtle patterns across many log lines that would
                be missed by per-line classifiers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
