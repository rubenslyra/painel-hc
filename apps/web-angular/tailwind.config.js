/** Tailwind v3 configuração — v4 usa CSS puro, mas mantemos v3 aqui pela integração Angular estável. */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  theme: {
    extend: {
      colors: {
        healthy: 'hsl(var(--healthy))',
        attention: 'hsl(var(--attention))',
        critical: 'hsl(var(--critical))',
        primary: 'hsl(var(--primary))',
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        muted: 'hsl(var(--muted))',
        border: 'hsl(var(--border))'
      }
    }
  },
  plugins: []
};
