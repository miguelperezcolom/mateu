/** `@App(accentColor)` on SLDS's accent styling hooks (the Lightning theme's brand colours). */
export function sldsAccent(color: string): string {
  return `:root { --mateu-accent: ${color}; --slds-g-color-accent-1: ${color}; --slds-g-color-accent-container-1: ${color}; --slds-g-color-border-accent-1: ${color}; --slds-g-color-brand-base-50: ${color}; }`
}
