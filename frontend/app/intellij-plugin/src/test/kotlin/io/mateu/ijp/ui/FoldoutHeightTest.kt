package io.mateu.ijp.ui

/**
 * A block that grows AFTER the page was stacked, inside a sideways scroller (a record page's foldout:
 * the front office's Huéspedes / Operaciones / Perfil): the page around it grows too — the climb
 * used to stop at the scroller and the operations cockpit was cut at its third row.
 */
class FoldoutHeightTest : junit.framework.TestCase() {
    fun testABlockThatGrowsInsideASidewaysScrollerRegrowsThePage() {
        val page = verticalPanel(0)
        val slot = javax.swing.JPanel(java.awt.BorderLayout())
        slot.add(javax.swing.JLabel("small"), java.awt.BorderLayout.CENTER)
        val sideways = ContentHeightScrollPane(slot)
        val band = javax.swing.JPanel(java.awt.BorderLayout()).apply { add(sideways) }
        page.addStacked(band, 0)
        val before = band.maximumSize.height
        slot.removeAll()
        slot.add(javax.swing.JPanel().apply { preferredSize = java.awt.Dimension(100, before + 300) })
        regrowStacked(slot)
        assertTrue("band max ${band.maximumSize.height} after growing from $before", band.maximumSize.height >= before + 300)
    }
}
