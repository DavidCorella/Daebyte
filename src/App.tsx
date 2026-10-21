import { useState } from 'react'
import './App.css'

const CONTACT_EMAIL = 'david.corella@daebyte.com'
const LOGO_SRC = '/logo.png'

const SERVICES = [
  'Software a medida',
  'Aplicaciones web',
  'Apps móviles',
  'Integraciones y APIs',
  'Cloud y DevOps',
]

function Logo() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span className="wordmark">DAEBYTE</span>
  }

  return (
    <img
      src={LOGO_SRC}
      alt="Daebyte"
      className="logo"
      onError={() => setFailed(true)}
    />
  )
}

// Trazas de circuito decorativas, inspiradas en los nodos del logo
function Circuit({ className }: { className: string }) {
  return (
    <svg className={`circuit ${className}`} viewBox="0 0 320 320" aria-hidden="true">
      <path d="M0 60h120a20 20 0 0 1 20 20v80" />
      <path d="M0 120h60a20 20 0 0 1 20 20v120" />
      <path d="M0 200h20" />
      <path d="M200 0v40a20 20 0 0 0 20 20h100" />
      <circle cx="140" cy="168" r="8" />
      <circle cx="80" cy="268" r="8" />
      <circle cx="28" cy="200" r="8" />
      <circle cx="320" cy="60" r="8" />
    </svg>
  )
}

function App() {
  return (
    <div className="page">
      <div className="backdrop" aria-hidden="true">
        <div className="grid" />
        <div className="glow glow-a" />
        <div className="glow glow-b" />
        <Circuit className="circuit-tl" />
        <Circuit className="circuit-br" />
      </div>

      <main className="hero">
        <Logo />

        <span className="badge">
          <span className="pulse" />
          Sitio en construcción
        </span>

        <h1>
          Estamos construyendo
          <br />
          algo <span className="accent">grande</span>.
        </h1>

        <p className="lead">
          En Daebyte diseñamos y desarrollamos software a la medida de tu
          negocio. Muy pronto podrás conocer todo lo que hacemos; mientras
          tanto, estamos listos para escucharte.
        </p>

        <div className="actions">
          <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>
            Hablemos de tu proyecto
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a className="email" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="progress" role="img" aria-label="Progreso del sitio: 80%">
          <div className="progress-head">
            <span>Lanzamiento</span>
            <span className="mono">80%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" />
          </div>
        </div>

        <ul className="services">
          {SERVICES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </main>

      <footer className="footer">
        <span className="footer-brand">
          <img src="/logo-mark.png" alt="" />
          © {new Date().getFullYear()} Daebyte. Todos los derechos reservados.
        </span>
        <span className="mono">{'</>'} Desarrollo de software</span>
      </footer>
    </div>
  )
}

export default App
