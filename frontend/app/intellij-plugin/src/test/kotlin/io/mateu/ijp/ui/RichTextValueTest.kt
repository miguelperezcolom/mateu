package io.mateu.ijp.ui

import junit.framework.TestCase

/** Same contract as libs/mateu's richTextValue.test.ts and React Native's richTextValue.test.ts. */
class RichTextValueTest : TestCase() {

    fun testALegacyDeltaValueOpensAsHtml() {
        assertEquals("<p><strong>Hi</strong></p>", RichTextValue.html("""[{"insert":"Hi","attributes":{"bold":true}},{"insert":"\n"}]"""))
        assertEquals(
            "<p>a</p><ul><li>b</li></ul>",
            RichTextValue.html("""{"ops":[{"insert":"a\n"},{"insert":"b"},{"insert":"\n","attributes":{"list":"bullet"}}]}"""),
        )
    }

    fun testHtmlAndPlainTextPassThrough() {
        assertEquals("<p>Guest prefers a <strong>quiet</strong> room</p>", RichTextValue.html("<p>Guest prefers a <strong>quiet</strong> room</p>"))
        assertEquals("[not json", RichTextValue.html("[not json"))
        assertEquals("", RichTextValue.html(null))
    }

    fun testUnsafeLinksAreDroppedAndTextIsEscaped() {
        assertEquals("<p>x&lt;y</p>", RichTextValue.html("""[{"insert":"x<y","attributes":{"link":"javascript:alert(1)"}},{"insert":"\n"}]"""))
    }
}
