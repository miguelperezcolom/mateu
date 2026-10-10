// Documents on React Native — the platform half (see ./documents.ts for the rules and why).
import { Linking, Platform, Share } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { File, Paths } from 'expo-file-system';
import { planDocument, type FileDownloadData } from './documents';

function bytesOf(base64: string): Uint8Array {
  const bin = globalThis.atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Shows / shares a `DownloadFile` payload. Resolves to what happened, or rejects when the platform
 * could not hand the file to anything (the caller tells the user).
 */
export async function presentDocument(
  data: FileDownloadData | null | undefined,
  baseUrl: string,
): Promise<'browser' | 'shared' | 'opened' | 'web' | 'none'> {
  const plan = planDocument(data, baseUrl);
  if (!plan) return 'none';

  if (Platform.OS === 'web') {
    // expo web runs in a browser: the same behaviour as the web renderers
    const href = plan.kind === 'url' ? plan.url : `data:${plan.mimeType};base64,${plan.base64}`;
    const doc = (globalThis as unknown as { document?: Document }).document;
    if (plan.inline && plan.kind === 'url') {
      (globalThis as unknown as { open: (u: string, t: string) => unknown }).open(href, '_blank');
    } else if (doc) {
      const a = doc.createElement('a');
      a.href = href;
      a.download = plan.filename;
      doc.body.appendChild(a);
      a.click();
      a.remove();
    }
    return 'web';
  }

  if (plan.kind === 'url') {
    // the system browser sheet previews a PDF and offers share / save / print from there
    await WebBrowser.openBrowserAsync(plan.url);
    return 'browser';
  }

  const file = new File(Paths.cache, plan.filename);
  file.create({ overwrite: true });
  file.write(bytesOf(plan.base64));
  if (Platform.OS === 'ios') {
    // Quick Look preview + Save to Files / Print / AirDrop
    await Share.share({ url: file.uri, title: plan.filename }, { subject: plan.filename });
    return 'shared';
  }
  // Android: the apps that open this type (a PDF viewer, Drive…), through a content:// URI
  await Linking.openURL(file.contentUri);
  return 'opened';
}
