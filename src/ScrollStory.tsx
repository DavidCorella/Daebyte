import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './ScrollStory.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STEPS = [
  { title: 'Diseño', text: 'Entendemos tu negocio y definimos juntos la solución ideal.' },
  { title: 'Programación', text: 'Desarrollamos con buenas prácticas, avances visibles y calidad.' },
  { title: 'Hosting', text: 'Publicamos en nuestra infraestructura propia, segura y confiable.' },
  { title: 'Soporte', text: 'Seguimos a tu lado para que tu solución crezca contigo.' },
]

const TOASTS = [
  'Respaldo diario completado',
  'Cambio aplicado: nuevo menú',
  'Actualización de seguridad instalada',
]

// Bloque del boceto: contorno punteado (diseño) + relleno de color (programado)
const Block = ({ className }: { className: string }) => (
  <div className={`blk ${className}`}>
    <span className="wf" />
    <span className="fill" />
  </div>
)

// Escena fija que avanza con el scroll: diseño → programación → hosting → soporte.
// El CSS muestra la escena terminada; GSAP la "rebobina" y la reproduce al bajar,
// así sin JavaScript o con "reducir movimiento" se ve completa y quieta.
export default function ScrollStory() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: '(max-width: 900px)',
          motionOk: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const { isMobile, motionOk } = ctx.conditions as { isMobile: boolean; motionOk: boolean }
          if (!motionOk || !root.current) return

          const el = root.current
          const q = gsap.utils.selector(el)
          const steps = q('.story-step')
          const dim = isMobile ? 0 : 0.28

          el.classList.add('is-animated')

          gsap.set(steps, { autoAlpha: (i: number) => (i === 0 ? 1 : dim) })
          gsap.set(q('.wf'), { scale: 0, transformOrigin: 'left top' })
          gsap.set(q('.fill'), { autoAlpha: 0 })
          gsap.set(q('.code'), { autoAlpha: 0, x: 40 })
          gsap.set(q('.code-line'), { clipPath: 'inset(0 100% 0 0)' })
          gsap.set(q('.url-draft'), { autoAlpha: 1 })
          gsap.set(q('.url-live'), { autoAlpha: 0 })
          gsap.set(q('.server'), { autoAlpha: 0, y: 40 })
          gsap.set(q('.link-trace'), { strokeDashoffset: 1 })
          gsap.set(q('.link-pulse'), { autoAlpha: 0 })
          gsap.set(q('.toast'), { autoAlpha: 0, y: 16, scale: 0.96 })
          gsap.set(q('.story-bar span'), { scaleX: 0 })

          const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: () => `+=${window.innerHeight * 3}`,
              scrub: 0.8,
              pin: true,
              // el padre (.page) es flex y GSAP desactiva el espacio de reserva por defecto
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })

          const activate = (n: number) =>
            tl.to(steps, { autoAlpha: (i: number) => (i === n ? 1 : dim), duration: 0.3 })

          // 1. Diseño: se dibuja el boceto
          tl.to(q('.wf'), { scale: 1, stagger: 0.08, duration: 0.5 })

          // 2. Programación: entra el código y el boceto toma color
          activate(1)
          tl.to(q('.code'), { autoAlpha: 1, x: 0, duration: 0.4 })
          tl.to(q('.code-line'), { clipPath: 'inset(0 0% 0 0)', stagger: 0.12, duration: 0.3, ease: 'none' })
          tl.to(q('.fill'), { autoAlpha: 1, stagger: 0.05, duration: 0.3 }, '<0.2')
          tl.to(q('.code'), { autoAlpha: 0, x: 40, duration: 0.35 }, '+=0.25')

          // 3. Hosting: aparece el servidor y la página queda en línea
          activate(2)
          tl.to(q('.server'), { autoAlpha: 1, y: 0, duration: 0.5 })
          tl.to(q('.link-trace'), { strokeDashoffset: 0, duration: 0.5, ease: 'none' })
          tl.to(q('.link-pulse'), { autoAlpha: 1, duration: 0.2 })
          tl.to(q('.url-draft'), { autoAlpha: 0, duration: 0.15 }, '<')
          tl.to(q('.url-live'), { autoAlpha: 1, duration: 0.25 })

          // 4. Soporte: llegan las notificaciones
          activate(3)
          tl.to(q('.toast'), { autoAlpha: 1, y: 0, scale: 1, stagger: 0.3, duration: 0.35 })
          tl.to({}, { duration: 0.4 })

          tl.to(q('.story-bar span'), { scaleX: 1, ease: 'none', duration: tl.duration() }, 0)

          return () => el.classList.remove('is-animated')
        },
      )
    },
    { scope: root },
  )

  return (
    <section id="proceso" className="story" ref={root}>
      <div className="story-inner">
        <div className="story-text">
          <span className="eyebrow">Cómo trabajamos</span>
          <h2>De la idea a tu negocio en línea</h2>
          <p className="story-lead">
            Todo en un solo lugar, sin depender de múltiples proveedores.
          </p>

          <ol className="story-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="story-step">
                <span className="story-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="story-bar" aria-hidden="true">
            <span />
          </div>
        </div>

        <div className="story-stage" aria-hidden="true">
          <svg className="link" viewBox="0 0 500 400">
            <path className="link-trace" pathLength={1} d="M150 292V352a14 14 0 0 0 14 14H360" />
            <circle className="link-node" cx="150" cy="292" r="6" />
            <circle className="link-pulse" r="5">
              <animateMotion
                path="M150 292V352a14 14 0 0 0 14 14H360"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          <div className="mock">
            <div className="mock-bar">
              <span className="mock-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="mock-url">
                <span className="url-draft">boceto · tu-negocio</span>
                <span className="url-live">
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  tunegocio.com
                  <em>En línea</em>
                </span>
              </span>
            </div>

            <div className="mock-body">
              <div className="m-nav">
                <Block className="b-logo" />
                <div className="m-links">
                  <Block className="b-link" />
                  <Block className="b-link" />
                  <Block className="b-link" />
                </div>
              </div>
              <div className="m-hero">
                <div className="m-copy">
                  <Block className="b-title" />
                  <Block className="b-title b-short" />
                  <Block className="b-line" />
                  <Block className="b-line b-short" />
                  <Block className="b-btn" />
                </div>
                <Block className="b-img" />
              </div>
              <div className="m-cards">
                <Block className="b-card" />
                <Block className="b-card" />
                <Block className="b-card" />
              </div>
            </div>
          </div>

          <div className="code">
            <div className="code-line">
              <b>const</b> sitio = <i>crear</i>({'{'}
            </div>
            <div className="code-line ind">
              marca: <s>'Tu negocio'</s>,
            </div>
            <div className="code-line ind">
              responsive: <b>true</b>,
            </div>
            <div className="code-line ind">
              seo: <b>true</b>,
            </div>
            <div className="code-line ind">
              whatsapp: <b>true</b>,
            </div>
            <div className="code-line">{'})'}</div>
          </div>

          <div className="server">
            {[0, 1, 2].map((u) => (
              <div key={u} className="server-unit">
                <span className="led" style={{ animationDelay: `${u * 0.4}s` }} />
                <span className="led led-2" style={{ animationDelay: `${u * 0.4 + 0.2}s` }} />
                <span className="slots" />
              </div>
            ))}
            <span className="server-label">DaeByte</span>
          </div>

          <div className="toasts">
            {TOASTS.map((t) => (
              <div key={t} className="toast">
                <svg viewBox="0 0 24 24">
                  <path d="m6 12.5 4 4L18 8" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
