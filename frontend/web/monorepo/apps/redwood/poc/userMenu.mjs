// The header's USER MENU (AppDto.user = { name, email?, picture? }, display only; absent for an
// anonymous caller): an avatar in the global header's profile area (slot `usermenu`) — the picture,
// else the initials — that opens a popup with the name, the e-mail and, when the built-in sign-in
// holds the session (signIn.mjs), Sign out. Without a named user, a session keeps the old bare
// «Sign out» header action (withSignOutAction).
//
// The pure rules MIRROR libs/mateu infra/ui/userMenu.ts (initialsOf / pictureOf /
// headerAccountControl) — keep them identical. The names carry a `user` prefix here because the
// bridge is ONE scope and widgets.mjs already has an `initialsOf` (the greeting widget's).

import { chromeText } from './i18n.mjs'

const LETTER_OR_DIGIT = /\p{L}|\p{N}/u

/**
 * Up to two initials: the first letter of the first and of the last word ("Ana María López" → "AL",
 * "miguelperezcolom" → "M"). Letters of any script; an e-mail-like name uses its local part.
 */
export function userInitialsOf(name) {
  const text = String(name == null ? '' : name)
  const base = text.includes('@') && !text.includes(' ') ? text.split('@')[0] : text
  const words = base.split(/[\s._-]+/u).filter((w) => LETTER_OR_DIGIT.test(w))
  if (words.length === 0) return '?'
  const first = Array.from(words[0]).find((c) => LETTER_OR_DIGIT.test(c)) || ''
  if (words.length === 1) return first.toLocaleUpperCase()
  const last = Array.from(words[words.length - 1]).find((c) => LETTER_OR_DIGIT.test(c)) || ''
  return (first + last).toLocaleUpperCase()
}

/** Only an http(s) picture is drawn; anything else falls back to the initials. */
export function userPictureOf(user) {
  const url = user && typeof user.picture === 'string' ? user.picture.trim() : ''
  return url && /^https?:\/\//i.test(url) ? url : undefined
}

/**
 * Which header control the shell draws: the user menu when the server named the signed-in user
 * (Sign out inside it when the built-in sign-in holds the session), the bare Sign out when it did
 * not but there is a session to end, nothing otherwise.
 */
export function headerAccountControl(user, signOutAvailable) {
  return user && user.name ? 'menu' : signOutAvailable ? 'signOut' : 'none'
}

/** AppDto.user as the shell keeps it: strings only, null when nobody is named. */
export function userProfileOf(raw) {
  if (!raw || typeof raw !== 'object') return null
  const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
  const name = str(raw.name)
  if (!name) return null
  const out = { name }
  const email = str(raw.email)
  if (email) out.email = email
  const picture = str(raw.picture)
  if (picture) out.picture = picture
  return out
}

/**
 * The projection the shell page binds (`mateuAccountMenu`), or null when there is no user menu.
 * `widgetRows` = the rows of the App's greeting widget (headerWidgetsOf().user), which the user
 * menu absorbs so the profile area never shows two avatars.
 */
export function accountMenuOf(shell, signOutAvailable, widgetRows) {
  const user = userProfileOf(shell && shell.user)
  if (headerAccountControl(user, signOutAvailable) !== 'menu') return null
  return {
    name: user.name,
    email: user.email || '',
    picture: userPictureOf(user) || null,
    initials: userInitialsOf(user.name),
    label: chromeText('userMenuOf', { name: user.name }),
    signOut: !!signOutAvailable,
    signOutLabel: chromeText('signOut'),
    rows: Array.isArray(widgetRows) ? widgetRows : [],
  }
}
