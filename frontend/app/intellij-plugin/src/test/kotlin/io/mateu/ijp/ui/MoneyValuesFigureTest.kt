package io.mateu.ijp.ui

import junit.framework.TestCase
import java.util.Locale

class MoneyValuesFigureTest : TestCase() {
    fun testABareBigNumberReadsAsAFigure() {
        assertEquals("7.900.000", MoneyValues.figureText("7900000", Locale.forLanguageTag("es-ES")))
        assertEquals("7,900,000.5", MoneyValues.figureText("7900000.5", Locale.US))
    }

    fun testAYearOrATextStaysAsWritten() {
        assertNull(MoneyValues.figureText("1870", Locale.US))
        assertNull(MoneyValues.figureText("Ancestors and Spirits", Locale.US))
    }

    fun testAWholeDecimalIsEditedWithoutItsPointZero() {
        assertEquals("7900000", MoneyValues.editText("7900000.0"))
        assertEquals("12.5", MoneyValues.editText("12.5"))
        assertEquals("18000000", MoneyValues.editText("1.8E7"))
        assertEquals("18.000.000", MoneyValues.figureText("1.8E7", Locale.forLanguageTag("es-ES")))
        assertEquals("abc", MoneyValues.editText("abc"))
    }
}
