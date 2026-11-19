// Decoración de temporada. Se repite todos los años: cada una se enciende y
// apaga sola entre sus fechas (según la fecha del visitante), sin publicar cambios.
// Las fechas son [mes, día] y ambos extremos se incluyen.
//
// - Para apagar una: `activa: false`.
// - Para eliminar todo: borrar la carpeta src/temporada/ y las líneas
//   `import Temporada` y `<Temporada />` en src/App.tsx.
export type Temporada = 'patria' | 'halloween' | 'navidad' | 'anoNuevo'

type MesDia = readonly [number, number]

export const TEMPORADAS: Record<Temporada, { activa: boolean; desde: MesDia; hasta: MesDia }> = {
  patria: { activa: true, desde: [9, 1], hasta: [9, 30] }, // Mes de la Patria (Costa Rica)
  halloween: { activa: true, desde: [10, 15], hasta: [10, 31] },
  navidad: { activa: true, desde: [11, 1], hasta: [12, 31] },
  anoNuevo: { activa: true, desde: [1, 1], hasta: [1, 14] },
}

const valor = ([m, d]: MesDia) => m * 100 + d

export function temporadaActual(hoy = new Date()): Temporada | null {
  const v = valor([hoy.getMonth() + 1, hoy.getDate()])
  for (const [nombre, t] of Object.entries(TEMPORADAS) as [Temporada, (typeof TEMPORADAS)[Temporada]][]) {
    if (t.activa && v >= valor(t.desde) && v <= valor(t.hasta)) return nombre
  }
  return null
}
