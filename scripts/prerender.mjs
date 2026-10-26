// Inserta el HTML renderizado de la app en dist/index.html para que los
// buscadores reciban el contenido completo sin ejecutar JavaScript.
import { readFile, rm, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const indexFile = new URL('dist/index.html', root)
const ssrDir = new URL('dist-ssr/', root)

const { render } = await import(new URL('entry-server.js', ssrDir).href)

const template = await readFile(indexFile, 'utf8')
const placeholder = '<div id="root"></div>'
if (!template.includes(placeholder)) {
  throw new Error(`No se encontró ${placeholder} en dist/index.html`)
}

await writeFile(indexFile, template.replace(placeholder, `<div id="root">${render()}</div>`))
await rm(ssrDir, { recursive: true, force: true })

console.log('✓ dist/index.html prerenderizado')
