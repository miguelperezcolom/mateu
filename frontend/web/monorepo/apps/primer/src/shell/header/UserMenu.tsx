import React from 'react'
import { ActionList, ActionMenu, Avatar, Button } from '@primer/react'
import { SignOutIcon } from '@primer/octicons-react'
import { headerAccountControl, initialsOf, pictureOf, signedInUserOf, userMenuLabel, userMenuTexts } from '@rn/core/userMenu'
import { safeHref } from '@infra/ui/safeNavigate.ts'

type Dict = Record<string, unknown>

/**
 * The signed-in user (AppDto.user — display only; Mateu does not authenticate): the avatar opening
 * the account menu, with "Sign out" when the app names a logoutUrl. An anonymous caller gets a bare
 * Sign out when there is one, else nothing.
 */
export function UserMenu({ app }: { app: Dict }) {
  const user = signedInUserOf(app['user'])
  const locale = typeof app['locale'] === 'string' ? app['locale'] : undefined
  const logout = typeof app['logoutUrl'] === 'string' && app['logoutUrl'] ? safeHref(app['logoutUrl']) ?? undefined : undefined
  const texts = userMenuTexts(locale)
  const control = headerAccountControl(user, !!logout)
  if (control === 'none') return null
  if (control === 'signOut') return <Button as="a" href={logout} size="small" variant="invisible" leadingVisual={SignOutIcon}>{texts.signOut}</Button>
  const picture = pictureOf(user!)
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <button type="button" className="mateu-user-button" aria-label={userMenuLabel(user!, locale)}>
          {picture
            ? <Avatar src={picture} size={28} alt="" />
            : <span className="mateu-user-initials" aria-hidden="true">{initialsOf(user!.name)}</span>}
        </button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="small">
        <ActionList>
          <ActionList.Group>
            <ActionList.GroupHeading>{user!.name}</ActionList.GroupHeading>
            {!!user!.email && <ActionList.Item disabled>{user!.email}</ActionList.Item>}
          </ActionList.Group>
          {logout && (
            <>
              <ActionList.Divider />
              <ActionList.LinkItem href={logout}>
                <ActionList.LeadingVisual><SignOutIcon /></ActionList.LeadingVisual>
                {texts.signOut}
              </ActionList.LinkItem>
            </>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
