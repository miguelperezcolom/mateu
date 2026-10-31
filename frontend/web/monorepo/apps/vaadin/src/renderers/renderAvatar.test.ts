// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { renderAvatar } from './renderAvatar'

/** vaadin-avatar: its image URL interpolates (`image: ${state.thumbnail}` was requested literally, a 404). */
describe('the Vaadin avatar', () => {
    it('loads the interpolated image and names the person', () => {
        const host = document.createElement('div')
        const component = { type: 'ClientSide', id: 'a', metadata: { type: 'Avatar', name: '${state.name}', image: '${state.thumbnail}' }, children: [] }
        render(renderAvatar(component as unknown as ClientSideComponent, { name: 'Sally Ride', thumbnail: '/img/sally.jpg' }, {}), host)
        const avatar = host.querySelector('vaadin-avatar')!
        expect(avatar.getAttribute('img')).toBe('/img/sally.jpg')
        expect(avatar.getAttribute('name')).toBe('Sally Ride')
    })
})
