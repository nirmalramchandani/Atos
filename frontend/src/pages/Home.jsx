import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  const metrics = [
    { value: '0.997', label: 'HDFS F1',        detail: 'P:0.994 · R:1.000' },
    { value: '0.916', label: 'BGL F1',          detail: 'P:0.861 · R:0.979' },
    { value: '0.958', label: 'Liberty F1',      detail: 'P:0.992 · R:0.926' },
    { value: '0.966', label: 'Thunderbird F1',  detail: 'P:0.966 · R:0.966' },
  ]

  const features = [
    {
      icon: '🔤', cls: 'fi-purple',
      title: 'Parser-Free Design',
      body: 'Feeds raw log text directly into LLMs — no fragile regex parsers. Works out-of-the-box on any log format.'
    },
    {
      icon: '🧠', cls: 'fi-cyan',
      title: 'BERT Log Embeddings',
      body: 'Each log message is encoded by BERT-base-uncased into a rich 768-dimensional semantic vector.'
    },
    {
      icon: '🦙', cls: 'fi-green',
      title: 'Llama-3 Reasoning',
      body: 'Meta-Llama-3-8B reasons over BERT embeddings (projected to 4096-dim) and outputs the final anomaly label.'
    },
    {
      icon: '⚡', cls: 'fi-amber',
      title: 'LoRA + QLoRA Fine-tuning',
      body: 'Low-rank adapters and 4-bit quantization make the 8B-parameter model trainable on a single consumer GPU.'
    },
    {
      icon: '📐', cls: 'fi-red',
      title: 'Sliding Window',
      body: 'N consecutive log lines form one sequence. The model captures temporal patterns across the whole window.'
    },
    {
      icon: '🏆', cls: 'fi-pink',
      title: 'State-of-the-Art Results',
      body: 'Achieves Avg. F1 = 0.959 across 4 benchmarks — outperforming all prior parser-based and parser-free methods.'
    }
  ]

  const datasets = [
    { name: 'HDFS',        messages: '11.2M', seqs: '575K', source: 'Hadoop Distributed FS',  anomaly: '2.90%' },
    { name: 'BGL',         messages: '4.7M',  seqs: '47K',  source: 'BlueGene/L HPC',          anomaly: '8.67%' },
    { name: 'Liberty',     messages: '5.0M',  seqs: '50K',  source: 'Liberty HPC',             anomaly: '6.51%' },
    { name: 'Thunderbird', messages: '10M',   seqs: '100K', source: 'Thunderbird HPC',         anomaly: '0.15%' },
  ]

  return (
    <div className="fade-in">

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg-glow" />
        <div className="hero-grid-lines" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Research Project &nbsp;·&nbsp; Log-based Anomaly Detection
          </div>

          <h1 className="hero-title">
            Detect Anomalies in<br />
            <span className="gradient-text">System Logs with AI</span>
          </h1>

          <p className="hero-subtitle">
            LogLLM combines <strong>BERT</strong> and <strong>Meta-Llama-3-8B</strong> to classify log sequences
            as Normal or Anomalous — with no hand-crafted parsers. Achieves state-of-the-art accuracy
            across 4 major industry benchmarks.
          </p>

          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/detect')}>
              Try Live Detection
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/how')}>
              How It Works
            </button>
          </div>

          <div className="hero-badges">
            {[
              { label: 'BERT-base-uncased',  color: '#7c3aed' },
              { label: 'Meta-Llama-3-8B',    color: '#06b6d4' },
              { label: 'LoRA Fine-tuning',   color: '#10b981' },
              { label: '4-bit QLoRA',        color: '#f59e0b' },
              { label: 'No Parser Needed',   color: '#ef4444' },
              { label: 'Avg F1 = 0.959',     color: '#a78bfa' },
            ].map(b => (
              <div key={b.label} className="hbadge">
                <span className="hbadge-dot" style={{ background: b.color }} />
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ── */}
      <section className="metrics-strip">
        <div className="container">
          <div className="metrics-grid">
            {metrics.map(m => (
              <div key={m.label} className="metric-item">
                <div className="metric-number">{m.value}</div>
                <div className="metric-name">{m.label}</div>
                <div className="metric-detail">{m.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS LOGLLM ── */}
      <section className="section">
        <div className="container">
          <div className="section-label">About the Project</div>
          <h2 className="section-heading">What is LogLLM?</h2>
          <p className="section-subheading">
            Modern distributed infrastructure — cloud servers, HPC clusters, Hadoop deployments — produces
            billions of log lines daily. Manually reviewing them for failures is impossible.
          </p>

          <div className="compare-grid" style={{ marginTop: '2.5rem' }}>
            <div className="compare-box old">
              <div className="cb-tag">❌ Traditional Approach</div>
              <div className="cb-title">Parser-Dependent Pipeline</div>
              <div className="cb-body">
                Raw Logs → <em>Regex Log Parser</em> → Templates → Anomaly Detector.<br /><br />
                <strong>Problem:</strong> Parsers break on every software update. Errors propagate
                downstream, degrading detection accuracy. Requires constant maintenance.
              </div>
            </div>
            <div className="compare-box new">
              <div className="cb-tag">✅ LogLLM Approach</div>
              <div className="cb-title">LLM-Native Pipeline</div>
              <div className="cb-body">
                Raw Logs → <em>BERT (Semantic Encoding)</em> → Projector → <em>Llama-3 (Reasoning)</em> → Normal / Anomalous.<br /><br />
                <strong>Advantage:</strong> No parser needed. LLMs understand raw log language naturally,
                generalise to unseen formats, and achieve best-in-class performance.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-label">Key Innovations</div>
          <h2 className="section-heading">Why LogLLM Works</h2>
          <p className="section-subheading">
            A carefully engineered pipeline that combines the best of NLP and generative AI
            for log-based anomaly detection.
          </p>

          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-body">{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE DIAGRAM ── */}
      <section className="section" style={{ background: 'var(--bg2)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="section-label">Architecture</div>
          <h2 className="section-heading">How the Model Works</h2>
          <p className="section-subheading">
            A hybrid deep learning pipeline: BERT encodes each log message, a trainable projector
            bridges embedding spaces, and Llama-3 reasons to produce the final classification.
          </p>

          <div className="pipeline-flow" style={{ marginTop: '2.5rem' }}>
            <div className="pipeline-step">
              <div className="ps-icon">📄</div>
              <div className="ps-label">Input</div>
              <div className="ps-name">Raw Log Sequence</div>
              <div className="ps-dim">N log messages</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="ps-icon">🔤</div>
              <div className="ps-label">Encoder</div>
              <div className="ps-name">BERT-base-uncased</div>
              <div className="ps-dim">768-dim per log</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="ps-icon">🔗</div>
              <div className="ps-label">Bridge</div>
              <div className="ps-name">Linear Projector</div>
              <div className="ps-dim">768 → 4096-dim</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="ps-icon">🦙</div>
              <div className="ps-label">Reasoner</div>
              <div className="ps-name">Meta-Llama-3-8B</div>
              <div className="ps-dim">LoRA fine-tuned</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="ps-icon">🎯</div>
              <div className="ps-label">Output</div>
              <div className="ps-name">Normal / Anomalous</div>
              <div className="ps-dim">Binary classification</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DATASETS ── */}
      <section className="section">
        <div className="container">
          <div className="section-label">Benchmarks</div>
          <h2 className="section-heading">Evaluated on 4 Major Datasets</h2>
          <p className="section-subheading">
            Tested on real-world system logs from Hadoop, BlueGene/L, Liberty, and Thunderbird HPC environments.
          </p>

          <div className="card" style={{ marginTop: '2.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Log Source</th>
                  <th>Log Messages</th>
                  <th>Sequences</th>
                  <th>Test Anomaly %</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map(d => (
                  <tr key={d.name}>
                    <td><strong style={{ color: 'var(--text)' }}>{d.name}</strong></td>
                    <td>{d.source}</td>
                    <td>{d.messages}</td>
                    <td>{d.seqs}</td>
                    <td><span className="badge badge-indigo">{d.anomaly}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="container">
          <div className="section-label" style={{ textAlign: 'center' }}>Get Started</div>
          <h2 className="cta-title">Ready to Detect Anomalies?</h2>
          <p className="cta-sub">
            Paste your system log sequences and get an instant classification from the LogLLM model.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/detect')}>
              Launch Live Detection →
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/results')}>
              View Benchmark Results
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-left">
          © 2026 LogLLM · BERT-base-uncased + Meta-Llama-3-8B · LoRA · QLoRA · PEFT
        </div>
        <div className="footer-badges">
          <span className="badge badge-indigo">BERT-base-uncased</span>
          <span className="badge badge-sky">Meta-Llama-3-8B</span>
          <span className="badge badge-green">Avg F1 = 0.959</span>
        </div>
      </footer>
    </div>
  )
}
