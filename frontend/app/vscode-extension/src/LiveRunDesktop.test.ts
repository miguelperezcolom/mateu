import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// execFile answers what the OS would: the probe (is the desktop app installed?) and the open command.
const answers: Array<[number, string]> = []
const calls: string[][] = []
vi.mock('node:child_process', () => ({
    execFile: (command: string, args: string[], _opts: unknown, cb: (e: unknown, out: string) => void) => {
        calls.push([command, ...args])
        const [code, out] = answers.shift() ?? [0, '']
        cb(code === 0 ? null : { code }, out)
    },
}))

import * as vscode from 'vscode'
import { fake } from './test/vscode'
import { LiveRunCommand } from './LiveRunCommand'
import { DESKTOP_DOWNLOAD_URL, desktopProbeOf } from './liveRun'

const APP = 'http://localhost:8080'

describe('Live Run: the desktop target opens the Mateu desktop app (a separate IntelliJ)', () => {
    beforeEach(() => {
        answers.length = 0
        calls.length = 0
        fake.messages.length = 0
        fake.opened.length = 0
        fake.messageAnswer = undefined
    })
    afterEach(() => { (LiveRunCommand as any).appUrl = undefined })

    // a probe that finds the app on this platform, then the open command
    const installedThenOpen = (openCode: number) => {
        const probe = desktopProbeOf(process.platform)
        if (probe) answers.push(process.platform === 'linux' ? [0, 'mateu.desktop\n'] : [0, '/Applications/Mateu.app\n'])
        answers.push([openCode, ''])
    }

    it('installed: the hub link goes to the OS and nothing is asked', async () => {
        installedThenOpen(0)
        await LiveRunCommand.openInDesktopApp(APP)
        expect(calls.at(-1)!.join(' ')).toContain('mateu://')
        expect(fake.messages).toEqual([])
    })

    it('installed but it did not open: says so, with the download and the browser one click away', async () => {
        installedThenOpen(1)
        fake.messageAnswer = 'Open in the browser instead'
        await LiveRunCommand.openInDesktopApp(APP)
        expect(fake.messages.at(-1)).toMatchObject({ level: 'info', text: `Mateu: the desktop app did not open ${APP}.` })
        expect(fake.opened).toEqual([vscode.Uri.parse(APP).toString()])
    })

    it('not installed: offers the download', async () => {
        answers.push([1, ''])
        fake.messageAnswer = 'Download the Mateu desktop app'
        await LiveRunCommand.openInDesktopApp(APP)
        expect(fake.messages.at(-1)!.text).toMatch(/not installed/)
        expect(fake.messages.at(-1)!.items).toEqual(['Download the Mateu desktop app', 'Open in the browser instead'])
        expect(fake.opened).toEqual([vscode.Uri.parse(DESKTOP_DOWNLOAD_URL).toString()])
    })

    it('not installed and dismissed: opens nothing', async () => {
        answers.push([1, ''])
        await LiveRunCommand.openInDesktopApp(APP)
        expect(fake.opened).toEqual([])
    })

    it('a probe that cannot start counts as not installed', async () => {
        answers.push([-1, ''])
        await LiveRunCommand.openInDesktopApp(APP)
        expect(fake.messages.at(-1)!.text).toMatch(/not installed/)
    })
})
