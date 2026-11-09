import fs from 'node:fs'
import path from 'node:path'
import type { ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

// Muestra public/404.html (con código 404) para rutas que no existen, igual que
// nginx en producción. Vite por defecto devolvería la portada en cualquier ruta.
function notFoundPage(): Plugin {
  const handler =
    (dirs: () => string[], page: () => string) =>
    (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
      const url = (req.url ?? '/').split('?')[0]
      const isPage = req.method === 'GET' && (req.headers.accept ?? '').includes('text/html')
      if (!isPage || url === '/' || url === '/index.html') return next()

      let file = url
      try {
        file = decodeURIComponent(url)
      } catch {
        // dirección mal codificada: no existe
      }
      const rel = file.replace(/^\/+/, '')
      if (dirs().some((dir) => fs.existsSync(path.join(dir, rel)))) return next()

      res.statusCode = 404
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(fs.readFileSync(page()))
    }

  return {
    name: 'pagina-404',
    configureServer(server) {
      const { root, publicDir } = server.config
      server.middlewares.use(
        handler(
          () => [root, publicDir],
          () => path.join(publicDir, '404.html'),
        ),
      )
    },
    configurePreviewServer(server) {
      const outDir = path.resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use(
        handler(
          () => [outDir],
          () => path.join(outDir, '404.html'),
        ),
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), notFoundPage()],
})
