package io.mateu.ijp.ui

import io.mateu.ijp.api.BuildSkew
import io.mateu.ijp.state.NoticeTexts
import junit.framework.TestCase
import java.util.Locale

/** The plugin's own words follow the UI locale's language; one it does not speak is English. */
class ChromeLanguageTest : TestCase() {

    private fun tag(t: String): Locale = Locale.forLanguageTag(t)

    fun testThePrimaryLanguagePicks() {
        assertEquals("es", ChromeLanguage.of(tag("es-ES")))
        assertEquals("fr", ChromeLanguage.of(tag("fr-CA")))
        assertEquals("de", ChromeLanguage.of(tag("de-AT")))
        assertEquals("pt", ChromeLanguage.of(tag("pt-BR")))
        assertEquals("pt", ChromeLanguage.of(tag("pt-PT")))
        assertEquals("it", ChromeLanguage.of(tag("it")))
        assertEquals("en", ChromeLanguage.of(tag("en-GB")))
        assertEquals("en", ChromeLanguage.of(tag("nl-NL")))
        assertEquals("en", ChromeLanguage.of(tag("ja")))
        assertEquals("en", ChromeLanguage.of(null))
    }

    fun testNoticeActionsAndTheSkewNoticeSpeakEveryLanguage() {
        assertEquals("Réessayer", NoticeTexts.retry(tag("fr")))
        assertEquals("Rückgängig", NoticeTexts.undo(tag("de-AT")))
        assertEquals("2 de 7", NoticeTexts.count(2, 7, tag("pt-BR")))
        assertEquals("Notifiche", NoticeTexts.notifications(tag("it")))
        assertEquals("Retry", NoticeTexts.retry(tag("nl")))
        assertEquals("Recharger", BuildSkew.texts(tag("fr")).reload)
        assertEquals("Neu laden", BuildSkew.texts(tag("de-CH")).reload)
        assertEquals("Recarregar", BuildSkew.texts(tag("pt-PT")).reload)
        assertEquals("Ricarica", BuildSkew.texts(tag("it-IT")).reload)
        assertEquals("Reload", BuildSkew.texts(tag("ja")).reload)
        for (lang in ChromeLanguage.LANGUAGES) {
            val l = tag(lang)
            for (word in listOf(NoticeTexts.undo(l), NoticeTexts.cancel(l), NoticeTexts.markAllRead(l), BuildSkew.texts(l).stale)) {
                assertTrue("$lang: blank", word.isNotBlank())
            }
            if (lang != "en") assertFalse("$lang still English", NoticeTexts.markAllRead(l) == "Mark all read")
        }
    }
}
