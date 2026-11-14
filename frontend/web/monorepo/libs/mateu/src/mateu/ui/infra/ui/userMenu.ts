/**
 * The header's user menu, the pure part (mateu-user-menu draws it): what the avatar shows and
 * whether the menu is there at all.
 */

export interface SignedInUser {
    name: string
    email?: string
    picture?: string
}

/**
 * Up to two initials: the first letter of the first and of the last word ("Ana María López" → "AL",
 * "miguelperezcolom" → "M"). Letters of any script; an e-mail-like name uses its local part.
 */
export const initialsOf = (name: string): string => {
    const base = name.includes('@') && !name.includes(' ') ? name.split('@')[0] : name
    const words = base.split(/[\s._-]+/u).filter((w) => /\p{L}|\p{N}/u.test(w))
    if (words.length === 0) return '?'
    const first = Array.from(words[0]).find((c) => /\p{L}|\p{N}/u.test(c)) ?? ''
    if (words.length === 1) return first.toLocaleUpperCase()
    const last = Array.from(words[words.length - 1]).find((c) => /\p{L}|\p{N}/u.test(c)) ?? ''
    return (first + last).toLocaleUpperCase()
}

/** Only an http(s) picture is drawn; anything else falls back to the initials. */
export const pictureOf = (user: SignedInUser): string | undefined => {
    const url = user.picture?.trim()
    return url && /^https?:\/\//i.test(url) ? url : undefined
}

/**
 * Which header control a shell draws: the user menu when the server named the signed-in user
 * (Sign out inside it when the built-in sign-in holds the session), the bare Sign out icon when it
 * did not but there is a session to end, nothing otherwise.
 */
export const headerAccountControl = (user: SignedInUser | undefined, signOutAvailable: boolean): 'menu' | 'signOut' | 'none' =>
    user?.name ? 'menu' : signOutAvailable ? 'signOut' : 'none'
