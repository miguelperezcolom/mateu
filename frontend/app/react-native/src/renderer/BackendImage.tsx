import React from 'react';
import { type ImageBackgroundProps } from 'react-native';
import { useBackendUrl } from './MateuViewHost';
import { LoadingImage, LoadingImageBackground, type LoadingImageProps } from '../ui/LoadingImage';

/**
 * React Native's Image / ImageBackground, with a `source.uri` the server sent resolved against the
 * view's backend: a root-relative `src` (`/explorer/bay.svg`) is relative to the web's page, and a
 * native app has none — it was fetched from the app's own origin and drew a grey box. Both show
 * that they are loading, and a neutral broken-image mark when they could not (ui/LoadingImage.tsx).
 */
function useResolvedSource<T extends { source?: unknown }>(props: T): T {
  const backendUrl = useBackendUrl();
  const source = props.source as { uri?: string } | undefined;
  if (!source || typeof source !== 'object' || Array.isArray(source) || typeof source.uri !== 'string') return props;
  return { ...props, source: { ...source, uri: backendUrl(source.uri) } };
}

export function Image(props: LoadingImageProps) {
  return <LoadingImage {...useResolvedSource(props)} />;
}

export function ImageBackground(props: ImageBackgroundProps) {
  return <LoadingImageBackground {...useResolvedSource(props)} />;
}
