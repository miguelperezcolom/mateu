import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { dirname, join } from 'path'
import * as http from 'http'
import {
    copyInto, imageFileOf, imageToken, imageUrlPath, isImage, isWritableSpecPath, listImages, moduleRootOf, servedUrl, targetDir,
} from './projectImages'
import { BackendProxy } from './backendProxy'

const touch = (root: string, rel: string, content = 'x') => {
    const f = join(root, ...rel.split('/'))
    mkdirSync(dirname(f), { recursive: true })
    writeFileSync(f, content)
    return f
}
const folder = (name: string) => mkdtempSync(join(tmpdir(), `mateu-img-${name}-`))

describe('project images: what the picker lists', () => {
    it('serves a file under a web root at the path below it', () => {
        expect(servedUrl('src/main/resources/static/img/hero.jpg')).toBe('/img/hero.jpg')
        expect(servedUrl('src/main/resources/public/a.png')).toBe('/a.png')
        expect(servedUrl('src/main/resources/META-INF/resources/webjars/x.svg')).toBe('/webjars/x.svg')
        expect(servedUrl('public/logo.png')).toBe('/logo.png')
        expect(servedUrl('wwwroot/images/a.webp')).toBe('/images/a.webp')
        expect(servedUrl('app/static/x.avif')).toBe('/x.avif')
        expect(servedUrl('src/main/resources/specs/ui/x.png')).toBeUndefined()
        expect(servedUrl('docs/x.png')).toBeUndefined()
    })

    it('lists the images of the web roots and skips build output', () => {
        const m = folder('list')
        touch(m, 'pom.xml')
        touch(m, 'src/main/resources/static/img/hero.jpg')
        touch(m, 'src/main/resources/static/img/notes.txt')
        touch(m, 'src/main/resources/public/brand/logo.svg')
        touch(m, 'target/classes/static/img/hero.jpg')
        touch(m, 'node_modules/pkg/public/x.png')
        touch(m, 'dist/public/y.png')
        touch(m, 'docs/screenshot.png')
        expect(listImages(m)).toEqual([
            { path: 'src/main/resources/public/brand/logo.svg', url: '/brand/logo.svg' },
            { path: 'src/main/resources/static/img/hero.jpg', url: '/img/hero.jpg' },
        ])
        expect(isImage('a.JPG')).toBe(true)
        expect(isImage('a.yaml')).toBe(false)
    })

    it('the module is the nearest folder with a build file', () => {
        const p = folder('module')
        touch(p, 'pom.xml')
        touch(p, 'app/pom.xml')
        const page = touch(p, 'app/src/main/resources/specs/ui/welcome.yaml')
        expect(moduleRootOf(page)).toBe(join(p, 'app'))
    })

    it('adds into the images folder of the module\'s kind, never over an existing file', () => {
        const java = folder('java'); touch(java, 'pom.xml')
        const dotnet = folder('dotnet'); touch(dotnet, 'Shop.csproj')
        const python = folder('python'); touch(python, 'pyproject.toml')
        const existing = folder('existing'); touch(existing, 'public/favicon.ico')
        expect(targetDir(java)).toBe(join(java, 'src', 'main', 'resources', 'static', 'images'))
        expect(targetDir(dotnet)).toBe(join(dotnet, 'wwwroot', 'images'))
        expect(targetDir(python)).toBe(join(python, 'static', 'images'))
        expect(targetDir(existing)).toBe(join(existing, 'public', 'images'))
        const source = touch(folder('downloads'), 'hero.jpg')
        expect(copyInto(java, source)).toEqual({ path: 'src/main/resources/static/images/hero.jpg', url: '/images/hero.jpg' })
        expect(copyInto(java, source).url).toBe('/images/hero-1.jpg')
        expect(existsSync(join(java, 'src/main/resources/static/images/hero-1.jpg'))).toBe(true)
        expect(() => copyInto(java, touch(folder('x'), 'notes.txt'))).toThrow()
    })
})

describe('project images: served by the loopback server', () => {
    const proxy = new BackendProxy()
    afterAll(() => proxy.dispose())

    it('answers a registered module\'s images and nothing else', async () => {
        const m = folder('served')
        touch(m, 'src/main/resources/static/img/hero image.png', 'PNG!')
        touch(m, 'secret.yaml')
        const token = proxy.registerImageRoot(m)
        expect(token).toBe(imageToken(m))
        const url = imageUrlPath(token, 'src/main/resources/static/img/hero image.png')
        expect(url).toContain('hero%20image.png')
        const roots = new Map([[token, m]])
        expect(imageFileOf(roots, url)?.contentType).toBe('image/png')
        expect(imageFileOf(roots, `/__mateu-images/${token}/secret.yaml`)).toBeUndefined()
        expect(imageFileOf(roots, `/__mateu-images/${token}/../../etc/passwd.png`)).toBeUndefined()
        expect(imageFileOf(roots, `/__mateu-images/nope/x.png`)).toBeUndefined()

        const port = await proxy.ensureStarted('http://localhost:1')
        const get = (p: string) => new Promise<{ status: number; type?: string; body: string }>((resolve, reject) => {
            http.get({ host: '127.0.0.1', port, path: p }, (res) => {
                let body = ''
                res.on('data', (c) => (body += c))
                res.on('end', () => resolve({ status: res.statusCode ?? 0, type: res.headers['content-type'], body }))
            }).on('error', reject)
        })
        expect(await get(url)).toEqual({ status: 200, type: 'image/png', body: 'PNG!' })
        expect((await get(`/__mateu-images/${token}/secret.yaml`)).status).toBe(404)
    })
})

describe('the board writes only mount files', () => {
    it('accepts a YAML path under specs/ui and nothing else', () => {
        expect(isWritableSpecPath('routes.yaml')).toBe(true)
        expect(isWritableSpecPath('sales/orders.yml')).toBe(true)
        for (const p of ['', '/etc/x.yaml', '../pom.xml', 'a/../../x.yaml', 'C:/x.yaml', 'x.json', 'a\\..\\x.yaml']) expect(isWritableSpecPath(p), p).toBe(false)
    })
})
