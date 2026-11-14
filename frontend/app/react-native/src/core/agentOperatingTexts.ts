import { chromeLanguageOf, type ChromeLanguage } from './chromeLanguage.ts';

/** The words of the "an AI agent is operating this screen" notice (live UI push, its screen tools). */
export interface AgentOperatingTexts {
  /** The notice itself (also what is announced when it appears). */
  operating: string;
  /** Its button: unpairs the agent and closes this UI's channel. */
  stop: string;
  /** Announced after Stop. */
  stopped: string;
}

const TEXTS: Record<ChromeLanguage, AgentOperatingTexts> = {
  en: { operating: 'An AI agent is operating this screen', stop: 'Stop', stopped: 'The AI agent can no longer operate this screen' },
  es: { operating: 'Un agente de IA está manejando esta pantalla', stop: 'Detener', stopped: 'El agente de IA ya no puede manejar esta pantalla' },
  fr: { operating: "Un agent d'IA pilote cet écran", stop: 'Arrêter', stopped: "L'agent d'IA ne peut plus piloter cet écran" },
  de: { operating: 'Ein KI-Agent bedient diesen Bildschirm', stop: 'Stoppen', stopped: 'Der KI-Agent kann diesen Bildschirm nicht mehr bedienen' },
  pt: { operating: 'Um agente de IA está operando esta tela', stop: 'Parar', stopped: 'O agente de IA não pode mais operar esta tela' },
  it: { operating: 'Un agente di IA sta usando questa schermata', stop: 'Interrompi', stopped: "L'agente di IA non può più usare questa schermata" },
};

export function agentOperatingTexts(locale: string | null | undefined): AgentOperatingTexts {
  return TEXTS[chromeLanguageOf(locale)];
}

/** Every language's texts (the completeness test reads them). */
export const ALL_AGENT_OPERATING_TEXTS: Readonly<Record<ChromeLanguage, AgentOperatingTexts>> = TEXTS;
