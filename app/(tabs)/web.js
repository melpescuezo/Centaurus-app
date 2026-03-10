import WebContentScreen from '../../src/components/WebContentScreen.js';
import { WEB_URL } from '../../src/config/radioConfig.js';

export default function WebTab() {
  return <WebContentScreen title="Web" url={WEB_URL} />;
}
