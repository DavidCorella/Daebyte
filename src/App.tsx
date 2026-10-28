import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import CinematicHero from './CinematicHero.tsx'
import ScrollStory from './ScrollStory.tsx'
import './App.css'

const CONTACT_EMAIL = 'contacto@daebyte.com'
const WHATSAPP_DISPLAY = '6096-0986'
const waLink = (message: string) =>
  `https://wa.me/50660960986?text=${encodeURIComponent(message)}`
const WHATSAPP_URL = waLink('Hola DaeByte, me gustaría información sobre sus servicios.')
const INSTAGRAM_USER = '_daebyte'
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USER}/`
const LOGO_SRC = '/logo.png'

const NAV = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#planes', label: 'Planes' },
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


const VALUES = ['Calidad', 'Seguridad', 'Atención cercana', 'Un solo proveedor']

// También se publican como datos estructurados FAQPage para Google
const FAQS = [
  {
    q: '¿Cuánto tarda en estar lista mi página?',
    a: 'Una página básica está lista en 1 a 3 días hábiles desde que recibimos el adelanto y el material. Una página corporativa toma de 1 a 3 semanas, según la cantidad de secciones. Las aplicaciones a medida se planifican por etapas y el plazo se define en la cotización.',
  },
  {
    q: '¿Qué necesito para empezar?',
    a: 'Tu logo, los textos principales (quiénes son, qué ofrecen y cómo contactarlos) y algunas fotos de tu negocio o productos. Si no tienes textos o fotos, te ayudamos: redactamos los textos contigo a partir de una conversación y usamos imágenes profesionales libres de derechos. Si aún no tienes correos con tu dominio, también te ayudamos a configurarlos.',
  },
  {
    q: '¿Puedo pedir cambios?',
    a: 'Sí. Durante el desarrollo te mostramos los avances y hacemos los ajustes que necesites hasta la entrega final. Una vez entregada la página, el precio incluye 2 cambios adicionales y, mientras tengas activo tu plan de hosting, cuentas con 2 cambios incluidos cada mes sobre el contenido existente.',
  },
  {
    q: '¿Cómo se realiza el pago?',
    a: 'Para iniciar tu proyecto solo necesitas un adelanto del 15%. El 85% restante se paga al momento de la entrega.',
  },
  {
    q: '¿Qué formas de pago aceptan?',
    a: 'Aceptamos SINPE Móvil y transferencia bancaria. Puedes pagar en dólares o en colones, al tipo de cambio de referencia del Banco Central de Costa Rica (BCCR) del día de cada pago. Antes de empezar te enviamos una cotización formal con el plan y las condiciones acordadas.',
  },
  {
    q: '¿Emiten factura electrónica?',
    a: 'Sí, emitimos factura electrónica por todos nuestros servicios. Los precios publicados son más IVA (13%).',
  },
  {
    q: '¿El dominio está incluido?',
    a: 'El dominio no está incluido en el precio; su costo ronda los $10 al año. Se registra a tu nombre, así que siempre es tuyo: nosotros solo lo administramos por ti.',
  },
  {
    q: '¿Qué incluye el plan de hosting?',
    a: 'Alojamiento en nuestra propia infraestructura, mantenimiento de seguridad, actualizaciones, respaldos y 2 cambios al mes sobre el contenido existente de tu proyecto, sin importar su tamaño. Las funciones nuevas se evalúan según su alcance: pueden quedar incluidas en el plan o cotizarse aparte. Además, respondemos tus solicitudes de soporte en un máximo de 2 horas en horario hábil.',
  },
  {
    q: '¿Es obligatorio contratar el hosting?',
    a: 'No. Si lo prefieres, te entregamos tu página para que la publiques donde quieras. Si necesitas que la configuremos en otro proveedor, ese servicio se cotiza aparte.',
  },
  {
    q: '¿Puedo cancelar el hosting?',
    a: 'Sí, cuando quieras y sin permanencia mínima. Si cancelas o dejas de pagar el servicio, te entregamos tu proyecto completo, los respaldos y tus datos. Nunca quedas atado a nosotros.',
  },
]

// Precios en dólares (USD), sin IVA. `build: null` = a cotizar
const PLANS: {
  name: string
  tagline: string
  build: string | null
  hosting: string
  features: string[]
  art: 'landing' | 'corporate' | 'app'
  featured?: boolean
}[] = [
  {
    name: 'Página básica',
    tagline: 'Landing page o sitio sencillo para darte a conocer.',
    build: '$120',
    hosting: '$30',
    features: [
      'Diseño a medida con tu marca',
      'Adaptada a celulares',
      'Botón de WhatsApp y redes sociales',
      'Configuración básica para Google',
      'Certificado de seguridad (https)',
    ],
    art: 'landing',
  },
  {
    name: 'Página corporativa',
    tagline: 'Sitio completo para presentar tu empresa con profesionalismo.',
    build: null,
    hosting: '$60',
    features: [
      'Varias páginas y secciones',
      'Catálogo de productos o servicios',
      'Formularios de contacto',
      'Optimización para Google',
      'Correos con tu dominio',
    ],
    art: 'corporate',
    featured: true,
  },
  {
    name: 'Aplicación a medida',
    tagline: 'Sistemas web y páginas complejas para operar tu negocio.',
    build: null,
    hosting: '$60',
    features: [
      'Usuarios, roles y panel administrativo',
      'Bases de datos e inventarios',
      'Pagos e integraciones con otros sistemas',
      'Automatización de procesos',
      'Reportes a la medida',
    ],
    art: 'app',
  },
]

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

// Trazas de circuito decorativas, inspiradas en los nodos del logo.
// Las que tienen `dur` llevan un pulso de luz que las recorre como datos.
const CIRCUIT_TRACES = [
  { d: 'M0 60h120a20 20 0 0 1 20 20v80', dur: '4.5s', begin: '2.2s' },
  { d: 'M0 120h60a20 20 0 0 1 20 20v120', dur: '5.5s', begin: '3.4s' },
  { d: 'M0 200h20' },
  { d: 'M200 0v40a20 20 0 0 0 20 20h100', dur: '4s', begin: '2.8s' },
]

function Circuit({ className }: { className: string }) {
  return (
    <svg className={`circuit ${className}`} viewBox="0 0 320 320" aria-hidden="true">
      {CIRCUIT_TRACES.map((t) => (
        <path key={t.d} d={t.d} />
      ))}
      <circle className="node" cx="140" cy="168" r="8" />
      <circle className="node" cx="80" cy="268" r="8" />
      <circle className="node" cx="28" cy="200" r="8" />
      <circle className="node" cx="320" cy="60" r="8" />
      {CIRCUIT_TRACES.filter((t) => t.dur).map((t) => (
        <circle key={`pulso-${t.d}`} className="pulse-dot" r="5" opacity="0">
          <animateMotion path={t.d} dur={t.dur} begin={t.begin} repeatCount="indefinite" />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.1;0.85;1"
            dur={t.dur}
            begin={t.begin}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}

// Índice para escalonar la animación de aparición
const stagger = (i: number) => ({ '--i': i }) as CSSProperties

// Ilustraciones de cada plan, dibujadas con la paleta de la marca
function PlanArt({ kind }: { kind: 'landing' | 'corporate' | 'app' }) {
  const browser = (x: number, y: number, w: number, h: number) => (
    <>
      <rect x={x} y={y} width={w} height={h} rx="8" className="pa-window" />
      <path d={`M${x} ${y + 16}h${w}`} className="pa-line" />
      <circle cx={x + 10} cy={y + 8} r="2.5" className="pa-dot" />
      <circle cx={x + 18} cy={y + 8} r="2.5" className="pa-dot" />
      <circle cx={x + 26} cy={y + 8} r="2.5" className="pa-dot" />
    </>
  )

  return (
    <svg viewBox="0 0 280 160" className="plan-art" aria-hidden="true">
      {kind === 'landing' && (
        <>
          {browser(50, 14, 180, 132)}
          <rect x="66" y="46" width="84" height="9" rx="4.5" className="pa-strong" />
          <rect x="66" y="62" width="64" height="6" rx="3" className="pa-soft" />
          <rect x="66" y="73" width="72" height="6" rx="3" className="pa-soft" />
          <rect x="66" y="90" width="46" height="14" rx="7" className="pa-accent" />
          <rect x="160" y="42" width="54" height="64" rx="6" className="pa-soft" />
          <circle cx="178" cy="62" r="7" className="pa-light" />
          <path d="m164 100 16-18 12 12 8-7 14 13z" className="pa-light" />
          <rect x="66" y="118" width="148" height="16" rx="4" className="pa-soft" />
        </>
      )}
      {kind === 'corporate' && (
        <>
          <g opacity="0.45">{browser(24, 30, 150, 110)}</g>
          <g opacity="0.7">{browser(62, 22, 150, 114)}</g>
          {browser(100, 14, 156, 130)}
          <rect x="114" y="40" width="128" height="34" rx="5" className="pa-accent" />
          <rect x="124" y="50" width="60" height="7" rx="3.5" className="pa-white" />
          <rect x="124" y="61" width="40" height="5" rx="2.5" className="pa-white-soft" />
          <rect x="114" y="82" width="38" height="30" rx="5" className="pa-soft" />
          <rect x="159" y="82" width="38" height="30" rx="5" className="pa-soft" />
          <rect x="204" y="82" width="38" height="30" rx="5" className="pa-soft" />
          <rect x="114" y="120" width="70" height="6" rx="3" className="pa-soft" />
        </>
      )}
      {kind === 'app' && (
        <>
          {browser(30, 14, 220, 132)}
          <rect x="30" y="30" width="46" height="116" className="pa-strong" />
          <rect x="40" y="42" width="26" height="5" rx="2.5" className="pa-white" />
          <rect x="40" y="56" width="22" height="4" rx="2" className="pa-white-soft" />
          <rect x="40" y="67" width="24" height="4" rx="2" className="pa-white-soft" />
          <rect x="40" y="78" width="18" height="4" rx="2" className="pa-white-soft" />
          <rect x="88" y="40" width="46" height="24" rx="5" className="pa-soft" />
          <rect x="140" y="40" width="46" height="24" rx="5" className="pa-soft" />
          <rect x="192" y="40" width="46" height="24" rx="5" className="pa-accent" />
          <rect x="88" y="72" width="150" height="62" rx="5" className="pa-soft" />
          <rect x="100" y="110" width="12" height="16" rx="2" className="pa-light" />
          <rect x="120" y="98" width="12" height="28" rx="2" className="pa-light" />
          <rect x="140" y="104" width="12" height="22" rx="2" className="pa-light" />
          <rect x="160" y="88" width="12" height="38" rx="2" className="pa-accent" />
          <rect x="180" y="94" width="12" height="32" rx="2" className="pa-light" />
          <rect x="200" y="82" width="12" height="44" rx="2" className="pa-accent" />
          <circle cx="226" cy="84" r="3" className="pa-accent" />
        </>
      )}
    </svg>
  )
}

const Check = () => (
  <svg viewBox="0 0 24 24" className="check" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

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

// Preguntas visibles antes de pulsar "Ver más"; el resto sigue en el HTML para Google
const FAQ_VISIBLE = 5

function App() {
  const [showAllFaqs, setShowAllFaqs] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Al mostrar u ocultar preguntas cambia la altura de la página:
  // la escena fija de "Cómo trabajamos" debe recalcular dónde empieza
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [showAllFaqs])

  useEffect(() => {
    // Aparición al hacer scroll
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

    // Luz que sigue al puntero en las tarjetas
    const onPointerMove = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return
      const el = e.target.closest<HTMLElement>('.spot')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }

    // Sombra en el menú al bajar
    const onScroll = () => navRef.current?.classList.toggle('is-scrolled', window.scrollY > 8)

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // Scroll suavizado, sincronizado con las animaciones de GSAP
    let lenis: Lenis | undefined
    const tick = (time: number) => lenis?.raf(time * 1000)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lenis = new Lenis({ anchors: { offset: -64 } })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    return () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      io.disconnect()
      document.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="page">
      <header className="nav" ref={navRef}>
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

      <CinematicHero>
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
      </CinematicHero>

      <section id="servicios" className="section">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Servicios</span>
          <h2>Soluciones digitales para hacer crecer tu negocio</h2>
          <p>
            Principalmente web, siempre a la medida. Construimos herramientas
            que resuelven problemas reales.
          </p>
        </div>

        <div className="cards">
          {SERVICES.map((s, i) => (
            <article key={s.title} className="card spot" data-reveal style={stagger(i % 3)}>
              <div className="card-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="planes" className="section">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Planes</span>
          <h2>Precios claros, sin sorpresas</h2>
          <p>
            Desarrollo, hosting, mantenimiento y soporte con un solo
            proveedor. Elige el plan que se ajusta a tu negocio.
          </p>
        </div>

        <div className="plans">
          {PLANS.map((p, i) => (
            <article
              key={p.name}
              className={`plan spot${p.featured ? ' plan-featured' : ''}`}
              data-reveal
              style={stagger(i)}
            >
              {p.featured && <span className="plan-badge">Recomendado</span>}
              <PlanArt kind={p.art} />

              <div className="plan-body">
                <h3>{p.name}</h3>
                <p className="plan-tagline">{p.tagline}</p>

                <div className="plan-prices">
                  <div className="plan-price">
                    <small>Desarrollo · pago único</small>
                    {p.build ? (
                      <strong>
                        {p.build} <span>+ IVA</span>
                      </strong>
                    ) : (
                      <strong className="plan-quote">A cotizar</strong>
                    )}
                  </div>
                  <div className="plan-price">
                    <small>Hosting, mantenimiento y soporte</small>
                    <strong>
                      {p.hosting}
                      <span>/mes + IVA</span>
                    </strong>
                  </div>
                </div>

                <ul className="plan-features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} plan-cta`}
                  href={waLink(`Hola DaeByte, me interesa el plan "${p.name}". ¿Me pueden dar más información?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.build ? 'Quiero este plan' : 'Solicitar cotización'}
                  <Arrow />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="plans-note" data-reveal>
          <div>
            <strong>Empieza con solo 15% de adelanto</strong>
            <span>El resto se paga al entregar el proyecto.</span>
          </div>
          <div>
            <strong>Hosting con todo incluido</strong>
            <span>Mantenimiento, respaldos, 2 cambios al mes y respuesta en máximo 2 horas hábiles.</span>
          </div>
          <div>
            <strong>Precios en dólares (USD)</strong>
            <span>Más IVA (13%). Pago en dólares o colones, con factura electrónica.</span>
          </div>
        </div>
      </section>

      <section id="preguntas" className="section">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Resolvemos tus dudas</h2>
        </div>

        <div className={`faq${showAllFaqs ? '' : ' faq-collapsed'}`} id="faq-list">
          {FAQS.map((f, i) => (
            // name="faq" mantiene abierta una sola respuesta a la vez
            <details
              key={f.q}
              name="faq"
              className={`faq-item${i >= FAQ_VISIBLE ? ' faq-extra' : ''}`}
              data-reveal
              style={stagger(i % FAQ_VISIBLE)}
            >
              <summary>
                {f.q}
                <span className="faq-toggle" aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        {FAQS.length > FAQ_VISIBLE && (
          <div className="faq-expand">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              aria-expanded={showAllFaqs}
              aria-controls="faq-list"
              onClick={() => setShowAllFaqs((v) => !v)}
            >
              {showAllFaqs
                ? 'Ver menos preguntas'
                : `Ver más preguntas (${FAQS.length - FAQ_VISIBLE})`}
            </button>
          </div>
        )}

        <p className="faq-more">
          ¿Tienes otra pregunta?{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Escríbenos por WhatsApp
          </a>
        </p>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
      </section>

      <ScrollStory />

      <section id="clientes" className="section">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Clientes</span>
          <h2>Empresas que confían en nosotros</h2>
          <p>
            Acompañamos a empresas y emprendedores a fortalecer su presencia
            digital.
          </p>
        </div>

        <ul className="clients">
          {CLIENTS.map((c) => (
            <li key={c.name} className="client spot" data-reveal>
              <ClientLogo {...c} />
            </li>
          ))}
        </ul>
      </section>

      <section id="nosotros" className="section section-alt">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Nosotros</span>
          <h2>Lo que nos mueve</h2>
        </div>

        <div className="mv">
          <article className="mv-card" data-reveal>
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
          <article className="mv-card mv-card-dark" data-reveal style={stagger(1)}>
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
        <div className="cta" data-reveal>
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
