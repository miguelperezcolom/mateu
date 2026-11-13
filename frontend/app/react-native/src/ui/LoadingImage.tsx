/**
 * An image the renderer draws from a URL or a data URI, showing that it is loading: the image's own
 * box (its declared size / aspect ratio, so nothing jumps when it arrives) in a neutral surface tone
 * with a small spinner while it loads, the picture once it has, and a neutral broken-image mark —
 * named "Image could not be loaded" to a screen reader — when it failed, never an empty box.
 *
 * A bundled asset (`require(...)`) is there already: it renders as the plain image, no spinner.
 * The state logic is ui/imageLoadState.ts (pure, tested); every image site goes through here
 * (renderer/BackendImage.tsx wraps it, the hub's icons pass expo-image as `component`).
 */
import React, { useState } from 'react';
import {
  Image as RNImage,
  ImageBackground as RNImageBackground,
  StyleSheet,
  View,
  type ImageBackgroundProps,
  type ImageProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ActivityIndicator, Icon } from 'react-native-paper';
import { theme } from '../theme';
import { loadingTexts } from '../core/loadingTexts';
import { uiLocale } from '../core/money';
import { imageLoadReducer, initialImageState, remoteUriOf, type ImageLoadEvent, type ImageLoadState } from './imageLoadState';

type Json = Record<string, unknown>;

/** Style keys only an image understands: they stay on the image, the rest lays the box out. */
const IMAGE_ONLY = new Set(['resizeMode', 'tintColor', 'overlayColor', 'objectFit']);
/** Keys the image inside the box must repeat to keep the box's shape. */
const RADIUS = /^border\w*Radius$/;
/** Accessibility props: they belong to the box (it is what a screen reader focuses). */
const A11Y_PROPS = [
  'accessible',
  'accessibilityRole',
  'accessibilityLabel',
  'accessibilityHint',
  'accessibilityElementsHidden',
  'importantForAccessibility',
  'testID',
] as const;

function splitStyle(style: unknown): { box: Json; image: Json } {
  const flat = (StyleSheet.flatten(style as StyleProp<ViewStyle>) ?? {}) as Json;
  const box: Json = {};
  const image: Json = {};
  for (const [k, v] of Object.entries(flat)) {
    if (IMAGE_ONLY.has(k)) image[k] = v;
    else {
      box[k] = v;
      if (RADIUS.test(k)) image[k] = v;
    }
  }
  return { box, image };
}

/** The image's load state, started over whenever its uri changes. */
function useImageLoad(source: unknown): [ImageLoadState, (e: ImageLoadEvent) => void] {
  const uri = remoteUriOf(source);
  const [current, setCurrent] = useState<{ uri: string | null; state: ImageLoadState }>(() => ({ uri, state: initialImageState(source) }));
  const state = current.uri === uri ? current.state : initialImageState(source);
  const dispatch = (event: ImageLoadEvent) =>
    setCurrent((c) => {
      const base = c.uri === uri ? c.state : initialImageState(source);
      return { uri, state: imageLoadReducer(base, event) };
    });
  return [state, dispatch];
}

function chain<A extends unknown[]>(own: (...a: A) => void, theirs: unknown): (...a: A) => void {
  return (...a: A) => {
    own(...a);
    if (typeof theirs === 'function') (theirs as (...a: A) => void)(...a);
  };
}

/** A small neutral broken-image mark (decorative: the box carries the name). */
function BrokenMark({ size = 20 }: { size?: number }) {
  return <Icon source="image-broken-variant" size={size} color={theme.faint} />;
}

export interface LoadingImageProps extends ImageProps {
  /** The image component to draw with (expo-image's `Image` for the hub's cached icons). */
  component?: React.ComponentType<any>;
  /** What to show instead of the broken-image mark (the hub draws a UI's initials). */
  fallback?: React.ReactNode;
  /** Extra props for `component` (e.g. expo-image's `cachePolicy`). */
  [extra: string]: unknown;
}

export function LoadingImage(props: LoadingImageProps) {
  const { component, fallback, style, onLoadStart, onLoad, onError, onLoadEnd, ...rest } = props;
  const ImageComponent = (component ?? RNImage) as React.ComponentType<any>;
  const [state, dispatch] = useImageLoad(props.source);
  if (!remoteUriOf(props.source)) {
    // a bundled asset: nothing to wait for
    return <ImageComponent {...rest} style={style} onLoadStart={onLoadStart} onLoad={onLoad} onError={onError} onLoadEnd={onLoadEnd} />;
  }

  const { box, image } = splitStyle(style);
  const boxA11y: Json = {};
  const imageProps: Json = { ...rest };
  for (const k of A11Y_PROPS) {
    if (k in imageProps) {
      boxA11y[k] = imageProps[k];
      delete imageProps[k];
    }
  }
  const decorative = boxA11y['importantForAccessibility'] === 'no' || boxA11y['accessibilityElementsHidden'] === true || boxA11y['accessible'] === false;
  const failedA11y =
    state === 'error' && !decorative
      ? {
          accessible: true,
          accessibilityRole: 'image' as const,
          accessibilityLabel: [boxA11y['accessibilityLabel'], loadingTexts(uiLocale()).imageFailed].filter(Boolean).join('. '),
        }
      : {};
  const busyA11y = state === 'loading' && !decorative ? { accessibilityState: { busy: true } } : {};
  // the neutral tone while waiting / for the broken mark; a fallback of the caller's paints on what is behind
  const placeholderBg = box['backgroundColor'] === undefined && (state === 'loading' || (state === 'error' && !fallback)) ? { backgroundColor: theme.divider } : null;

  return (
    <View style={[box as ViewStyle, styles.box, placeholderBg]} {...boxA11y} {...busyA11y} {...failedA11y}>
      {state !== 'error' && (
        <ImageComponent
          {...imageProps}
          accessible={false}
          importantForAccessibility="no"
          accessibilityElementsHidden
          style={[StyleSheet.absoluteFill, image]}
          onLoadStart={chain(() => dispatch({ type: 'start' }), onLoadStart)}
          onLoad={chain(() => dispatch({ type: 'load' }), onLoad)}
          onError={chain(() => dispatch({ type: 'error' }), onError)}
          onLoadEnd={chain(() => dispatch({ type: 'end' }), onLoadEnd)}
        />
      )}
      {state === 'loading' && (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator size="small" color={theme.faint} />
        </View>
      )}
      {state === 'error' && <View style={styles.center} pointerEvents="none">{fallback ?? <BrokenMark />}</View>}
    </View>
  );
}

/**
 * An image BEHIND content (a hero's banner): its content shows at once on the box's own colour; a
 * small spinner in a corner says the picture is still coming, and a small broken-image mark says it
 * did not — the content stays readable either way.
 */
export function LoadingImageBackground(props: ImageBackgroundProps) {
  const { children, onLoadStart, onLoad, onError, onLoadEnd, ...rest } = props;
  const [state, dispatch] = useImageLoad(props.source);
  if (!remoteUriOf(props.source)) return <RNImageBackground {...props} />;
  return (
    <RNImageBackground
      {...rest}
      onLoadStart={chain(() => dispatch({ type: 'start' }), onLoadStart)}
      onLoad={chain(() => dispatch({ type: 'load' }), onLoad)}
      onError={chain(() => dispatch({ type: 'error' }), onError)}
      onLoadEnd={chain(() => dispatch({ type: 'end' }), onLoadEnd)}
    >
      {children}
      {state === 'loading' && (
        <View style={styles.corner} pointerEvents="none">
          <ActivityIndicator size="small" color={theme.faint} />
        </View>
      )}
      {state === 'error' && (
        <View style={styles.corner} pointerEvents="none" accessible accessibilityRole="image" accessibilityLabel={loadingTexts(uiLocale()).imageFailed}>
          <BrokenMark />
        </View>
      )}
    </RNImageBackground>
  );
}

// theme-free (read at render time where colours are needed), so no themed() wrapper is required
const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', top: 8, right: 8 },
});
