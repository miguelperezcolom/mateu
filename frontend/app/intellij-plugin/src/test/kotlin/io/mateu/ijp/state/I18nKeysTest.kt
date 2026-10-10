package io.mateu.ijp.state

import junit.framework.TestCase

/** An unresolved `${i18n.key}` (the server normally resolves it) renders as the key, not blank. */
class I18nKeysTest : TestCase() {
    fun testUnresolvedTranslationShowsTheKey() {
        assertEquals("orders.title", Expressions.interpolate("\${i18n.orders.title}", emptyMap()))
        assertEquals("New orders.new!", Expressions.interpolate("New \${ i18n.orders.new }!", emptyMap()))
        assertEquals("x 3", Expressions.interpolate("x \${state.n}", mapOf("state" to mapOf("n" to 3))))
    }
}
