import { lazy, Suspense, useSyncExternalStore } from 'react'
import { temporadaActual } from './config.ts'

// La decoración se descarga solo durante su temporada: fuera de fechas,
// los visitantes no bajan nada de esto (solo este pequeño verificador).
const Decoracion = lazy(() => import('./Decoracion.tsx'))

// La fecha no cambia mientras la página está abierta: no hay nada a qué suscribirse
const subscribe = () => () => {}

// Solo en el navegador: el HTML prerenderizado no incluye la decoración,
// así no afecta el SEO ni produce diferencias al hidratar.
export default function Temporada() {
  const tipo = useSyncExternalStore(subscribe, () => temporadaActual(), () => null)
  if (!tipo) return null
  return (
    <Suspense fallback={null}>
      <Decoracion tipo={tipo} />
    </Suspense>
  )
}
