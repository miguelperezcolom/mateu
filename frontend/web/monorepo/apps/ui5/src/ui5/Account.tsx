import React from 'react'
import { Avatar, Button } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/log.js'
import { headerAccountControl, initialsOf, pictureOf, signedInUserOf, userMenuLabel, userMenuTexts } from '@rn/core/userMenu'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { builtInSignOutAvailable, signOutOfBuiltIn } from '@mr/shell/signIn'

type Dict = Record<string, unknown>

export interface Account { control: 'none' | 'signOut' | 'menu'; signOut?: () => void; label: string; initials?: string; picture?: string; name?: string; email?: string; signOutText: string }

/** Who is signed in (AppDto.user — display only; Mateu does not authenticate) and how they sign out. */
export function accountOf(app: Dict): Account {
  const user = signedInUserOf(app['user'])
  const locale = typeof app['locale'] === 'string' ? app['locale'] : undefined
  const logout = typeof app['logoutUrl'] === 'string' && app['logoutUrl'] ? safeHref(app['logoutUrl']) ?? undefined : undefined
  const texts = userMenuTexts(locale)
  const builtIn = builtInSignOutAvailable()
  const control = headerAccountControl(user, builtIn || !!logout)
  const signOut = builtIn ? () => void signOutOfBuiltIn() : logout ? () => window.location.assign(logout) : undefined
  return {
    control, signOut, signOutText: texts.signOut,
    label: user ? userMenuLabel(user, locale) : texts.signOut,
    initials: user ? initialsOf(user.name) : undefined, picture: user ? pictureOf(user) : undefined, name: user?.name, email: user?.email ?? undefined,
  }
}

/** The shell bar's profile avatar (its profile slot). */
export function ProfileAvatar({ account }: { account: Account }) {
  return (
    <Avatar slot="profile" size="XS" initials={account.picture ? undefined : account.initials} accessibleName={account.label} interactive>
      {account.picture ? <img src={account.picture} alt="" /> : null}
    </Avatar>
  )
}


/** An anonymous caller with somewhere to sign out: a plain "Sign out" in the bar. */
export function SignOutButton({ account }: { account: Account }) {
  return <Button slot="content" design="Transparent" icon="log" onClick={() => account.signOut?.()}>{account.signOutText}</Button>
}
