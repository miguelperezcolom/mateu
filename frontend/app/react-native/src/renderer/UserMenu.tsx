import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Menu } from 'react-native-paper';
import { TouchableOpacity } from '../ui/Touchable';
import { Text } from '../ui/Text';
import { LoadingImage } from '../ui/LoadingImage';
import { theme, themed } from '../theme';
import { buttonA11y } from '../a11y/a11y';
import { uiLocale } from '../core/money';
import { initialsOf, pictureOf, userMenuLabel, userMenuTexts, type SignedInUser } from '../core/userMenu';

/** The avatar: the user's http(s) picture, else (or once it failed) their initials. */
function UserAvatar({ user, size }: { user: SignedInUser; size: number }) {
  const [failed, setFailed] = useState(false);
  const picture = failed ? undefined : pictureOf(user);
  useEffect(() => setFailed(false), [user.picture]);
  const box = { width: size, height: size, borderRadius: size / 2 };
  return picture ? (
    <LoadingImage
      source={{ uri: picture }}
      style={box}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onError={() => setFailed(true)}
    />
  ) : (
    <View style={[styles.initials, box]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={[styles.initialsText, size >= 44 ? styles.initialsLarge : styles.initialsSmall]}>{initialsOf(user.name)}</Text>
    </View>
  );
}

/**
 * The signed-in user (AppDto.user) at the top of the drawer — the web's mateu-user-menu: avatar +
 * name + e-mail as one button that opens a menu with the name, the e-mail and Sign out (only when
 * the app holds a sign-in it can end). Display only: nothing here decides what the user may do.
 */
export function UserMenu({ user, onSignOut }: { user: SignedInUser; onSignOut?: () => void }) {
  const [open, setOpen] = useState(false);
  const locale = uiLocale();
  const label = userMenuLabel(user, locale);
  const texts = userMenuTexts(locale);
  const s = styles;
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      anchor={(
        <TouchableOpacity
          {...buttonA11y({ label, expanded: open })}
          style={s.row}
          onPress={() => setOpen(true)}
          testID="mateu-user-menu"
        >
          <UserAvatar user={user} size={36} />
          <View style={s.names}>
            <Text style={s.name} numberOfLines={1}>{user.name}</Text>
            {!!user.email && <Text style={s.email} numberOfLines={1}>{user.email}</Text>}
          </View>
        </TouchableOpacity>
      )}
    >
      <View style={s.who} accessible accessibilityLabel={[user.name, user.email].filter(Boolean).join(', ')}>
        <UserAvatar user={user} size={44} />
        <View style={s.names}>
          <Text style={s.name} numberOfLines={1}>{user.name}</Text>
          {!!user.email && <Text style={s.email} numberOfLines={1}>{user.email}</Text>}
        </View>
      </View>
      {onSignOut && (
        <>
          <Divider />
          <Menu.Item
            leadingIcon="logout"
            title={texts.signOut}
            accessibilityLabel={texts.signOut}
            onPress={() => { setOpen(false); onSignOut(); }}
            testID="mateu-user-menu-sign-out"
          />
        </>
      )}
    </Menu>
  );
}

const styles = themed(() => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: theme.minTouch, paddingHorizontal: 28, paddingVertical: 8 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, maxWidth: 320 },
  names: { flexShrink: 1, minWidth: 0 },
  name: { color: theme.ink, fontWeight: '600', fontSize: 16 },
  email: { color: theme.muted, fontSize: 14 },
  initials: { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.infoBg },
  initialsText: { color: theme.info, fontWeight: '600' },
  initialsSmall: { fontSize: 14 },
  initialsLarge: { fontSize: 16 },
}));
