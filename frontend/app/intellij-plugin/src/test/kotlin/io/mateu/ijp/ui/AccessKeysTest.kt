package io.mateu.ijp.ui

import io.mateu.ijp.ui.AccessKeys.Item
import io.mateu.ijp.ui.AccessKeys.Key
import junit.framework.TestCase

/** Unit tests for the automatic access-key assignment (`@App(accessKeys = true)`). */
class AccessKeysTest : TestCase() {

    private fun keys(vararg labels: String) = AccessKeys.assign(labels.map { Item(it) })

    fun testFirstLetterOfTheLabelWhenFree() {
        assertEquals(listOf(Key('S', 0), Key('C', 0)), keys("Save", "Cancel"))
    }

    fun testInitialOfALaterWordBeforeAnyOtherLetter() {
        // "Save" takes S, so "Save draft" falls back to the D of its second word, not the A of Save
        assertEquals(listOf(Key('S', 0), Key('D', 5)), keys("Save", "Save draft"))
    }

    fun testAnyLetterOfTheLabelWhenEveryInitialIsTaken() {
        assertEquals(listOf(Key('S', 0), Key('E', 1)), keys("Save", "Send"))
    }

    fun testInitialsAreHandedOutBeforeInnerLetters() {
        // the second pass must not let "Search" steal the E that is "Edit"'s initial
        val k = keys("Save", "Search", "Edit")
        assertEquals(Key('S', 0), k[0])
        assertEquals(Key('E', 0), k[2])
        assertEquals(Key('A', 2), k[1])
    }

    fun testNoDuplicatesAndNullWhenNothingIsLeft() {
        val k = keys("A", "A", "AB")
        assertEquals(Key('A', 0), k[0])
        assertNull(k[1])
        assertEquals(Key('B', 1), k[2])
    }

    fun testDeclaredAltShortcutIsTheKeyAndIsReservedFirst() {
        val k = AccessKeys.assign(listOf(Item("Save"), Item("Submit", "alt+s")))
        assertEquals(Key('S', -1), k[1])
        assertEquals(Key('A', 1), k[0])
    }

    fun testAnyOtherDeclaredShortcutTakesNoLetter() {
        val k = AccessKeys.assign(listOf(Item("Save", "ctrl+s"), Item("Send")))
        assertNull(k[0])
        assertEquals(Key('S', 0), k[1])
    }

    fun testOnlyAsciiLettersAndDigitsQualify() {
        // glyphs and accented letters cannot be a Swing mnemonic (a VK_ code)
        val k = keys("✕", "Éxito", "1 día")
        assertNull(k[0])
        assertEquals(Key('X', 1), k[1])
        assertEquals(Key('1', 0), k[2])
    }
}
