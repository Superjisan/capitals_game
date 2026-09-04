import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');

// Mounts the real index.html body (minus the module script, which tests import
// directly) so the game's DOM lookups match production markup.
export function mountIndexHtml() {
  const body = indexHtml.match(/<body>([\s\S]*)<\/body>/)[1];
  document.body.innerHTML = body.replace(/<script[^>]*capitals_game\.js[^>]*><\/script>/, '');
}
