package io.mateu.ijp.hub

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.fileChooser.FileChooser
import com.intellij.openapi.fileChooser.FileChooserDescriptorFactory
import com.intellij.openapi.ide.CopyPasteManager
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.Messages
import com.intellij.ui.ColoredListCellRenderer
import com.intellij.ui.SearchTextField
import com.intellij.ui.SimpleTextAttributes
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import io.mateu.ijp.live.QrPanel
import io.mateu.ijp.ui.SafeHtml
import io.mateu.ijp.ui.plain
import io.mateu.ijp.ui.plainTip
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.awt.FlowLayout
import java.awt.Graphics
import java.awt.Graphics2D
import java.awt.RenderingHints
import java.awt.datatransfer.DataFlavor
import java.awt.datatransfer.StringSelection
import java.awt.event.KeyEvent
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.Box
import javax.swing.BoxLayout
import javax.swing.DefaultListModel
import javax.swing.Icon
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JList
import javax.swing.JPanel
import javax.swing.KeyStroke
import javax.swing.ListSelectionModel
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener

/** Development builds accept plain-http UIs (`-Dmateu.hub.allowInsecure=true`), like the app's dev build. */
fun hubOptions(): HubLinks.Options =
    HubLinks.Options(allowInsecure = System.getProperty("mateu.hub.allowInsecure")?.toBoolean() == true)

/**
 * The desktop hub's home — "My UIs": the list, a search box, Add / Open / Share / Remove / reorder and
 * Export (a QR to move the whole list to a phone). Shown in the Mateu panel whenever no UI is open.
 */
class HubPanel(
    private val project: Project,
    private val store: HubStore,
    private val onOpen: (HubEntry, String?) -> Unit,
) : JPanel(BorderLayout()) {

    private val model = DefaultListModel<HubEntry>()
    private val list = JBList(model).apply {
        selectionMode = ListSelectionModel.SINGLE_SELECTION
        cellRenderer = EntryRenderer()
        emptyText.text = "No UIs yet"
        emptyText.appendSecondaryText("Add a UI", SimpleTextAttributes.LINK_PLAIN_ATTRIBUTES) { addUi() }
        accessibleContext.accessibleName = "My UIs"
    }
    private val search = SearchTextField(false).apply {
        textEditor.emptyText.text = "Search my UIs"
        textEditor.accessibleContext.accessibleName = "Search my UIs"
    }
    private val unsubscribe: () -> Unit

    init {
        border = JBUI.Borders.empty(8)
        val title = JBLabel("My UIs").apply { font = JBUI.Fonts.label(16f).asBold() }
        val header = JPanel(BorderLayout(0, JBUI.scale(6))).apply {
            add(title, BorderLayout.NORTH)
            add(search, BorderLayout.CENTER)
        }
        add(header, BorderLayout.NORTH)
        add(JBScrollPane(list), BorderLayout.CENTER)
        add(buttons(), BorderLayout.SOUTH)

        list.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                if (e.clickCount == 2) selected()?.let { onOpen(it, null) }
            }
        })
        list.registerKeyboardAction({ selected()?.let { onOpen(it, null) } }, KeyStroke.getKeyStroke(KeyEvent.VK_ENTER, 0), WHEN_FOCUSED)
        list.registerKeyboardAction({ selected()?.let(::remove) }, KeyStroke.getKeyStroke(KeyEvent.VK_DELETE, 0), WHEN_FOCUSED)
        search.addDocumentListener(object : DocumentListener {
            override fun insertUpdate(e: DocumentEvent) = refresh()
            override fun removeUpdate(e: DocumentEvent) = refresh()
            override fun changedUpdate(e: DocumentEvent) = refresh()
        })
        unsubscribe = store.subscribe { refresh() }
        refresh()
    }

    override fun removeNotify() {
        super.removeNotify()
        unsubscribe()
    }

    private fun selected(): HubEntry? = list.selectedValue

    private fun refresh() {
        val keep = selected()?.id
        model.clear()
        store.list.search(search.text).forEach(model::addElement)
        (0 until model.size()).firstOrNull { model[it].id == keep }?.let { list.selectedIndex = it }
            ?: run { if (model.size() > 0) list.selectedIndex = 0 }
    }

    private fun buttons(): JComponent = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), JBUI.scale(4))).apply {
        add(JButton("Add a UI…").apply { addActionListener { addUi() } })
        add(JButton("Open").apply { addActionListener { selected()?.let { onOpen(it, null) } } })
        add(JButton("Share…").apply {
            toolTipText = "The QR code of this UI, to open it on a phone"
            addActionListener { selected()?.let { ShareDialog(project, "Share ${it.name}", HubLinks.addLink(it.baseUrl), "Scan it with a phone: it opens ${HubLinks.domainOf(it.baseUrl)} in the Mateu app.").show() } }
        })
        add(JButton("↑").apply {
            accessibleContext.accessibleName = "Move up"
            toolTipText = "Move up"
            addActionListener { selected()?.let { e -> store.edit { it.move(e.id, -1) } } }
        })
        add(JButton("↓").apply {
            accessibleContext.accessibleName = "Move down"
            toolTipText = "Move down"
            addActionListener { selected()?.let { e -> store.edit { it.move(e.id, 1) } } }
        })
        add(JButton("Remove").apply { addActionListener { selected()?.let(::remove) } })
        add(JButton("Export…").apply {
            toolTipText = "One QR code with every UI of the list (addresses only, never sign-ins)"
            addActionListener {
                val urls = store.list.entries.map { it.baseUrl }
                if (urls.isNotEmpty()) ShareDialog(project, "Export my UIs", HubLinks.exportLink(urls), "Scan it with a phone to add these ${urls.size} UIs to its Mateu app. It carries addresses only — no sign-ins.").show()
            }
        })
    }

    private fun remove(entry: HubEntry) {
        val ok = Messages.showYesNoDialog(project, "Remove ${entry.name} (${HubLinks.domainOf(entry.baseUrl)}) from this app? You will be signed out of it.", "Remove UI", Messages.getQuestionIcon())
        if (ok == Messages.YES) {
            store.edit { it.remove(entry.id) }
            forgetSignIn(entry)
        }
    }

    fun addUi() {
        val dialog = AddUiDialog(project)
        if (dialog.showAndGet()) HubAdd.run(project, dialog.text(), store, onOpen)
    }

    private class EntryRenderer : ColoredListCellRenderer<HubEntry>() {
        override fun customizeCellRenderer(list: JList<out HubEntry>, value: HubEntry, index: Int, selected: Boolean, hasFocus: Boolean) {
            icon = InitialIcon(value.shortName ?: value.name, value.themeColor)
            append(value.name)
            append("  " + HubLinks.domainOf(value.baseUrl), SimpleTextAttributes.GRAYED_ATTRIBUTES)
            accessibleContext?.accessibleName = "${value.name}, ${HubLinks.domainOf(value.baseUrl)}"
        }
    }
}

/** A round badge with the UI's initial in its theme colour (the manifest's icon is a remote image; the
 *  initial needs no request to a server the user may not have opened yet). */
class InitialIcon(name: String, colour: String?) : Icon {
    private val letter = name.trim().firstOrNull()?.uppercaseChar()?.toString() ?: "?"
    private val fill = colour?.let { runCatching { Color.decode(if (it.length == 4) "#" + it.drop(1).flatMap { c -> listOf(c, c) }.joinToString("") else it) }.getOrNull() }
        ?: Color(0x1f, 0x6f, 0xeb)
    private val size = JBUI.scale(22)

    override fun paintIcon(c: Component?, g: Graphics, x: Int, y: Int) {
        val g2 = g.create() as Graphics2D
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        g2.color = fill
        g2.fillOval(x, y, size, size)
        val lum = (0.299 * fill.red + 0.587 * fill.green + 0.114 * fill.blue) / 255
        g2.color = if (lum > 0.6) Color(0x20, 0x1e, 0x1c) else Color.WHITE
        g2.font = JBUI.Fonts.label(11f).asBold()
        val fm = g2.fontMetrics
        g2.drawString(letter, x + (size - fm.stringWidth(letter)) / 2, y + (size - fm.height) / 2 + fm.ascent)
        g2.dispose()
    }

    override fun getIconWidth() = size
    override fun getIconHeight() = size
}

/** "Add a UI": paste or type an address / Mateu link, or read a QR code from the screen, the clipboard or a file. */
class AddUiDialog(private val project: Project, initial: String = "") : DialogWrapper(project, false) {
    private val field = JBTextField(initial, 40).apply {
        emptyText.text = "crm.acme.com, or a Mateu link"
        accessibleContext.accessibleName = "Address or Mateu link"
    }
    private val status = JBLabel(" ")

    init {
        title = "Add a UI"
        setOKButtonText("Continue")
        init()
    }

    fun text(): String = field.text

    override fun getPreferredFocusedComponent(): JComponent = field

    override fun createCenterPanel(): JComponent {
        val panel = JPanel().apply { layout = BoxLayout(this, BoxLayout.Y_AXIS) }
        panel.add(JBLabel("Address of the UI, or a Mateu link (mateu://add?…, https://mateu.io/add?…):").apply { alignmentX = 0f; labelFor = field })
        panel.add(Box.createVerticalStrut(JBUI.scale(4)))
        panel.add(field.apply { alignmentX = 0f })
        panel.add(Box.createVerticalStrut(JBUI.scale(10)))
        panel.add(JBLabel("Or read its QR code:").apply { alignmentX = 0f })
        panel.add(JPanel(FlowLayout(FlowLayout.LEFT, 0, JBUI.scale(4))).apply {
            alignmentX = 0f
            add(JButton("From the screen").apply {
                toolTipText = "Reads a QR code shown anywhere on your screens (macOS asks for the Screen Recording permission)"
                addActionListener { scan("on your screens", HubQr::fromScreens, "No QR code found on the screen. On macOS, allow Screen Recording for Mateu (System Settings › Privacy & Security), or copy the code as an image and use “From the clipboard”.") }
            })
            add(Box.createHorizontalStrut(JBUI.scale(6)))
            add(JButton("From the clipboard").apply {
                addActionListener {
                    val text = runCatching { CopyPasteManager.getInstance().getContents<String>(DataFlavor.stringFlavor) }.getOrNull()
                    if (HubQr.clipboardImage() == null && !text.isNullOrBlank()) {
                        field.text = text.trim()
                        status.text = "Pasted the link from the clipboard."
                    } else {
                        scan("in the clipboard image", HubQr::fromClipboard, "The clipboard holds no image with a QR code.")
                    }
                }
            })
            add(Box.createHorizontalStrut(JBUI.scale(6)))
            add(JButton("From an image…").apply {
                addActionListener {
                    val file = FileChooser.chooseFile(FileChooserDescriptorFactory.createSingleFileDescriptor().withFileFilter { it.extension?.lowercase() in setOf("png", "jpg", "jpeg", "gif", "bmp") }, project, null)
                        ?: return@addActionListener
                    scan("in ${file.name}", { HubQr.fromFile(java.io.File(file.path)) }, "No QR code found in ${file.name}.")
                }
            })
        })
        panel.add(Box.createVerticalStrut(JBUI.scale(6)))
        panel.add(status.apply { alignmentX = 0f })
        return panel
    }

    private fun scan(where: String, read: () -> List<String>, none: String) {
        val texts = ProgressManager.getInstance().runProcessWithProgressSynchronously<List<String>, Exception>(read, "Reading QR codes $where", true, project)
        val picked = HubQr.pick(texts, hubOptions())
        if (picked == null) {
            status.text = plain(none)
        } else {
            field.text = picked
            status.text = if (texts.size > 1) "Found ${texts.size} codes; using the Mateu one." else "Read the QR code."
        }
    }

    override fun doValidate() = if (field.text.isBlank()) com.intellij.openapi.ui.ValidationInfo("Enter an address or a link", field) else null
}

/** Confirms adding ONE UI, the domain big (a code can come from anyone — the domain is what the user trusts). */
class ConfirmAddDialog(project: Project, private val proposal: HubFlow.Proposal.AddOne) : DialogWrapper(project, false) {
    init {
        title = if (proposal.existing != null) "Open UI" else "Add this UI?"
        setOKButtonText(if (proposal.existing != null) "Open" else "Add and open")
        init()
    }

    override fun createCenterPanel(): JComponent {
        val m = proposal.manifest
        val panel = JPanel().apply {
            layout = BoxLayout(this, BoxLayout.Y_AXIS)
            border = JBUI.Borders.empty(4, 0)
        }
        panel.add(JBLabel(plain(HubLinks.domainOf(proposal.baseUrl))).apply { font = JBUI.Fonts.label(20f).asBold(); alignmentX = 0f })
        panel.add(Box.createVerticalStrut(JBUI.scale(4)))
        panel.add(JBLabel(plain(m.name)).apply { alignmentX = 0f })
        panel.add(JBLabel(plain(proposal.baseUrl + (proposal.route ?: ""))).apply { foreground = JBUI.CurrentTheme.ContextHelp.FOREGROUND; alignmentX = 0f })
        m.auth?.let { auth ->
            panel.add(Box.createVerticalStrut(JBUI.scale(8)))
            panel.add(JBLabel(plain("You will sign in at ${HubLinks.domainOf(auth.issuer)}.")).apply { alignmentX = 0f })
        }
        if (proposal.existing != null) {
            panel.add(Box.createVerticalStrut(JBUI.scale(8)))
            panel.add(JBLabel("It is already in your list.").apply { alignmentX = 0f })
        } else {
            panel.add(Box.createVerticalStrut(JBUI.scale(8)))
            panel.add(JBLabel("Only add UIs from sources you trust.").apply { foreground = JBUI.CurrentTheme.ContextHelp.FOREGROUND; alignmentX = 0f })
        }
        return panel
    }
}

/** A QR code + the link, copyable (Share one UI / Export the list). */
class ShareDialog(project: Project, title: String, private val link: String, private val hint: String) : DialogWrapper(project, false) {
    init {
        this.title = title
        setOKButtonText("Close")
        init()
    }

    override fun createActions() = arrayOf(okAction)

    override fun createCenterPanel(): JComponent = JPanel(BorderLayout(0, JBUI.scale(12))).apply {
        add(JBLabel(plain(hint)), BorderLayout.NORTH)
        add(QrPanel(link, "QR code: $hint"), BorderLayout.CENTER)
        add(ActionLink("Copy link") { CopyPasteManager.getInstance().setContents(StringSelection(link)) }.apply { toolTipText = plainTip(link) }, BorderLayout.SOUTH)
    }
}

/** Adding something the user brought: propose (in the background), confirm, store, open. */
object HubAdd {
    fun run(project: Project, raw: String, store: HubStore, onOpen: (HubEntry, String?) -> Unit) {
        val proposal = ProgressManager.getInstance().runProcessWithProgressSynchronously<HubFlow.Proposal, Exception>(
            { HubFlow.propose(raw, store.list, options = hubOptions()) },
            "Looking up the UI",
            true,
            project,
        )
        when (proposal) {
            is HubFlow.Proposal.Refused -> Messages.showErrorDialog(project, proposal.reason, "Can't Add This UI")
            is HubFlow.Proposal.AddOne -> {
                if (!ConfirmAddDialog(project, proposal).showAndGet()) return
                val entry = proposal.existing ?: store.edit { it.add(proposal.baseUrl, proposal.manifest).first }
                onOpen(entry, proposal.route)
            }
            is HubFlow.Proposal.ImportMany -> {
                val new = proposal.baseUrls.size - proposal.alreadyThere
                val lines = proposal.baseUrls.joinToString("\n") { "• " + HubLinks.domainOf(it) }
                val skipped = if (proposal.rejected > 0) "\n\n${proposal.rejected} unusable address(es) were skipped." else ""
                if (new == 0) {
                    Messages.showInfoMessage(project, "All of them are already in your list:\n$lines$skipped", "Import UIs")
                    return
                }
                val ok = Messages.showYesNoDialog(project, "Add $new UI(s) to your list?\n$lines$skipped\n\nOnly add UIs from sources you trust.", "Import UIs", Messages.getQuestionIcon())
                if (ok == Messages.YES) store.edit { it.importAll(proposal.baseUrls) }
            }
        }
    }

    /** A `mateu://` link the OS handed over: the same flow, with the link pre-filled, on the EDT. */
    fun fromLink(project: Project, link: String, store: HubStore, onOpen: (HubEntry, String?) -> Unit) {
        ApplicationManager.getApplication().invokeLater { run(project, link, store, onOpen) }
    }
}
