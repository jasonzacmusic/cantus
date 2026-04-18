export default function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#F6F1E7',
        color: '#1F1E2E',
        fontFamily: 'Georgia, "Times New Roman", serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#2D5E6B',
            color: '#F6F1E7',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.8rem',
            fontWeight: 600,
            letterSpacing: '-0.04em',
          }}
        >
          N
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', margin: 0, fontWeight: 400, letterSpacing: '-0.02em' }}>
          Cantus
        </h1>
        <p style={{ color: '#524768', fontStyle: 'italic', margin: '0.5rem 0 2rem' }}>
          Nathaniel School of Music
        </p>
        <p style={{ color: '#8D846F', fontSize: '0.9rem', fontFamily: 'ui-monospace, monospace' }}>
          tuning the piano…
        </p>
      </div>
    </main>
  );
}
