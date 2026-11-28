import React from 'react'
import { UserMenu as Ui5UserMenu, UserMenuAccount } from '@ui5/webcomponents-react'
import type { Account } from '@app/ui5/Account'

/** Fiori's user menu, opened from the profile avatar: the account and "Sign out". */
export function ProfileMenu({ account, open, opener, onClose }: { account: Account; open: boolean; opener: HTMLElement | null; onClose: () => void }) {
  return (
    <Ui5UserMenu open={open && !!opener} opener={opener ?? undefined} onClose={onClose}
      onSignOutClick={(e: Event) => { e.preventDefault(); onClose(); account.signOut?.() }}
      accounts={<UserMenuAccount slot="accounts" titleText={account.name ?? ''} subtitleText={account.email} avatarInitials={account.initials} avatarSrc={account.picture} selected />} />
  )
}
