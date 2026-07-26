import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://contenthub.team',
  // Keeps canonical / og:url / sitemap byte-identical (MANIFEST §9).
  trailingSlash: 'never',
  integrations: [sitemap()],
});
