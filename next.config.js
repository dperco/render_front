module.exports = {
  // Habilita el modo standalone para mejor compatibilidad con Netlify
  output: 'standalone',
  // Configuración para ignorar errores durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración para manejar fallos en SSG
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
}