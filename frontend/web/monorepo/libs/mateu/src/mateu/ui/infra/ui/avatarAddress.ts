/**
 * Whether an avatar is an image's address rather than the initials to write in the circle. An address may
 * be relative to the site: written as text, it would fill the circle with a piece of the path.
 */
export const isImageAddress = (avatar?: string | null): boolean =>
    !!avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/'))
