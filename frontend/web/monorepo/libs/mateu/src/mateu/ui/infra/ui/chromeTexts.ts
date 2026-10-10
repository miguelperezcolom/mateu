/**
 * The words of the app shell's own chrome — the header's toggles and the chat panel — in the page's
 * language. The app's texts come from the server; these are the few the shell draws by itself, and
 * they used to be a mix ("Cerrar el chat" next to "Switch to dark mode" next to "Send").
 *
 * The language is the page's (`<html lang>`), else the browser's; Spanish and English for now, any
 * other language falls back to English.
 */
const TEXTS = {
    en: {
        chat: 'Assistant',
        openChat: 'Open the assistant',
        closeChat: 'Close the assistant',
        darkMode: 'Switch to dark mode',
        lightMode: 'Switch to light mode',
        expandChat: 'Expand',
        collapseChat: 'Restore size',
        chatEmpty: 'Ask whatever you need: about this screen, your data or how to do something.',
        chatPlaceholder: 'Write a message…',
        send: 'Send',
        sections: 'Sections',
        confirmTitle: 'One moment, please',
        confirmMessage: 'Are you sure?',
        confirmYes: 'Yes',
        confirmNo: 'No',
        forbidden: 'You are not allowed to do this.',
        notFound: 'Not found',
        notFoundMessage: 'It may have been deleted, or the link is wrong.',
        goBack: 'Go back',
        rangeFrom: 'From',
        rangeTo: 'To',
    },
    es: {
        chat: 'Asistente',
        openChat: 'Abrir el asistente',
        closeChat: 'Cerrar el asistente',
        darkMode: 'Cambiar a modo oscuro',
        lightMode: 'Cambiar a modo claro',
        expandChat: 'Ampliar',
        collapseChat: 'Tamaño normal',
        chatEmpty: 'Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.',
        chatPlaceholder: 'Escribe un mensaje…',
        send: 'Enviar',
        sections: 'Secciones',
        confirmTitle: 'Un momento',
        confirmMessage: '¿Seguro?',
        confirmYes: 'Sí',
        confirmNo: 'No',
        forbidden: 'No tienes permiso para esta acción.',
        notFound: 'No encontrado',
        notFoundMessage: 'Puede que se haya borrado o que el enlace no sea correcto.',
        goBack: 'Volver',
        rangeFrom: 'Desde',
        rangeTo: 'Hasta',
    },
} as const

export type ChromeTextKey = keyof typeof TEXTS.en

export const chromeLanguage = (explicit?: string): 'es' | 'en' => {
    const lang = explicit || (typeof document !== 'undefined' && document.documentElement?.lang)
        || (typeof navigator !== 'undefined' && navigator.language) || ''
    return lang.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export const chromeText = (key: ChromeTextKey, lang?: string): string => TEXTS[chromeLanguage(lang)][key]
