import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './CinematicHero.css'

gsap.registerPlugin(ScrollTrigger)

const LOGO_SRC = '/logo.png'

const CAPTIONS = [
  { text: 'Todo empieza con un byte.', from: 0.03, to: 0.24 },
  { text: 'Lo diseñamos, lo programamos, lo conectamos.', from: 0.3, to: 0.52 },
  { text: 'Y lo convertimos en soluciones.', from: 0.58, to: 0.76 },
]

type Pt = { x: number; y: number }
type Path = { pts: Pt[]; lens: number[]; total: number }
type Trace = Path & { delay: number; speed: number; offset: number; resistor: boolean }
type Led = { u: number; v: number; purple: boolean; delay: number }

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n))
// 0 → 1 suavemente entre a y b
const ramp = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const mix = (a: number, b: number, t: number) => a + (b - a) * t

// Aleatorio con semilla: la placa sale igual en cada carga y al cambiar el tamaño
function seeded(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makePath(pts: Pt[]): Path {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y))
  return { pts, lens, total: lens.reduce((a, b) => a + b, 0) }
}

// Punto a una distancia `s` (0..1) del recorrido
function pointAt(path: Path, s: number): Pt {
  let remain = clamp(s) * path.total
  for (let i = 0; i < path.lens.length; i++) {
    if (remain <= path.lens[i]) {
      const t = path.lens[i] ? remain / path.lens[i] : 0
      const a = path.pts[i]
      const b = path.pts[i + 1]
      return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) }
    }
    remain -= path.lens[i]
  }
  return path.pts[path.pts.length - 1]
}

// Muestrea los píxeles del logo: cada punto será un LED de la matriz
function sampleLogo(img: HTMLImageElement, step: number) {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.drawImage(img, 0, 0)
  const { data, width, height } = g.getImageData(0, 0, c.width, c.height)
  const leds: Led[] = []
  const rnd = seeded(7)
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      if (data[i + 3] > 140) {
        // el morado del monograma tiene más rojo que el azul marino del texto
        leds.push({ u: x / width, v: y / height, purple: data[i] > 50, delay: rnd() })
      }
    }
  }
  return { leds, width, height }
}

// Portada cinematográfica: una placa de circuito generada en canvas cuyo avance lo
// controla el scroll. Las pistas se trazan, aparece un chip, por las pistas viajan
// señales, su núcleo se enciende como matriz de LEDs con el logo y la escena se aclara
// hasta convertirse en la portada normal. Sin JavaScript o con "reducir movimiento"
// solo se ve la portada final.
export default function CinematicHero({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const section = root.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')!
    const inner = section.querySelector<HTMLElement>('.hero-inner')!
    const items = Array.from(inner.children) as HTMLElement[]
    const logoEl = section.querySelector<HTMLElement>('.hero-logo')
    const captions = Array.from(section.querySelectorAll<HTMLElement>('.cine-caption'))
    const hint = section.querySelector<HTMLElement>('.cine-hint')
    const nav = document.querySelector<HTMLElement>('.nav')

    section.classList.add('is-animated')

    let W = 0
    let H = 0
    // alto visible: en pantallas bajas la sección es más alta que la ventana
    let V = 0
    let logoRect = { x: 0, y: 0, w: 0, h: 0 }
    let chip = { x: 0, y: 0, w: 0, h: 0 }
    let pins: { x: number; y: number; w: number; h: number }[] = []
    let traces: Trace[] = []
    let decor: (Path & { delay: number })[] = []
    let rain: { x: number; speed: number; chars: string }[] = []
    let hexRows: string[] = []
    let dotPattern: CanvasPattern | null = null
    let leds: Led[] = []
    let logoW = 1
    let step = 5
    let target = 0
    let current = 0
    let drawn = -1
    let disposed = false

    // Construye la placa: chip, pines, pistas hacia los bordes, pistas decorativas
    const buildBoard = () => {
      const rnd = seeded(2511)
      const mobile = W < 700
      const cx = W / 2
      const cy = V * 0.44
      const cw = Math.min(W * (mobile ? 0.66 : 0.4), 470, V * 0.42 * 1.35)
      const ch = cw / 1.35
      chip = { x: cx - cw / 2, y: cy - ch / 2, w: cw, h: ch }

      pins = []
      traces = []
      const pinLen = Math.max(6, cw * 0.035)
      const pinW = Math.max(2, cw * 0.012)
      const sides = [
        { n: mobile ? 8 : 14, nx: 0, ny: -1 },
        { n: mobile ? 8 : 14, nx: 0, ny: 1 },
        { n: mobile ? 6 : 10, nx: -1, ny: 0 },
        { n: mobile ? 6 : 10, nx: 1, ny: 0 },
      ]
      for (const side of sides) {
        const horizontal = side.ny !== 0
        const span = horizontal ? cw : ch
        for (let i = 0; i < side.n; i++) {
          const off = (i + 0.5) / side.n - 0.5 // -0.5..0.5 a lo largo del lado
          const along = off * span * 0.82
          const base = horizontal
            ? { x: cx + along, y: side.ny < 0 ? chip.y : chip.y + ch }
            : { x: side.nx < 0 ? chip.x : chip.x + cw, y: cy + along }
          pins.push(
            horizontal
              ? { x: base.x - pinW / 2, y: side.ny < 0 ? base.y - pinLen : base.y, w: pinW, h: pinLen }
              : { x: side.nx < 0 ? base.x - pinLen : base.x, y: base.y - pinW / 2, w: pinLen, h: pinW },
          )
          // pista: sale del pin, dobla a 45° hacia afuera y sigue recta hasta el borde
          const tip = { x: base.x + side.nx * pinLen, y: base.y + side.ny * pinLen }
          const a = 14 + rnd() * 40
          const p1 = { x: tip.x + side.nx * a, y: tip.y + side.ny * a }
          const lat = Math.sign(off) || 1
          const b = Math.abs(along) * 0.7 + 8 + rnd() * 30
          const p2 = horizontal
            ? { x: p1.x + lat * b, y: p1.y + side.ny * b }
            : { x: p1.x + side.nx * b, y: p1.y + lat * b }
          const reach = Math.max(W, H)
          const edge = { x: p2.x + side.nx * reach, y: p2.y + side.ny * reach }
          traces.push({
            ...makePath([edge, p2, p1, tip]),
            delay: rnd(),
            speed: 1.5 + rnd() * 2.5,
            offset: rnd(),
            resistor: rnd() < 0.3,
          })
        }
      }

      // pistas decorativas en las zonas libres de la placa
      decor = []
      const dirs = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
        [0.7071, 0.7071],
        [-0.7071, 0.7071],
      ]
      for (let i = 0; i < (mobile ? 14 : 30); i++) {
        let x = rnd() * W
        let y = rnd() * H
        if (Math.abs(x - cx) < cw * 0.9 && Math.abs(y - cy) < ch * 0.9) continue
        const pts: Pt[] = [{ x, y }]
        let d = dirs[Math.floor(rnd() * dirs.length)]
        for (let s = 0; s < 3; s++) {
          const len = 30 + rnd() * 110
          x += d[0] * len
          y += d[1] * len
          pts.push({ x, y })
          d = dirs[Math.floor(rnd() * dirs.length)]
        }
        decor.push({ ...makePath(pts), delay: rnd() })
      }

      // lluvia de código binario de fondo
      rain = []
      for (let i = 0; i < (mobile ? 9 : 20); i++) {
        let chars = ''
        for (let k = 0; k < 18; k++) chars += rnd() < 0.5 ? '0' : '1'
        rain.push({ x: rnd() * W, speed: 0.6 + rnd() * 1.2, chars })
      }

      hexRows = []
      for (let r = 0; r < 40; r++) {
        let row = `0x${Math.floor(rnd() * 0xffff)
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')} `
        for (let k = 0; k < 6; k++) {
          row += ` ${Math.floor(rnd() * 256)
            .toString(16)
            .toUpperCase()
            .padStart(2, '0')}`
        }
        hexRows.push(row)
      }

      // retícula de puntos de la placa
      const tile = document.createElement('canvas')
      tile.width = tile.height = 22
      const tg = tile.getContext('2d')!
      tg.fillStyle = 'rgba(123,116,201,0.16)'
      tg.fillRect(10, 10, 1.6, 1.6)
      dotPattern = ctx.createPattern(tile, 'repeat')
    }

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = section.getBoundingClientRect()
      W = r.width
      H = r.height
      V = Math.min(H, window.innerHeight - (nav?.offsetHeight ?? 0))
      section.style.setProperty('--cine-h', `${V}px`)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (logoEl) {
        const l = logoEl.getBoundingClientRect()
        logoRect = { x: l.left - r.left, y: l.top - r.top, w: l.width, h: l.height }
      }
      buildBoard()
      drawn = -1
    }

    // Recorre una pista hasta la fracción t (dibujo progresivo)
    const strokePartial = (path: Path, t: number) => {
      let remain = clamp(t) * path.total
      ctx.beginPath()
      ctx.moveTo(path.pts[0].x, path.pts[0].y)
      for (let i = 0; i < path.lens.length && remain > 0; i++) {
        const a = path.pts[i]
        const b = path.pts[i + 1]
        if (remain >= path.lens[i]) {
          ctx.lineTo(b.x, b.y)
        } else {
          const f = remain / path.lens[i]
          ctx.lineTo(mix(a.x, b.x, f), mix(a.y, b.y, f))
        }
        remain -= path.lens[i]
      }
      ctx.stroke()
    }

    const via = (x: number, y: number, r: number) => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    const draw = (p: number) => {
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const dark = 1 - ramp(p, 0.78, 0.94)
      const cx = W / 2
      const cy = V * 0.44

      if (dark > 0) {
        // Fondo de la placa
        ctx.globalAlpha = dark
        ctx.fillStyle = '#060a14'
        ctx.fillRect(0, 0, W, H)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7)
        g.addColorStop(0, `rgba(79,74,128,${0.35 + ramp(p, 0.45, 0.7) * 0.25})`)
        g.addColorStop(1, 'rgba(6,10,20,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)

        // Lluvia de binario, desplazada por el scroll
        ctx.font = '12px "JetBrains Mono", monospace'
        ctx.fillStyle = 'rgba(123,116,201,0.13)'
        for (const col of rain) {
          const y0 = ((p * H * col.speed * 2) % (H + 260)) - 260
          for (let k = 0; k < col.chars.length; k++) {
            ctx.fillText(col.chars[k], col.x, y0 + k * 15)
          }
        }

        // Cámara: arranca cerca y se aleja para mostrar la placa completa
        const zoom = mix(1.3, 1, easeInOut(clamp(p / 0.36)))
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(zoom, zoom)
        ctx.translate(-cx, -cy)

        if (dotPattern) {
          ctx.fillStyle = dotPattern
          ctx.fillRect(-W, -H, W * 3, H * 3)
        }

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Pistas decorativas
        ctx.strokeStyle = 'rgba(123,116,201,0.28)'
        ctx.fillStyle = '#060a14'
        ctx.lineWidth = 1.6
        for (const d of decor) {
          const t = ramp(p, 0.02 + d.delay * 0.14, 0.16 + d.delay * 0.14)
          if (t <= 0) continue
          strokePartial(d, t)
          if (t >= 1) via(d.pts[d.pts.length - 1].x, d.pts[d.pts.length - 1].y, 3)
        }

        // Pistas principales: se trazan desde el borde hacia el chip
        ctx.lineWidth = 2.2
        for (const tr of traces) {
          const t = ramp(p, 0.01 + tr.delay * 0.1, 0.13 + tr.delay * 0.1)
          if (t <= 0) continue
          ctx.strokeStyle = 'rgba(150,143,230,0.55)'
          strokePartial(tr, t)
          ctx.strokeStyle = 'rgba(150,143,230,0.7)'
          ctx.fillStyle = '#060a14'
          if (t > 0.97) {
            via(tr.pts[1].x, tr.pts[1].y, 3.2)
          }
          // resistencia SMD sobre el tramo recto
          if (tr.resistor && t > 0.5) {
            const a = pointAt(tr, 0.04)
            const b = pointAt(tr, 0.07)
            const ang = Math.atan2(b.y - a.y, b.x - a.x)
            const m = pointAt(tr, 0.055)
            ctx.save()
            ctx.translate(m.x, m.y)
            ctx.rotate(ang)
            ctx.fillStyle = '#1a2238'
            ctx.fillRect(-9, -4.5, 18, 9)
            ctx.fillStyle = '#9aa3bb'
            ctx.fillRect(-9, -4.5, 4, 9)
            ctx.fillRect(5, -4.5, 4, 9)
            ctx.restore()
          }
        }

        // Chip
        const chipIn = ramp(p, 0.2, 0.34)
        if (chipIn > 0) {
          const s = mix(0.7, 1, easeInOut(chipIn))
          ctx.save()
          ctx.globalAlpha = dark * chipIn
          ctx.translate(cx, cy)
          ctx.scale(s, s)
          ctx.translate(-cx, -cy)
          ctx.fillStyle = '#b6bdd0'
          for (const pin of pins) ctx.fillRect(pin.x, pin.y, pin.w, pin.h)
          ctx.shadowColor = 'rgba(123,116,201,0.6)'
          ctx.shadowBlur = 30 * ramp(p, 0.5, 0.7)
          ctx.fillStyle = '#0d1426'
          ctx.strokeStyle = '#3a3f74'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.roundRect(chip.x, chip.y, chip.w, chip.h, chip.w * 0.03)
          ctx.fill()
          ctx.stroke()
          ctx.shadowBlur = 0
          // marca del pin 1 y serigrafía
          ctx.fillStyle = '#2a3150'
          ctx.beginPath()
          ctx.arc(chip.x + chip.w * 0.06, chip.y + chip.h * 0.08, chip.w * 0.018, 0, Math.PI * 2)
          ctx.fill()
          ctx.font = `${Math.max(8, chip.w * 0.026)}px "JetBrains Mono", monospace`
          ctx.fillStyle = 'rgba(169,163,230,0.55)'
          ctx.fillText('DB-2026 · CR', chip.x + chip.w * 0.06, chip.y + chip.h * 0.95)

          // Núcleo: código hexadecimal corriendo
          const die = {
            x: chip.x + chip.w * 0.06,
            y: chip.y + chip.h * 0.14,
            w: chip.w * 0.88,
            h: chip.h * 0.72,
          }
          const hexA = ramp(p, 0.32, 0.4) * (1 - ramp(p, 0.56, 0.66))
          if (hexA > 0) {
            ctx.save()
            ctx.beginPath()
            ctx.rect(die.x, die.y, die.w, die.h)
            ctx.clip()
            const fs = Math.max(8, chip.w * 0.032)
            ctx.font = `${fs}px "JetBrains Mono", monospace`
            ctx.fillStyle = `rgba(169,163,230,${0.65 * hexA})`
            const rowH = fs * 1.45
            const shift = (p * 40 * rowH) % rowH
            const first = Math.floor(p * 40)
            for (let r = 0; r < Math.ceil(die.h / rowH) + 1; r++) {
              ctx.fillText(hexRows[(first + r) % hexRows.length], die.x + 4, die.y + r * rowH - shift + fs)
            }
            ctx.restore()
          }
          ctx.restore()
        }

        // Señales que viajan por las pistas hacia el chip
        const sig = ramp(p, 0.24, 0.32) * (1 - ramp(p, 0.74, 0.82))
        if (sig > 0) {
          ctx.globalCompositeOperation = 'lighter'
          for (const tr of traces) {
            const s = (p * tr.speed + tr.offset) % 1
            const head = pointAt(tr, s)
            const tail = pointAt(tr, Math.max(0, s - 0.05))
            const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
            grad.addColorStop(0, 'rgba(185,180,255,0)')
            grad.addColorStop(1, `rgba(220,216,255,${0.9 * sig})`)
            ctx.strokeStyle = grad
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(tail.x, tail.y)
            ctx.lineTo(head.x, head.y)
            ctx.stroke()
            ctx.fillStyle = `rgba(235,233,255,${sig})`
            ctx.fillRect(head.x - 2, head.y - 2, 4, 4)
          }
          ctx.globalCompositeOperation = 'source-over'
        }

        ctx.restore()
        ctx.globalAlpha = 1
      }

      // Matriz de LEDs: se encienden en el núcleo del chip formando el logo y al final
      // se acomodan en el lugar del logo de la portada
      const ledFade = 1 - ramp(p, 0.9, 0.98)
      if (leds.length && ledFade > 0) {
        const ratio = logoRect.w ? logoRect.h / logoRect.w : 0.69
        const dieW = chip.w * 0.8
        const dieRect = {
          x: W / 2 - dieW / 2,
          y: chip.y + chip.h * 0.5 - (dieW * ratio) / 2,
          w: dieW,
          h: dieW * ratio,
        }
        const settle = ramp(p, 0.78, 0.92)
        const rect = {
          x: mix(dieRect.x, logoRect.x, settle),
          y: mix(dieRect.y, logoRect.y, settle),
          w: mix(dieRect.w, logoRect.w, settle),
          h: mix(dieRect.h, logoRect.h, settle),
        }
        const cell = Math.max(1.3, (rect.w * step) / logoW) * mix(0.72, 0.95, settle)
        const colorT = ramp(p, 0.74, 0.9)
        ctx.globalCompositeOperation = dark > 0.5 ? 'lighter' : 'source-over'
        for (const led of leds) {
          const on = ramp(p, 0.52 + led.delay * 0.16, 0.56 + led.delay * 0.16)
          if (on <= 0) continue
          const lit = led.purple ? [190, 182, 255] : [205, 222, 255]
          const real = led.purple ? [79, 74, 128] : [18, 40, 64]
          const r = mix(lit[0], real[0], colorT) | 0
          const g = mix(lit[1], real[1], colorT) | 0
          const b = mix(lit[2], real[2], colorT) | 0
          const x = rect.x + led.u * rect.w
          const y = rect.y + led.v * rect.h
          // destello al encenderse
          const flash = on < 1 ? 1 + (1 - on) * 1.2 : 1
          const size = cell * flash
          ctx.fillStyle = `rgba(${r},${g},${b},${(on * ledFade).toFixed(3)})`
          ctx.fillRect(x - size / 2, y - size / 2, size, size)
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      // Textos de la película y aparición de la portada real
      captions.forEach((el, i) => {
        const c = CAPTIONS[i]
        const o = ramp(p, c.from, c.from + 0.05) * (1 - ramp(p, c.to - 0.05, c.to))
        el.style.opacity = String(o)
        el.style.transform = `translate(-50%, ${(1 - o) * 16}px)`
      })
      if (hint) hint.style.opacity = String(1 - ramp(p, 0, 0.05))
      items.forEach((el, i) => {
        const isLogo = el === logoEl
        const o = isLogo ? ramp(p, 0.9, 0.97) : ramp(p, 0.82 + i * 0.022, 0.9 + i * 0.022)
        el.style.opacity = String(o)
        el.style.transform = isLogo ? '' : `translateY(${(1 - o) * 18}px)`
        el.style.visibility = o < 0.02 ? 'hidden' : ''
      })
      nav?.classList.toggle('is-over-dark', dark > 0.5)
    }

    const tick = () => {
      current += (target - current) * 0.14
      if (Math.abs(target - current) < 0.0004) current = target
      if (current !== drawn) {
        draw(current)
        drawn = current
      }
    }

    const navH = () => nav?.offsetHeight ?? 0
    const st = ScrollTrigger.create({
      trigger: section,
      start: () => `top ${navH()}px`,
      end: () => `+=${window.innerHeight * 2.6}`,
      pin: true,
      // el padre (.page) es flex y GSAP desactiva el espacio de reserva por defecto
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        target = self.progress
      },
      onRefresh: measure,
    })
    // la escena de "Cómo trabajamos" se registra antes; ordenarlas según su posición
    // para que su inicio se calcule después del espacio que reserva esta portada
    ScrollTrigger.sort()
    ScrollTrigger.refresh()

    const img = new Image()
    img.onload = () => {
      if (disposed) return
      step = W < 700 ? 6 : 5
      const s = sampleLogo(img, step)
      leds = s.leds
      logoW = s.width
      drawn = -1
    }
    img.src = LOGO_SRC

    measure()
    target = current = st.progress
    gsap.ticker.add(tick)
    window.addEventListener('resize', measure)

    return () => {
      disposed = true
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', measure)
      st.kill()
      section.classList.remove('is-animated')
      section.style.removeProperty('--cine-h')
      nav?.classList.remove('is-over-dark')
      for (const el of [...items, ...captions, hint]) {
        el?.removeAttribute('style')
      }
    }
  }, [])

  return (
    <section id="inicio" className="hero cine" ref={root}>
      {children}
      <canvas ref={canvasRef} className="cine-canvas" aria-hidden="true" />
      <div className="cine-captions" aria-hidden="true">
        {CAPTIONS.map((c) => (
          <p key={c.text} className="cine-caption">
            {c.text}
          </p>
        ))}
      </div>
      <div className="cine-hint" aria-hidden="true">
        <span className="cine-mouse" />
        Desliza para descubrir
      </div>
    </section>
  )
}
