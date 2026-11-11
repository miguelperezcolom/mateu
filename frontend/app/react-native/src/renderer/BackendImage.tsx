import React from 'react';
import { Image as RNImage, ImageBackground as RNImageBackground, type ImageBackgroundProps, type ImageProps } from 'react-native';
import { useBackendUrl } from './MateuViewHost';

/**
 * React Native's Image / ImageBackground, with a `source.uri` the server sent resolved against the
 * view's backend: a root-relative `src` (`/explorer/bay.svg`) is relative to the web's page, and a
 * native app has none — it was fetched from the app's own origin and drew a grey box.
 */
function useResolvedSource<T extends { source?: unknown }>(props: T): T {
  const backendUrl = useBackendUrl();
  const source = props.source as { uri?: string } | undefined;
  if (!source || typeof source !== 'object' || Array.isArray(source) || typeof source.uri !== 'string') return props;
  return { ...props, source: { ...source, uri: backendUrl(source.uri) } };
}

export function Image(props: ImageProps) {
  return <RNImage {...useResolvedSource(props)} />;
}

export function ImageBackground(props: ImageBackgroundProps) {
  return <RNImageBackground {...useResolvedSource(props)} />;
}
