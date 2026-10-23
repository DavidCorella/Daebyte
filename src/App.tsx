import { useState, type ReactNode } from 'react'
import './App.css'

const CONTACT_EMAIL = 'contacto@daebyte.com'
const WHATSAPP_DISPLAY = '6096-0986'
const WHATSAPP_URL = `https://wa.me/50660960986?text=${encodeURIComponent(
  'Hola DaeByte, me gustaría información sobre sus servicios.',
)}`
const INSTAGRAM_USER = '_daebyte'
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USER}/`
const LOGO_SRC = '/logo.png'

const NAV = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#proceso', label: 'Cómo trabajamos' },
  { href: '#clientes', label: 'Clientes' },
  { href: '#nosotros', label: 'Nosotros' },
]

// Reemplazar con los clientes reales; `logo` es opcional (ruta dentro de /public)
const CLIENTS: { name: string; logo?: string }[] = [
  { name: 'Ecoway', logo: '/clientes/ecoway.png' },
]

// Íconos de trazo simple, mismo grosor que las líneas del logo
const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {d}
  </svg>
)

const SERVICES = [
  {
    title: 'Desarrollo de páginas web',
    text: 'Sitios corporativos, tiendas en línea y landing pages rápidas, modernas y adaptadas a cualquier dispositivo.',
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>,
    ),
  },
  {
    title: 'Sistemas y programas a medida',
    text: 'Aplicaciones web y de escritorio diseñadas alrededor de los procesos reales de tu negocio.',
    icon: icon(<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />),
  },
  {
    title: 'Automatización de procesos',
    text: 'Eliminamos tareas repetitivas: reportes, facturación, inventarios y flujos que hoy consumen horas.',
    icon: icon(
      <>
        <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
        <path d="M18 3v4h-4M6 21v-4h4" />
      </>,
    ),
  },
  {
    title: 'Hosting en infraestructura propia',
    text: 'Alojamos tus soluciones en nuestros propios servidores, con monitoreo, respaldos y seguridad.',
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="7" rx="2" />
        <rect x="3" y="13" width="18" height="7" rx="2" />
        <path d="M7 7.5h.01M7 16.5h.01" />
      </>,
    ),
  },
  {
    title: 'Integraciones y APIs',
    text: 'Conectamos tus sistemas con pasarelas de pago, facturación electrónica y servicios de terceros.',
    icon: icon(
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M8.5 6H14a4 4 0 0 1 4 4v5.5M15.5 18H10a4 4 0 0 1-4-4V8.5" />
      </>,
    ),
  },
  {
    title: 'Soporte y mantenimiento',
    text: 'Acompañamiento cercano después del lanzamiento: actualizaciones, mejoras y atención directa.',
    icon: icon(
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" />,
    ),
  },
]

const STEPS = [
  { title: 'Diseño', text: 'Entendemos tu negocio y definimos juntos la solución ideal.' },
  { title: 'Programación', text: 'Desarrollamos con buenas prácticas, avances visibles y calidad.' },
  { title: 'Hosting', text: 'Publicamos en nuestra infraestructura propia, segura y confiable.' },
  { title: 'Soporte', text: 'Seguimos a tu lado para que tu solución crezca contigo.' },
]

const VALUES = ['Calidad', 'Seguridad', 'Atención cercana', 'Un solo proveedor']

function Logo({ className }: { className: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span className="wordmark">DAEBYTE</span>
  }

  return (
    <img
      src={LOGO_SRC}
      alt="DaeByte"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

// Si el logo no existe o no carga, se muestra el nombre del cliente
function ClientLogo({ name, logo }: { name: string; logo?: string }) {
  const [failed, setFailed] = useState(false)

  if (!logo || failed) {
    return <span>{name}</span>
  }

  return <img src={logo} alt={name} onError={() => setFailed(true)} />
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

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="wa-icon" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="line-icon" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="line-icon" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </svg>
)

function App() {
  return (
    <div className="page">
      <header className="nav">
        <a href="#inicio" className="nav-brand" aria-label="DaeByte, inicio">
          <img src="/logo-mark.png" alt="" />
          <span>DAEBYTE</span>
        </a>
        <nav className="nav-links">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-primary btn-sm" href="#contacto">
          Contáctanos
        </a>
      </header>

      <section id="inicio" className="hero">
        <div className="backdrop" aria-hidden="true">
          <div className="grid" />
          <div className="glow glow-a" />
          <div className="glow glow-b" />
          <Circuit className="circuit-tl" />
          <Circuit className="circuit-br" />
        </div>

        <div className="hero-inner">
          <Logo className="hero-logo" />

          <span className="badge">
            <span className="pulse" />
            Desarrollo de software · Costa Rica
          </span>

          <h1>
            Más que bytes,
            <br />
            <span className="accent">soluciones.</span>
          </h1>

          <p className="lead">
            Diseñamos, programamos y alojamos el software que tu empresa
            necesita. Un solo equipo, desde la primera idea hasta el soporte
            diario, en nuestra propia infraestructura.
          </p>

          <div className="actions">
            <a className="btn btn-primary" href="#contacto">
              Cotiza tu proyecto
              <Arrow />
            </a>
            <a className="btn btn-ghost" href="#servicios">
              Ver servicios
            </a>
          </div>

          <ul className="chips">
            {VALUES.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="servicios" className="section">
        <div className="section-head">
          <span className="eyebrow">Servicios</span>
          <h2>Soluciones digitales para hacer crecer tu negocio</h2>
          <p>
            Principalmente web, siempre a la medida. Construimos herramientas
            que resuelven problemas reales.
          </p>
        </div>

        <div className="cards">
          {SERVICES.map((s) => (
            <article key={s.title} className="card">
              <div className="card-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="proceso" className="section section-alt">
        <div className="section-head">
          <span className="eyebrow">Servicio integral</span>
          <h2>Todo en un solo lugar, sin depender de múltiples proveedores</h2>
          <p>
            Nos encargamos de cada etapa para que tú te enfoques en tu
            negocio.
          </p>
        </div>

        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-node">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="clientes" className="section">
        <div className="section-head">
          <span className="eyebrow">Clientes</span>
          <h2>Empresas que confían en nosotros</h2>
          <p>
            Acompañamos a empresas y emprendedores a fortalecer su presencia
            digital.
          </p>
        </div>

        <ul className="clients">
          {CLIENTS.map((c) => (
            <li key={c.name} className="client">
              <ClientLogo {...c} />
            </li>
          ))}
        </ul>
      </section>

      <section id="nosotros" className="section section-alt">
        <div className="section-head">
          <span className="eyebrow">Nosotros</span>
          <h2>Lo que nos mueve</h2>
        </div>

        <div className="mv">
          <article className="mv-card">
            <span className="mv-label">Misión</span>
            <p>
              Desarrollar soluciones de software, principalmente web, a la
              medida de cada cliente y alojarlas en nuestra propia
              infraestructura de servidores. Ofrecemos un servicio integral,
              desde el diseño y la programación hasta el hosting y el soporte,
              con calidad, seguridad y atención cercana, para que las empresas
              y emprendedores fortalezcan su presencia digital sin depender de
              múltiples proveedores.
            </p>
          </article>
          <article className="mv-card mv-card-dark">
            <span className="mv-label">Visión</span>
            <p>
              Ser una empresa referente en desarrollo web y servicios de
              hosting en Costa Rica y la región, reconocida por la
              confiabilidad de su infraestructura propia, la calidad de sus
              soluciones y su compromiso con el crecimiento tecnológico de sus
              clientes.
            </p>
          </article>
        </div>
      </section>

      <section id="contacto" className="section">
        <div className="cta">
          <Circuit className="circuit-cta" />
          <h2>¿Tienes un proyecto en mente?</h2>
          <p>
            Cuéntanos qué necesitas y te ayudamos a convertirlo en una
            solución.
          </p>

          <div className="contact-grid">
            <a
              className="contact-card contact-wa"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-icon">
                <WhatsAppIcon />
              </span>
              <span className="contact-text">
                <small>WhatsApp</small>
                <strong>{WHATSAPP_DISPLAY}</strong>
              </span>
            </a>
            <a className="contact-card" href={`mailto:${CONTACT_EMAIL}`}>
              <span className="contact-icon">
                <MailIcon />
              </span>
              <span className="contact-text">
                <small>Correo</small>
                <strong>{CONTACT_EMAIL}</strong>
              </span>
            </a>
            <a
              className="contact-card contact-ig"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-icon">
                <InstagramIcon />
              </span>
              <span className="contact-text">
                <small>Instagram</small>
                <strong>@{INSTAGRAM_USER}</strong>
              </span>
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span className="footer-brand">
          <img src="/logo-mark.png" alt="" />
          © {new Date().getFullYear()} DaeByte. Todos los derechos reservados.
        </span>
        <div className="footer-social">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <WhatsAppIcon />
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Correo">
            <MailIcon />
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <InstagramIcon />
          </a>
        </div>
        <span className="footer-slogan">Más que bytes, soluciones.</span>
      </footer>

      <a
        className="wa-float"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
      >
        <WhatsAppIcon />
        <span className="wa-float-label">¿Hablamos?</span>
      </a>
    </div>
  )
}

export default App
