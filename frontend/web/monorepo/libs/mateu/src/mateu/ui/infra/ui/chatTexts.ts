import { chromeLanguage, chromeText, type ChromeTextKey } from './chromeTexts'

/**
 * The chat panel's own words — a view onto the ONE chrome catalogue (chromeTexts.ts), in the page's
 * language. The panel's TITLE is the app's brand when it gives one (@App(askLabel)); these are the
 * fallback and the rest of the panel's chrome.
 */
const KEYS = {
    title: 'chat',
    expand: 'chatWiden',
    restore: 'chatRestoreWidth',
    close: 'closeChat',
    resize: 'chatResize',
    empty: 'chatEmpty',
    placeholder: 'chatPlaceholder',
    send: 'send',
    dictate: 'chatDictate',
    stopDictation: 'chatStopDictation',
    thinking: 'chatThinking',
    answering: 'chatAnswering',
    callingTool: 'chatCallingTool',
    agentError: 'chatAgentError',
} as const satisfies Record<string, ChromeTextKey>

export type ChatTextKey = keyof typeof KEYS

export const chatLanguage = (explicit?: string): 'es' | 'en' => chromeLanguage(explicit)

export const chatText = (key: ChatTextKey, lang?: string): string => chromeText(KEYS[key], lang)
