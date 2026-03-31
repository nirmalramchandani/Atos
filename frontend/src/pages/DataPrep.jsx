import { useState } from 'react'

const LOG_FORMATS = {
  BGL:         '<Label> <Id> <Date> <Code1> <Time> <Code2> <Component1> <Component2> <Level> <Content>',
  HDFS:        '<Date> <Time> <Pid> <Level> <Component> <Content>',
  Liberty:     '<Label> <Id> <Date> <Admin> <Month> <Day> <Time> <AdminAddr> <Content>',
  Thunderbird: '<Label> <Id> <Date> <Admin> <Month> <Day> <Time> <AdminAddr> <Content>',
}

const DEMO_DATA = [
  { Content: 'kernel: NET registered protocol ;-; sshd: Accepted publickey for user ;-; cron: session opened', Label: 0 },
  { Content: 'HDFS: IOException connection reset ;-; ERROR DataNode: lost connection ;-; kernel: OOM kill process java', Label: 1 },
  { Content: 'systemd: Started Session 2 ;-; kernel: EXT3 FS on sda1 ;-; cron: session closed for user', Label: 0 },
  { Content: 'kernel: EXT3-fs error device sdb1 ;-; sshd: Failed password for root ;-; kernel: Killed process', Label: 1 },
  { Content: 'sshd: Accepted publickey ;-; cron: session opened ;-; systemd: Reached target Multi-User', Label: 0 },
]

export default function DataPrep() {
  const [dataset, setDataset] = useState('BGL')
  const [logFile, setLogFile] = useState('D:/logs/BGL.log')
  const [outputDir, setOutputDir] = useState('D:/mini project/')
  const [windowSize, setWindowSize] = useState(100)
  const [stepSize, setStepSize] = useState(100)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [done, setDone] = useState(false)

  function handleDataset(d) {
    setDataset(d)
    setLogFile(`D:/logs/${d}.log`)
    setProgress(0); setStatus(''); setDone(false)
  }

  async function runProcessing() {
    setDone(false)
    const stages = [
      [15, '📂 Reading raw log file...'],
      [35, '🏷️ Parsing fields and extracting labels...'],
      [60, '🪟 Creating sliding windows...'],
      [80, '✅ Labelling sequences (Normal / Anomalous)...'],
      [95, '💾 Writing train.csv and test.csv...'],
      [100, '✅ Done!'],
    ]
    for (const [pct, msg] of stages) {
      await new Promise(r => setTimeout(r, 500))
      setProgress(pct); setStatus(msg)
    }
    setDone(true)
  }

  const windowType = dataset === 'HDFS' ? 'Session Window (by Block ID)' : 'Sliding Window'

  return (
    <div className="fade-in subpage">
      <div className="page-header">
        <div className="page-tag">PIPELINE STAGE 1</div>
        <h1 className="page-title">Data Preparation</h1>
        <p className="page-sub">Convert raw log files into structured sequences ready for the AI model.</p>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title" style={{ marginBottom: '1rem' }}>📖 How Data Preparation Works</div>
        <div className="card-grid card-grid-2">
          {[
            { step: '1', title: 'Parse', desc: 'Raw logs are read and split into structured fields (Label, Timestamp, Component, Content) using a log format string specific to each dataset.' },
            { step: '2', title: 'Label', desc: 'Each log line is marked Normal (0) or Anomalous (1) based on the label field in the log file or an external anomaly label file.' },
            { step: '3', title: 'Window', desc: 'Log lines are grouped into windows. BGL/Liberty/Thunderbird use fixed-size sliding windows. HDFS groups by Block ID (session window).' },
            { step: '4', title: 'Export', desc: 'Each window becomes one CSV row: the messages joined by " ;-; " with a binary label (0=Normal, 1=Anomalous). Output: train.csv + test.csv.' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: '.8rem' }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff', fontWeight: 800,
                fontSize: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{step}</div>
              <div>
                <strong style={{ color: 'var(--text)', fontSize: '.9rem' }}>{title}</strong>
                <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: '.2rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config */}
      <div className="section-title">⚙️ Configuration</div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-grid card-grid-2" style={{ gap: '1.2rem' }}>
          <div>
            <label className="label">Dataset</label>
            <select className="select-input" value={dataset} onChange={e => handleDataset(e.target.value)}>
              {['BGL','HDFS','Liberty','Thunderbird'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Window Type</label>
            <input className="text-input" readOnly value={windowType} style={{ background: 'var(--surface2)' }} />
          </div>
          <div>
            <label className="label">Raw Log File Path</label>
            <input className="text-input" value={logFile} onChange={e => setLogFile(e.target.value)} />
          </div>
          <div>
            <label className="label">Output Directory</label>
            <input className="text-input" value={outputDir} onChange={e => setOutputDir(e.target.value)} />
          </div>
          {dataset !== 'HDFS' && (
            <>
              <div>
                <label className="label">Window Size (lines per sequence)</label>
                <input className="text-input" type="number" min={10} max={500} value={windowSize}
                  onChange={e => setWindowSize(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Step Size (sliding stride)</label>
                <input className="text-input" type="number" min={1} max={500} value={stepSize}
                  onChange={e => setStepSize(Number(e.target.value))} />
              </div>
            </>
          )}
        </div>

        <div className="tip-box info" style={{ marginTop: '1rem' }}>
          <div>Log format for <strong>{dataset}</strong>: <code style={{ fontFamily: 'JetBrains Mono', fontSize: '.8rem' }}>{LOG_FORMATS[dataset]}</code></div>
        </div>

        <button className="btn-primary" style={{ maxWidth: 260, marginTop: '1rem' }} onClick={runProcessing}>
          🚀 Start Processing
        </button>

        {status && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
              <span style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{status}</span>
              <span style={{ fontSize: '.85rem', color: 'var(--primary)', fontWeight: 700 }}>{progress}%</span>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {done && (
          <div className="tip-box success" style={{ marginTop: '1rem' }}>
            ✅ Processing complete! Files saved to <strong>{outputDir}</strong>
            <br />In production, this runs <code>python -m prepareData.sliding_window</code> or <code>prepareData.session_window</code>.
          </div>
        )}
      </div>

      {/* Sample data preview */}
      <div className="section-title">🔍 Sample Processed Data</div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '.85rem', color: 'var(--text3)', marginBottom: '1rem' }}>
          Each row = one window of log messages joined by <code style={{ fontFamily: 'JetBrains Mono' }}> ;-; </code> with a binary label (0 = Normal, 1 = Anomalous).
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Content (window)</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_DATA.map((row, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '.75rem', maxWidth: 500, wordBreak: 'break-all' }}>
                    {row.Content}
                  </td>
                  <td>
                    <span className={`badge ${row.Label === 1 ? 'badge-indigo' : 'badge-green'}`}
                      style={{ background: row.Label === 1 ? 'var(--danger-lt)' : 'var(--success-lt)',
                               color: row.Label === 1 ? 'var(--danger)' : 'var(--success)' }}>
                      {row.Label === 1 ? '1 · Anomalous' : '0 · Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual commands */}
      <div className="section-title">🛠️ Run Manually</div>
      <div className="card">
        <div className="card-body" style={{ marginBottom: '1rem' }}>
          Run these commands from the project root directory:
        </div>
        <div className="code-block">
{`# Prepare data (BGL, Liberty, Thunderbird):
python -m prepareData.sliding_window

# Prepare data (HDFS session windows):
python -m prepareData.session_window

# Train the model:
python train.py

# Evaluate on test set:
python eval.py

# Generate demo visualisations:
python visual_demo.py`}
        </div>
      </div>
    </div>
  )
}
