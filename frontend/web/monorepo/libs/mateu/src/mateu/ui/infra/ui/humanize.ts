/**
 * A field id as a person would write it — "startDate" → "Start date", "check_out" → "Check out",
 * "guests.0.name" → "Name". Only used when the screen offers no label at all: an error message that
 * names a field by its programmer id speaks the system's language, not the user's (Nielsen #2).
 */
export const humanizeFieldId = (id: string): string => {
    const last = id.split('.').filter((p) => p && !/^\d+$/.test(p)).pop() ?? id
    const words = last
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .trim()
        .toLowerCase()
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : id
}
