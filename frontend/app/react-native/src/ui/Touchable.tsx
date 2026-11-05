/**
 * The press feedback of every hand-drawn control: Material's ripple on Android, the dimming iOS
 * users expect there. A drop-in for React Native's TouchableOpacity, so a control only has to choose
 * what it looks like. A rounded control clips its ripple to its own shape.
 */
import React, { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, type PressableProps, type StyleProp, type View, type ViewStyle } from 'react-native';
import { mix, theme } from '../theme';

export interface TouchableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Accepted for compatibility with TouchableOpacity: iOS's dimming is fixed. */
  activeOpacity?: number;
}

export const TouchableOpacity = forwardRef<View, TouchableProps>(function Touchable({ style, activeOpacity: _ignored, ...props }, ref) {
  const flat = StyleSheet.flatten(style) as ViewStyle | undefined;
  const rounded = !!flat && (!!flat.borderRadius || !!flat.borderTopLeftRadius);
  if (Platform.OS === 'android') {
    return (
      <Pressable
        ref={ref}
        android_ripple={{ color: mix(theme.surface, theme.ink, 0.14), foreground: true }}
        style={rounded ? [flat, styles.clip] : flat}
        {...props}
      />
    );
  }
  return <Pressable ref={ref} style={({ pressed }) => [flat, pressed && !props.disabled && styles.pressed]} {...props} />;
});

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  pressed: { opacity: 0.6 },
});
