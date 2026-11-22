import { signInGate, signOut as builtInSignOut, signOutAvailable } from '@infra/auth/signIn.ts'
import { readSignInConfig } from '@infra/auth/signInConfig.ts'
import { getAuthToken, useMountForTokenCookie } from '@infra/http/authToken.ts'
import { setTokenProvider } from '@rn/core/auth'

/** The heavy half of signIn.ts, loaded only by a page that declares sign-in providers. */
export async function start(baseUrl: string): Promise<boolean> {
  // the Bearer cookie is scoped to this mount (the first mateu-ui's rule)
  useMountForTokenCookie(baseUrl)
  const config = readSignInConfig()
  const gate = signInGate(baseUrl)
  if (!gate || !config) return true
  const flow = () => import('@infra/auth/signInFlow.ts')
  setTokenProvider({
    getToken: async () => getAuthToken(),
    refresh: async () => (await flow()).refresh(config),
    // a new sign-in: one provider → straight to it, several → the chooser (the page leaves on success)
    login: async () => {
      const m = await flow()
      return new Promise<boolean>((resolve) => m.reauthenticate({ retry: () => resolve(true), giveUp: () => resolve(false) }, config, baseUrl))
    },
    logout: () => builtInSignOut(),
  })
  return gate
}

export { signOutAvailable, builtInSignOut }
