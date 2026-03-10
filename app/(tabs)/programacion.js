import WebContentScreen from '../../src/components/WebContentScreen.js';
import { PROGRAMACION_URL } from '../../src/config/radioConfig.js';

export default function ProgramacionTab() {
  return <WebContentScreen title="Programación" url={PROGRAMACION_URL} />;
}
