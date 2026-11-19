import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Temporada } from './config.ts'
import './temporada.css'

const BULBS = 48
const INDEPENDENCIA_CR = 1821

function saludo(tipo: Temporada, year: number): { titulo: string; texto: string } {
  switch (tipo) {
    case 'patria':
      return {
        titulo: '¡Viva Costa Rica!',
        texto: `En este Mes de la Patria celebramos ${year - INDEPENDENCIA_CR} años de independencia. ¡Pura vida!`,
      }
    case 'halloween':
      return {
        titulo: '¡Feliz Halloween!',
        texto: 'Sin trucos, solo soluciones: tu proyecto siempre en buenas manos.',
      }
    case 'navidad':
      return {
        titulo: '¡Felices fiestas!',
        texto: `Gracias por confiar en nosotros este año. El equipo de DaeByte te desea una feliz Navidad y un próspero ${year + 1}.`,
      }
    case 'anoNuevo':
      return {
        titulo: `¡Feliz ${year}!`,
        texto: 'Gracias por acompañarnos. Este año seguimos construyendo soluciones contigo.',
      }
  }
}

const ICONOS: Record<Temporada, ReactNode> = {
  patria: (
    <svg className="season-icon" viewBox="0 0 40 48" aria-hidden="true">
      <rect x="3" y="4" width="2.4" height="40" rx="1.2" className="pole" />
      <g className="flag">
        <rect x="5.4" y="6" width="31" height="4" fill="#002b7f" />
        <rect x="5.4" y="10" width="31" height="4" fill="#fff" />
        <rect x="5.4" y="14" width="31" height="8" fill="#ce1126" />
        <rect x="5.4" y="22" width="31" height="4" fill="#fff" />
        <rect x="5.4" y="26" width="31" height="4" fill="#002b7f" />
        <rect x="5.4" y="6" width="31" height="24" fill="none" stroke="#d6dbe6" strokeWidth="0.8" />
      </g>
    </svg>
  ),
  halloween: (
    <svg className="season-icon" viewBox="0 0 40 48" aria-hidden="true">
      <path className="stem" d="M19 12c0-4 2-7 5-8" />
      <ellipse cx="20" cy="28" rx="17" ry="14" className="pumpkin" />
      <path className="ribs" d="M20 14v28M12 16c-3 6-3 18 0 24M28 16c3 6 3 18 0 24" />
      <path className="face" d="M12 24l4-3 2 4zM28 24l-4-3-2 4zM12 32c4 4 12 4 16 0l-3 1-2-2-2 2-2-2-2 2-2-2z" />
    </svg>
  ),
  navidad: (
    <svg className="season-icon" viewBox="0 0 40 48" aria-hidden="true">
      <path className="tree" d="M20 2l7 10h-4l8 11h-5l9 12H5l9-12H9l8-11h-4z" />
      <rect className="trunk" x="17" y="35" width="6" height="8" rx="1" />
      <circle cx="20" cy="3" r="2.6" className="star" />
      <circle cx="15" cy="20" r="1.6" className="ball b1" />
      <circle cx="25" cy="27" r="1.6" className="ball b2" />
      <circle cx="13" cy="31" r="1.6" className="ball b3" />
    </svg>
  ),
  anoNuevo: (
    <svg className="season-icon" viewBox="0 0 40 48" aria-hidden="true">
      <path className="ray" d="M20 4v8M20 32v8M4 22h8M28 22h8M9 11l5 5M26 28l5 5M31 11l-5 5M14 28l-5 5" />
      <circle cx="20" cy="22" r="5" className="star" />
      <circle cx="7" cy="40" r="1.8" className="ball b1" />
      <circle cx="34" cy="6" r="1.8" className="ball b2" />
      <circle cx="35" cy="42" r="1.6" className="ball b3" />
    </svg>
  ),
}

// ---- Efectos animados (canvas). Cada uno devuelve una función que dibuja un cuadro. ----

type Efecto = (ctx: CanvasRenderingContext2D, dt: number) => void

function nieve(W: number, H: number, mobile: boolean): Efecto {
  const copos = Array.from({ length: mobile ? 40 : 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1.2 + Math.random() * 2.8,
    speed: 18 + Math.random() * 40,
    sway: Math.random() * Math.PI * 2,
  }))
  return (ctx, dt) => {
    for (const f of copos) {
      f.y += f.speed * dt
      f.sway += dt * 0.8
      f.x += Math.sin(f.sway) * 12 * dt
      if (f.y > H + 6) {
        f.y = -6
        f.x = Math.random() * W
      }
      // centro blanco con borde lavanda: se ve en fondo claro y oscuro
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r)
      g.addColorStop(0, 'rgba(255,255,255,0.95)')
      g.addColorStop(1, 'rgba(150,160,215,0.35)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function fuegos(W: number, H: number, mobile: boolean): Efecto {
  const paleta = ['#f4c430', '#ffe08a', '#9d8df1', '#7b74c9', '#e05297', '#ffffff']
  const chispas: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = []
  let proximo = 0.6
  const estallar = () => {
    const x = W * (0.12 + Math.random() * 0.76)
    const y = H * (0.14 + Math.random() * 0.34)
    const color = paleta[Math.floor(Math.random() * paleta.length)]
    const n = mobile ? 26 : 40
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + Math.random() * 0.2
      const vel = 70 + Math.random() * 90
      chispas.push({
        x,
        y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
        life: 1,
        color: Math.random() < 0.25 ? '#ffffff' : color,
      })
    }
  }
  return (ctx, dt) => {
    proximo -= dt
    if (proximo <= 0) {
      estallar()
      proximo = 1.1 + Math.random() * 1.4
    }
    ctx.lineCap = 'round'
    ctx.lineWidth = 2.2
    for (let i = chispas.length - 1; i >= 0; i--) {
      const c = chispas[i]
      c.vx *= 1 - 1.1 * dt
      c.vy = c.vy * (1 - 1.1 * dt) + 70 * dt // gravedad
      c.x += c.vx * dt
      c.y += c.vy * dt
      c.life -= dt / 1.5
      if (c.life <= 0) {
        chispas.splice(i, 1)
        continue
      }
      ctx.globalAlpha = c.life
      ctx.strokeStyle = c.color
      ctx.beginPath()
      ctx.moveTo(c.x - c.vx * 0.06, c.y - c.vy * 0.06)
      ctx.lineTo(c.x, c.y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
}

function murcielagos(W: number, H: number, mobile: boolean): Efecto {
  const crear = (desdeFuera: boolean) => {
    const dir = Math.random() < 0.5 ? 1 : -1
    return {
      x: desdeFuera ? (dir > 0 ? -40 : W + 40) : Math.random() * W,
      baseY: H * (0.12 + Math.random() * 0.6),
      dir,
      speed: 60 + Math.random() * 70,
      size: 16 + Math.random() * 14,
      fase: Math.random() * Math.PI * 2,
      t: 0,
    }
  }
  const bats = Array.from({ length: mobile ? 5 : 9 }, () => crear(false))
  return (ctx, dt) => {
    for (let i = 0; i < bats.length; i++) {
      const b = bats[i]
      b.t += dt
      b.x += b.dir * b.speed * dt
      if (b.x < -60 || b.x > W + 60) {
        bats[i] = crear(true)
        continue
      }
      const y = b.baseY + Math.sin(b.t * 1.6 + b.fase) * 26
      const aleteo = Math.sin(b.t * 14 + b.fase) // -1..1
      const s = b.size
      ctx.save()
      ctx.translate(b.x, y)
      ctx.scale(b.dir, 1)
      ctx.fillStyle = 'rgba(32,24,44,0.88)'
      ctx.strokeStyle = 'rgba(255,140,40,0.55)' // borde: visible también en la portada oscura
      ctx.lineWidth = 1
      ctx.beginPath()
      // ala izquierda, cuerpo y ala derecha (las puntas suben y bajan al aletear)
      const tip = -s * 0.55 * aleteo
      ctx.moveTo(0, -s * 0.15)
      ctx.quadraticCurveTo(-s * 0.5, tip - s * 0.2, -s * 1.1, tip)
      ctx.quadraticCurveTo(-s * 0.75, s * 0.05, -s * 0.55, s * 0.2)
      ctx.quadraticCurveTo(-s * 0.35, s * 0.05, -s * 0.18, s * 0.28)
      ctx.lineTo(0, s * 0.35)
      ctx.lineTo(s * 0.18, s * 0.28)
      ctx.quadraticCurveTo(s * 0.35, s * 0.05, s * 0.55, s * 0.2)
      ctx.quadraticCurveTo(s * 0.75, s * 0.05, s * 1.1, tip)
      ctx.quadraticCurveTo(s * 0.5, tip - s * 0.2, 0, -s * 0.15)
      ctx.fill()
      ctx.stroke()
      // orejas
      ctx.beginPath()
      ctx.moveTo(-s * 0.12, -s * 0.12)
      ctx.lineTo(-s * 0.08, -s * 0.34)
      ctx.lineTo(0, -s * 0.16)
      ctx.lineTo(s * 0.08, -s * 0.34)
      ctx.lineTo(s * 0.12, -s * 0.12)
      ctx.fill()
      ctx.restore()
    }
  }
}

function confeti(W: number, H: number, mobile: boolean): Efecto {
  // colores de la bandera de Costa Rica
  const colores = ['#002b7f', '#ce1126', '#ffffff', '#002b7f', '#ce1126']
  const piezas = Array.from({ length: mobile ? 32 : 64 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    w: 5 + Math.random() * 4,
    h: 8 + Math.random() * 6,
    speed: 35 + Math.random() * 55,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 6,
    flip: Math.random() * Math.PI * 2,
    sway: Math.random() * Math.PI * 2,
    color: colores[Math.floor(Math.random() * colores.length)],
  }))
  return (ctx, dt) => {
    for (const p of piezas) {
      p.y += p.speed * dt
      p.sway += dt
      p.x += Math.sin(p.sway) * 20 * dt
      p.rot += p.spin * dt
      p.flip += dt * 5
      if (p.y > H + 12) {
        p.y = -12
        p.x = Math.random() * W
      }
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.cos(p.flip)) // gira en 3D
      ctx.globalAlpha = 0.85
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      if (p.color === '#ffffff') {
        ctx.strokeStyle = '#c3cad8' // borde para que el blanco se vea en fondo claro
        ctx.lineWidth = 1
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }
    ctx.globalAlpha = 1
  }
}

const EFECTOS: Record<Temporada, (W: number, H: number, mobile: boolean) => Efecto> = {
  patria: confeti,
  halloween: murcielagos,
  navidad: nieve,
  anoNuevo: fuegos,
}

// Decoración de temporada: efecto animado, guirnalda bajo el menú,
// adorno en el logo y tarjeta de saludo.
export default function Decoracion({ tipo }: { tipo: Temporada }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)
  const year = new Date().getFullYear()
  const cerradoKey = `daebyte-saludo-${tipo}-${year}`

  useEffect(() => {
    const html = document.documentElement
    const clase = `temporada-${tipo}`
    html.classList.add(clase)

    // alto del menú, para colgar la guirnalda justo debajo
    const nav = document.querySelector<HTMLElement>('.nav')
    const setNavH = () => html.style.setProperty('--nav-h', `${nav?.offsetHeight ?? 64}px`)
    setNavH()
    window.addEventListener('resize', setNavH)

    // el saludo aparece cuando la persona ya pasó la película de la portada,
    // para no tapar "Desliza para descubrir" ni la primera impresión
    let cerrado = false
    try {
      cerrado = localStorage.getItem(cerradoKey) === '1'
    } catch {
      // sin acceso al almacenamiento: se muestra igual
    }
    const onScrollSaludo = () => {
      if (window.scrollY > window.innerHeight * 3) {
        setVisible(true)
        window.removeEventListener('scroll', onScrollSaludo)
      }
    }
    if (!cerrado) window.addEventListener('scroll', onScrollSaludo, { passive: true })

    // Efecto animado (no se dibuja con "reducir movimiento")
    const canvas = canvasRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let onResize = () => {}
    if (canvas && !reduce) {
      const ctx = canvas.getContext('2d')!
      let W = 0
      let H = 0
      onResize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        W = window.innerWidth
        H = window.innerHeight
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      onResize()
      window.addEventListener('resize', onResize)
      const dibujar = EFECTOS[tipo](W, H, W < 700)

      let last = performance.now()
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        ctx.clearRect(0, 0, W, H)
        dibujar(ctx, dt)
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    return () => {
      html.classList.remove(clase)
      html.style.removeProperty('--nav-h')
      window.removeEventListener('resize', setNavH)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScrollSaludo)
      cancelAnimationFrame(raf)
    }
  }, [tipo, cerradoKey])

  const cerrar = () => {
    setVisible(false)
    try {
      localStorage.setItem(cerradoKey, '1')
    } catch {
      // sin acceso al almacenamiento: solo se cierra por esta visita
    }
  }

  const { titulo, texto } = saludo(tipo, year)

  return (
    <>
      <canvas ref={canvasRef} className="season-fx" aria-hidden="true" />

      <div className={`season-lights is-${tipo}`} aria-hidden="true">
        {Array.from({ length: BULBS }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      {visible && (
        <aside className={`season-card is-${tipo}`} role="status">
          <button type="button" className="season-close" onClick={cerrar} aria-label="Cerrar saludo">
            ×
          </button>
          {ICONOS[tipo]}
          <div>
            <strong>{titulo}</strong>
            <p>{texto}</p>
          </div>
        </aside>
      )}
    </>
  )
}
