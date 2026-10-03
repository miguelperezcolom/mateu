/**
 * The chat panel's own words, in the page's language (`<html lang>`, else the browser's): Spanish
 * or English, anything else English. The panel's TITLE is the app's brand when it gives one
 * (@App(askLabel)) — these are the fallback and the rest of the panel's chrome.
 */
const TEXTS = {
    en: {
        title: 'Assistant',
        expand: 'Widen the assistant',
        restore: 'Restore the width',
        close: 'Close the assistant',
        resize: 'Assistant width',
        empty: 'Ask whatever you need: about this screen, your data or how to do something.',
        placeholder: 'Write a message…',
        send: 'Send',
    },
    es: {
        title: 'Asistente',
        expand: 'Ampliar el asistente',
        restore: 'Ancho normal',
        close: 'Cerrar el asistente',
        resize: 'Ancho del asistente',
        empty: 'Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.',
        placeholder: 'Escribe un mensaje…',
        send: 'Enviar',
    },
} as const

export type ChatTextKey = keyof typeof TEXTS.en

export const chatLanguage = (explicit?: string): 'es' | 'en' => {
    const lang = explicit || (typeof document !== 'undefined' && document.documentElement?.lang)
        || (typeof navigator !== 'undefined' && navigator.language) || ''
    return lang.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export const chatText = (key: ChatTextKey, lang?: string): string => TEXTS[chatLanguage(lang)][key]
