const ALL_RESULTS = [
  { method: 'DeepLog',     parser: true,  hdfs: 0.908, bgl: 0.285, liberty: 0.800, thunder: 0.033, avg: 0.506 },
  { method: 'LogAnomaly',  parser: true,  hdfs: 0.966, bgl: 0.299, liberty: 0.768, thunder: 0.050, avg: 0.521 },
  { method: 'PLELog',      parser: true,  hdfs: 0.934, bgl: 0.710, liberty: 0.832, thunder: 0.764, avg: 0.810 },
  { method: 'FastLogAD',   parser: true,  hdfs: 0.798, bgl: 0.287, liberty: 0.263, thunder: 0.017, avg: 0.341 },
  { method: 'LogBERT',     parser: true,  hdfs: 0.758, bgl: 0.283, liberty: 0.744, thunder: 0.039, avg: 0.456 },
  { method: 'LogRobust',   parser: true,  hdfs: 0.980, bgl: 0.810, liberty: 0.813, thunder: 0.482, avg: 0.771 },
  { method: 'CNN',         parser: true,  hdfs: 0.982, bgl: 0.810, liberty: 0.709, thunder: 0.769, avg: 0.818 },
  { method: 'NeuralLog',   parser: false, hdfs: 0.979, bgl: 0.835, liberty: 0.900, thunder: 0.857, avg: 0.893 },
  { method: 'RAPID',       parser: false, hdfs: 0.924, bgl: 0.548, liberty: 0.732, thunder: 0.203, avg: 0.602 },
  { method: 'LogLLM ⭐',   parser: false, hdfs: 0.997, bgl: 0.916, liberty: 0.958, thunder: 0.966, avg: 0.959, best: true },
]

const COLS = ['hdfs','bgl','liberty','thunder','avg']
const COL_LABELS = { hdfs:'HDFS F1', bgl:'BGL F1', liberty:'Liberty F1', thunder:'Thunderbird F1', avg:'Avg F1' }

const maxVals = COLS.reduce((acc, c) => {
  acc[c] = Math.max(...ALL_RESULTS.map(r => r[c]))
  return acc
}, {})

const DETAILED = [
  { label: 'HDFS',        precision: 0.994, recall: 1.000, f1: 0.997, color: 'var(--primary)' },
  { label: 'BGL',         precision: 0.861, recall: 0.979, f1: 0.916, color: 'var(--accent)' },
  { label: 'Liberty',     precision: 0.992, recall: 0.926, f1: 0.958, color: 'var(--success)' },
  { label: 'Thunderbird', precision: 0.966, recall: 0.966, f1: 0.966, color: 'var(--warning)' },
]

const DATASET_STATS = [
  { dataset:'HDFS',        msgs:'11,175,629', total:'575,061', train:'460,048', tAnom:'13,497', tRatio:'2.93%', test:'115,013', teAnom:'3,341', teRatio:'2.90%' },
  { dataset:'BGL',         msgs:'4,747,963',  total:'47,135',  train:'37,708',  tAnom:'4,009',  tRatio:'10.63%',test:'9,427',   teAnom:'817',   teRatio:'8.67%' },
  { dataset:'Liberty',     msgs:'5,000,000',  total:'50,000',  train:'40,000',  tAnom:'34,144', tRatio:'85.36%',test:'10,000',  teAnom:'651',   teRatio:'6.51%' },
  { dataset:'Thunderbird', msgs:'10,000,000', total:'99,997',  train:'79,997',  tAnom:'837',    tRatio:'1.05%', test:'20,000',  teAnom:'29',    teRatio:'0.15%' },
]

function Bar({ value, max, color = 'var(--primary)' }) {
  const pct = (value / max) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
      <div className="progress-wrap" style={{ flex: 1, background: 'var(--surface3)' }}>
        <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text2)', width: 36, textAlign: 'right' }}>{value.toFixed(3)}</span>
    </div>
  )
}

export default function Results() {
  return (
    <div className="fade-in subpage">
      <div className="page-header">
        <div className="page-tag">EVALUATION</div>
        <h1 className="page-title">Benchmark Results</h1>
        <p className="page-sub">LogLLM vs 9 state-of-the-art baselines across 4 major log datasets.</p>
      </div>

      {/* LogLLM headline metrics */}
      <div className="section-title">🏆 LogLLM Performance (Our Model)</div>
      <div className="card-grid card-grid-4" style={{ marginBottom: '2rem' }}>
        {DETAILED.map(({ label, precision, recall, f1, color }) => (
          <div key={label} className="card">
            <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text3)', marginBottom: '.6rem' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color }}>{f1.toFixed(3)}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: '.2rem' }}>F1-Score</div>
            <hr className="divider" style={{ margin: '.8rem 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem' }}>
              {[['P', precision],['R', recall]].map(([k,v]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)' }}>{v.toFixed(3)}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{k === 'P' ? 'Precision' : 'Recall'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Visual F1 bars */}
      <div className="section-title">📊 F1-Score Comparison (Bar Chart)</div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        {COLS.map(col => (
          <div key={col} style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '.5rem' }}>
              {COL_LABELS[col]}
            </div>
            {ALL_RESULTS.map(r => (
              <div key={r.method} style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '.3rem' }}>
                <div style={{
                  width: 110, fontSize: '.78rem', color: r.best ? 'var(--success)' : 'var(--text2)',
                  fontWeight: r.best ? 800 : 400, flexShrink: 0, textAlign: 'right'
                }}>{r.method}</div>
                <div style={{ flex: 1 }}>
                  <Bar value={r[col]} max={maxVals[col]} color={r.best ? 'var(--success)' : 'var(--primary)'} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Full comparison table */}
      <div className="section-title">📋 Full Comparison Table</div>
      <div className="card" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Method</th>
              <th style={{ textAlign: 'center' }}>Parser?</th>
              <th>HDFS F1</th>
              <th>BGL F1</th>
              <th>Liberty F1</th>
              <th>Thunderbird F1</th>
              <th>Avg F1</th>
            </tr>
          </thead>
          <tbody>
            {ALL_RESULTS.map(r => (
              <tr key={r.method} className={r.best ? 'highlight-row' : ''}>
                <td><strong>{r.method}</strong></td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: r.parser ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                    {r.parser ? '✓ Yes' : '✗ No'}
                  </span>
                </td>
                {COLS.map(c => (
                  <td key={c} className={r[c] === maxVals[c] ? 'best-cell' : ''}>
                    {r[c].toFixed(3)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: '.8rem' }}>
          ⭐ Green = best per column. ✗ No parser = parser-free method. LogLLM achieves best Avg F1 (0.959).
        </p>
      </div>

      {/* Dataset statistics */}
      <div className="section-title">📂 Dataset Statistics</div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Log Messages</th>
              <th>Total Seqs</th>
              <th>Train Seqs</th>
              <th>Train Anomalies</th>
              <th>Train Anom %</th>
              <th>Test Seqs</th>
              <th>Test Anomalies</th>
              <th>Test Anom %</th>
            </tr>
          </thead>
          <tbody>
            {DATASET_STATS.map(d => (
              <tr key={d.dataset}>
                <td><strong>{d.dataset}</strong></td>
                <td>{d.msgs}</td>
                <td>{d.total}</td>
                <td>{d.train}</td>
                <td>{d.tAnom}</td>
                <td><span className="badge badge-indigo">{d.tRatio}</span></td>
                <td>{d.test}</td>
                <td>{d.teAnom}</td>
                <td><span className="badge badge-indigo">{d.teRatio}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
