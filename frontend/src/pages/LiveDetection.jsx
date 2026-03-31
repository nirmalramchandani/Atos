import { useState } from 'react'

const PRESETS = {
  Normal: `kernel: NET: Registered protocol family 10
systemd: Started Session 1 of user admin.
sshd: Accepted publickey for deploy from 10.0.0.5
cron: pam_unix session opened for user root
kernel: EXT3 FS on sda1, internal journal
systemd: Reached target Multi-User System`,
  Anomalous: `kernel: Out of memory: Kill process 4821 (java) score 920
kernel: Killed process 4821 (java) total-vm:8324096kB
HDFS: java.io.IOException: Connection reset by peer
HDFS: ERROR org.apache.hadoop.hdfs.server.datanode.DataNode
kernel: EXT3-fs error (device sdb1): ext3_find_entry: bad entry
sshd: Failed password for root from 192.168.1.44 port 42312`,
  Custom: '',
}

const ANOMALY_KW = [
  'error','fail','exception','timeout','denied','killed','oom',
  'out of memory','connection reset','segfault','critical','fatal',
  'unable','cannot','refused','corrupt','panic','abort','lost',
  'bad entry','authentication', 'unauthorized',
]

function classify(messages) {
  const text = messages.join(' ').toLowerCase()
  const hits = ANOMALY_KW.filter(kw => text.includes(kw))
  const ratio = hits.length / Math.max(messages.length * 0.3, 1)
  const isAnom = ratio > 0.25 || hits.length >= 2
  const conf = isAnom
    ? Math.min(0.55 + ratio * 0.35, 0.99)
    : Math.max(0.92 - ratio * 0.25, 0.70)
  return { label: isAnom ? 'Anomalous' : 'Normal', confidence: conf, hits }
}

function hasError(msg) {
  const l = msg.toLowerCase()
  return ANOMALY_KW.some(kw => l.includes(kw))
}

export default function LiveDetection() {
  const [preset, setPreset] = useState('Normal')
  const [text, setText] = useState(PRESETS['Normal'])
  const [dataset, setDataset] = useState('BGL')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function handlePreset(p) {
    setPreset(p)
    setText(PRESETS[p])
    setResult(null)
  }

  async function analyze() {
    const messages = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (!messages.length) return
    setLoading(true)
    setResult(null)

    // Try real API first, fall back to client-side demo
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, dataset }),
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = await res.json()
        setResult({ ...data, messages, source: 'LogLLM API (BERT + Llama-3)' })
      } else throw new Error('API error')
    } catch {
      // Demo mode
      await new Promise(r => setTimeout(r, 900))
      const { label, confidence, hits } = classify(messages)
      setResult({
        label, confidence, messages, hits,
        source: '⚠️ Demo Mode (model weights not loaded — using heuristic classifier)',
        reasoning: `Detected anomalous keywords: ${hits.length ? hits.join(', ') : 'none'}`,
      })
    }
    setLoading(false)
  }

  const messages = text.split('\n').map(l => l.trim()).filter(Boolean)

  return (
    <div className="fade-in subpage">
      <div className="page-header">
        <div className="page-tag">INTERACTIVE DEMO</div>
        <h1 className="page-title">Live Anomaly Detection</h1>
        <p className="page-sub">Paste log messages and let the AI classify the sequence as Normal or Anomalous.</p>
      </div>

      <div className="infer-grid">
        {/* Left: Input */}
        <div>
          <div className="card" style={{ marginBottom: '1.2rem' }}>
            <label className="label">Target System (fine-tuned weights)</label>
            <select
              className="select-input"
              value={dataset}
              onChange={e => setDataset(e.target.value)}
            >
              {['BGL','HDFS','Liberty','Thunderbird'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <div style={{ margin: '1rem 0 .5rem' }}>
              <label className="label">Load a Preset</label>
              <div className="preset-tabs">
                {Object.keys(PRESETS).map(p => (
                  <button
                    key={p}
                    className={`preset-btn ${preset === p ? 'active' : ''}`}
                    onClick={() => handlePreset(p)}
                  >
                    {p === 'Normal' ? '✅' : p === 'Anomalous' ? '🚨' : '✏️'} {p}
                  </button>
                ))}
              </div>
            </div>

            <label className="label">Log Sequence (one message per line)</label>
            <textarea
              className="log-textarea"
              value={text}
              onChange={e => { setText(e.target.value); setPreset('Custom'); setResult(null) }}
              placeholder="Paste your log messages here, one per line..."
              spellCheck={false}
            />

            <button className="btn-primary" onClick={analyze} disabled={loading || !messages.length}>
              {loading
                ? <><span className="spinner" style={{ borderTopColor: '#fff', width: 18, height: 18 }} /> Analyzing...</>
                : '🔍 Analyze Sequence'}
            </button>
          </div>
        </div>

        {/* Right: Result + tips */}
        <div>
          {result ? (
            <div style={{ marginBottom: '1.2rem' }} className="fade-in">
              <div className={`result-card ${result.label === 'Anomalous' ? 'anomalous' : 'normal'}`}>
                <div className="res-icon">{result.label === 'Anomalous' ? '🚨' : '✅'}</div>
                <div className="res-title">{result.label.toUpperCase()}</div>
                <div className="res-sub">
                  {result.label === 'Anomalous'
                    ? 'Anomalous behaviour detected in this log sequence.'
                    : 'This log sequence appears to be operating normally.'}
                </div>
                <div className="res-conf">Confidence: {(result.confidence * 100).toFixed(0)}%</div>
              </div>
              <p style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: '.5rem' }}>
                Source: {result.source}
              </p>
              {result.reasoning && (
                <details style={{ marginTop: '.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '.82rem', color: 'var(--text3)' }}>Debug info</summary>
                  <div className="code-block" style={{ marginTop: '.4rem', fontSize: '.75rem' }}>{result.reasoning}</div>
                </details>
              )}
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '1.2rem', textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🔍</div>
              <div>Hit <strong>Analyze Sequence</strong> to classify your logs</div>
            </div>
          )}

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-title" style={{ marginBottom: '.8rem' }}>💡 Tips</div>
            <ul style={{ fontSize: '.85rem', color: 'var(--text3)', lineHeight: 2.1, paddingLeft: '1.2rem' }}>
              <li>Paste <strong>3–100</strong> log lines per sequence</li>
              <li>Each line = one log message</li>
              <li>Blank lines are ignored</li>
              <li>The model analyses the <strong>full sequence</strong></li>
              <li>Select the matching dataset for best results</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: '.8rem' }}>⚠️ Common Anomaly Signals</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
              {['Out of Memory','IOException','Authentication failure','Connection reset','Segfault','Process killed','I/O Error','EXT3-fs error','Timeout'].map(kw => (
                <span key={kw} className="badge badge-indigo" style={{ fontSize: '.72rem' }}>{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log breakdown */}
      {result && result.messages && (
        <div className="card fade-in" style={{ marginTop: '.5rem' }}>
          <div className="card-title" style={{ marginBottom: '.8rem' }}>
            📋 Sequence Breakdown ({result.messages.length} messages)
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {result.messages.map((msg, i) => (
              <div key={i} className={`log-line ${hasError(msg) ? 'err' : 'ok'}`}>
                <span className="ll-num">[{String(i + 1).padStart(2, '0')}]</span>
                <span>{hasError(msg) ? '⚠' : '✔'} {msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
