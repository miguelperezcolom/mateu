/** documentEffects.ts takes its web branch first (Platform.OS === 'web'); this is never reached. */
export async function openBrowserAsync(url: string): Promise<void> {
  window.open(url, '_blank', 'noopener')
}
