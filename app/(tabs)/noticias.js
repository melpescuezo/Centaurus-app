import WebContentScreen from '../../src/components/WebContentScreen.js';
import { NOTICIAS_URL } from '../../src/config/radioConfig.js';

export default function NoticiasTab() {
  return <WebContentScreen title="Noticias" url={NOTICIAS_URL} />;
}
