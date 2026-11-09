import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

/**
 * How a running task's ETA reads (`ProgressDto.etaSeconds`, estimated by the SERVER from the
 * observed rate — design/progress-and-notifications.md "ETA"). The rule is the corpus
 * conformance/client/eta-format.json, run by every renderer: no estimate (null, not a number,
 * ≤ 0) shows nothing — never a guess.
 */
export const etaText = (etaSeconds: number | null | undefined, lang?: string): string | null => {
    if (typeof etaSeconds !== 'number' || !Number.isFinite(etaSeconds) || etaSeconds <= 0) return null
    if (etaSeconds < 60) return chromeText('taskEtaUnderMinute', lang)
    if (etaSeconds < 3600) {
        const n = Math.max(1, Math.round(etaSeconds / 60))
        // 59.5 min rounds to 60: that is an hour
        if (n < 60) return chromeTextf('taskEtaMinutes', { n }, lang)
    }
    return chromeTextf('taskEtaHours', { n: Math.max(1, Math.round(etaSeconds / 3600)) }, lang)
}
