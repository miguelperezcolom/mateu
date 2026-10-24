/**
 * `Text` / `TextInput` with the theme's ink as their DEFAULT colour. React Native's own default is
 * black whatever the scheme, so every hand-drawn label that never set a colour vanished on a dark
 * surface. A nested `Text` inherits its parent's colour (React Native's rule), so only the
 * outermost one gets the default — a red run inside a sentence stays red.
 */
import React, { createContext, forwardRef, useContext } from 'react';
import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from 'react-native';
import { theme } from '../theme';

const InsideText = createContext(false);

export const Text = forwardRef<RNText, TextProps>(function Text(props, ref) {
  const nested = useContext(InsideText);
  const style = nested ? props.style : [{ color: theme.ink, fontFamily: theme.fontFamily }, props.style];
  return (
    <InsideText.Provider value>
      <RNText ref={ref} {...props} style={style} />
    </InsideText.Provider>
  );
});

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(props, ref) {
  return (
    <RNTextInput
      ref={ref}
      placeholderTextColor={theme.faint}
      keyboardAppearance={theme.scheme === 'dark' ? 'dark' : 'light'}
      {...props}
      style={[{ color: theme.ink, fontFamily: theme.fontFamily }, props.style]}
    />
  );
});
