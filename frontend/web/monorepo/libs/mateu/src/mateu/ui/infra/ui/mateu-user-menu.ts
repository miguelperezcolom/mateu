import { LitElement, css, html, nothing, TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'
import { signOut, signOutAvailable } from '@infra/auth/signIn.ts'
import { initialsOf, pictureOf, SignedInUser } from './userMenu.ts'

/**
 * The signed-in user in the app's header (AppDto.user): an avatar — the picture, else initials —
 * that opens a small menu with the name, the e-mail and Sign out (when the built-in sign-in holds
 * the session). Design-system neutral: Lumo variables with fallbacks, like the notification bell.
 *
 * Keyboard: the avatar is a button; the menu opens with focus on its first item, Escape closes it
 * and gives the focus back to the avatar.
 */
@customElement('mateu-user-menu')
export class MateuUserMenu extends LitElement {

    @property({ attribute: false }) user: SignedInUser | undefined

    @state() private opened = false
    @state() private pictureFailed = false

    @query('.avatar-button') private avatarButton: HTMLButtonElement | undefined
    @query('.menu [role="menuitem"]') private firstItem: HTMLElement | undefined

    private outsideClick: ((e: Event) => void) | undefined

    disconnectedCallback() {
        super.disconnectedCallback()
        this.detachOutsideClick()
    }

    protected willUpdate(changed: Map<string, unknown>) {
        if (changed.has('user')) this.pictureFailed = false
    }

    private detachOutsideClick() {
        if (this.outsideClick) {
            document.removeEventListener('mousedown', this.outsideClick)
            this.outsideClick = undefined
        }
    }

    private open() {
        if (this.opened) return
        this.opened = true
        this.outsideClick = (e: Event) => {
            if (!e.composedPath().includes(this)) this.close(false)
        }
        document.addEventListener('mousedown', this.outsideClick)
        void this.updateComplete.then(() => this.firstItem?.focus())
    }

    private close(refocus: boolean) {
        this.detachOutsideClick()
        this.opened = false
        if (refocus) void this.updateComplete.then(() => this.avatarButton?.focus())
    }

    private onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.opened) {
            e.stopPropagation()
            this.close(true)
        }
    }

    private signOut = () => {
        this.close(false)
        if (!dirtyGuard.confirmLeave()) return
        void signOut()
    }

    private renderAvatar(user: SignedInUser, size: 'sm' | 'lg'): TemplateResult {
        const picture = this.pictureFailed ? undefined : pictureOf(user)
        return picture
            ? html`<img class="avatar ${size}" src="${picture}" alt="" referrerpolicy="no-referrer"
                        @error="${() => { this.pictureFailed = true }}">`
            : html`<span class="avatar initials ${size}" aria-hidden="true">${initialsOf(user.name)}</span>`
    }

    render() {
        const user = this.user
        if (!user?.name) return nothing
        const label = chromeTextf('userMenuOf', { name: user.name })
        return html`
            <div class="root" @keydown="${this.onKeydown}">
                <button class="avatar-button" data-access-key-target title="${label}" aria-label="${label}"
                        aria-haspopup="menu" aria-expanded="${this.opened ? 'true' : 'false'}"
                        @click="${() => this.opened ? this.close(false) : this.open()}">
                    ${this.renderAvatar(user, 'sm')}
                </button>
                ${this.opened ? html`
                    <div class="menu" role="menu" aria-label="${label}">
                        <div class="who">
                            ${this.renderAvatar(user, 'lg')}
                            <div class="names">
                                <div class="name">${user.name}</div>
                                ${user.email ? html`<div class="email">${user.email}</div>` : nothing}
                            </div>
                        </div>
                        ${signOutAvailable() ? html`
                            <div class="separator" role="separator"></div>
                            <button class="item mateu-sign-out" role="menuitem" @click="${this.signOut}">
                                ${chromeText('signOut')}
                            </button>` : nothing}
                    </div>` : nothing}
            </div>`
    }

    static styles = css`
        :host { display: inline-flex; position: relative; flex-shrink: 0; }
        .root { display: inline-flex; position: relative; align-items: center; margin-left: 0.5rem; }
        .avatar-button {
            display: inline-flex; align-items: center; justify-content: center;
            font: inherit; background: transparent; border: none; padding: 0.15rem;
            border-radius: 999px; cursor: pointer;
        }
        .avatar-button:hover { background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06)); }
        .avatar-button:focus-visible, .item:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1a73e8); outline-offset: 2px;
        }
        .avatar { border-radius: 999px; object-fit: cover; flex-shrink: 0; }
        .avatar.sm { width: 1.9rem; height: 1.9rem; }
        .avatar.lg { width: 2.6rem; height: 2.6rem; }
        .initials {
            display: inline-flex; align-items: center; justify-content: center;
            background: var(--lumo-primary-color-10pct, rgba(26, 115, 232, 0.12));
            color: var(--lumo-primary-text-color, #1a5fb4);
            font-weight: 600; line-height: 1;
        }
        .initials.sm { font-size: var(--lumo-font-size-xs, 0.8rem); }
        .initials.lg { font-size: var(--lumo-font-size-m, 1rem); }
        .menu {
            position: absolute; top: calc(100% + var(--lumo-space-xs, 4px)); right: 0; min-width: 15rem; max-width: 20rem;
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1f2a37);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            padding: 0.3rem; z-index: 300;
        }
        .who { display: flex; gap: 0.7rem; align-items: center; padding: 0.5rem; }
        .names { min-width: 0; }
        .name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .email {
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-secondary-text-color, #5a6573);
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .separator { height: 1px; margin: 0.3rem 0; background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08)); }
        .item {
            display: block; width: 100%; text-align: start; font: inherit; color: inherit;
            background: transparent; border: none; border-radius: var(--lumo-border-radius-s, 0.2rem);
            padding: 0.5rem; min-height: 2.25rem; cursor: pointer;
        }
        .item:hover { background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.05)); }
    `
}
