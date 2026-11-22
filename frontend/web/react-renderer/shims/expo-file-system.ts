/** documentEffects.ts takes its web branch first (Platform.OS === 'web'); this is never reached. */
export const Paths = { cache: '' }
export class File {
  readonly uri = ''
  readonly contentUri = ''
  constructor(..._parts: unknown[]) {
    throw new Error('expo-file-system is not available on the web')
  }
  create(_options?: unknown): void {}
  write(_bytes: Uint8Array): void {}
}
