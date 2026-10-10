package io.mateu.ijp.visualeditor

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.util.Computable
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.event.DocumentEvent
import com.intellij.openapi.editor.event.DocumentListener
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.FileEditorState
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.openapi.util.UserDataHolderBase
import com.intellij.openapi.vfs.VfsUtilCore
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.openapi.vfs.VirtualFileManager
import com.intellij.openapi.vfs.newvfs.BulkFileListener
import com.intellij.openapi.vfs.newvfs.events.VFileEvent
import com.intellij.util.Alarm
import com.intellij.ui.jcef.JBCefApp
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefJSQuery
import io.mateu.ijp.plugin.loadMateuConfig
import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.handler.CefLoadHandlerAdapter
import java.beans.PropertyChangeListener
import javax.swing.JComponent
import javax.swing.JLabel

/**
 * The Mateu visual editor as a JCEF-hosted web view — the SAME web bundle (`apps/visual-editor`)
 * that runs in a browser and (next) in VSCode. It loads from the in-plugin [MateuVisualEditorServer]
 * (which serves the bundle and proxies `/mateu` to the backend), bridges the web app's HostBridge
 * over a JCEF query pipe (web→IDE) and `window.postMessage` (IDE→web): on every edit the web app
 * posts `contentChanged` with the YAML, and the IDE seeds the open file's text via `init`.
 *
 * Saving is the IDE's NATIVE mechanism, not a button: an edit only updates the in-memory Document
 * (which marks the tab modified); the file is written by the user's own Ctrl+S / save-all / the IDE's
 * save policy — never by this editor.
 */
class MateuVisualEditor(
    private val project: Project,
    private val file: VirtualFile,
) : UserDataHolderBase(), FileEditor {

    private val mapper = ObjectMapper()
    private val listeners = java.util.concurrent.CopyOnWriteArrayList<PropertyChangeListener>()

    /** True while WE push YAML into the Document, so our own edit is not echoed back as an externalChange. */
    private var applyingFromWeb = false

    private val browser: JBCefBrowser? = if (JBCefApp.isSupported()) JBCefBrowser() else null
    private val query: JBCefJSQuery? = browser?.let { JBCefJSQuery.create(it as com.intellij.ui.jcef.JBCefBrowserBase) }
    private val fallback: JComponent? = if (browser == null) JLabel("JCEF is not available in this IDE runtime.") else null

    /** Coalesces bursts of file events (a save-all, a refactoring) into one push of the file list. */
    private val filesAlarm = Alarm(Alarm.ThreadToUse.POOLED_THREAD, this)
    private val imagesAlarm = Alarm(Alarm.ThreadToUse.POOLED_THREAD, this)

    init {
        val b = browser
        val q = query
        if (b != null && q != null) {
            q.addHandler { request -> onWebMessage(request); null }
            val port = MateuVisualEditorServer.ensureStarted(
                loadMateuConfig(project).baseUrl,
                io.mateu.ijp.auth.MateuAuthService.getInstance(project),
            )
            b.jbCefClient.addLoadHandler(object : CefLoadHandlerAdapter() {
                override fun onLoadEnd(cef: CefBrowser?, frame: CefFrame?, httpStatusCode: Int) {
                    if (frame?.isMain == true) installBridge()
                }
            }, b.cefBrowser)
            b.loadURL("http://127.0.0.1:$port/index.html")
        }
        // Out-of-band edits (the raw YAML text tab, or the file changing on disk) must reach the canvas
        // or it silently desyncs — mirror VSCode's onDidChangeTextDocument. Our own writes are skipped
        // via `applyingFromWeb` so this never feeds back into a loop.
        FileDocumentManager.getInstance().getDocument(file)?.addDocumentListener(object : DocumentListener {
            override fun documentChanged(event: DocumentEvent) {
                if (applyingFromWeb) return
                sendToWeb(mapOf("type" to "externalChange", "yaml" to event.document.text))
            }
        }, this)
        // A page/shell created, changed or deleted under specs/ui while this editor is open must reach
        // its pickers (a routes file's definition list) without reopening the editor: push the files.
        project.messageBus.connect(this).subscribe(VirtualFileManager.VFS_CHANGES, object : BulkFileListener {
            override fun after(events: List<VFileEvent>) {
                val root = specsUiRoot(file)?.path
                if (root != null && events.any { e -> isSpecsYaml(e.path, root) }) {
                    filesAlarm.cancelAllRequests()
                    filesAlarm.addRequest({ sendFiles() }, 300)
                }
                // an image added, changed or removed in the module reaches the image pickers
                val module = moduleRoot()?.toString()?.replace('\\', '/')
                if (module != null && events.any { e -> e.path.startsWith("$module/") && ProjectImages.isImage(e.path) }) {
                    imagesAlarm.cancelAllRequests()
                    imagesAlarm.addRequest({ sendImages() }, 300)
                }
            }
        })
    }

    private fun isSpecsYaml(path: String, root: String): Boolean =
        path.startsWith("$root/") && (path.endsWith(".yaml") || path.endsWith(".yml"))

    /** Drain messages queued before the pipe existed and route future ones through the JCEF query. */
    private fun installBridge() {
        val b = browser ?: return
        val q = query ?: return
        val js = """
            (function () {
              var pipe = function (m) { ${q.inject("JSON.stringify(m)")} };
              (window.__mateuOutbox || []).forEach(pipe);
              window.__mateuOutbox = [];
              window.__mateuHost.postMessage = pipe;
            })();
        """.trimIndent()
        b.cefBrowser.executeJavaScript(js, b.cefBrowser.url, 0)
    }

    private fun onWebMessage(raw: String) {
        val msg = runCatching { mapper.readTree(raw) }.getOrNull() ?: return
        when (msg.path("type").asText()) {
            "ready" -> sendInit()
            // Every edit only updates the in-memory Document (marks the tab modified). The file is
            // written by the IDE's OWN save — this editor never persists. `save` kept as an alias.
            "contentChanged", "save" -> updateDocument(msg.path("yaml").asText())
            // Project awareness: hand the whole mount to the editor so its reference pickers work.
            "listFiles" -> sendFiles()
            // The board's Edit: open another file of the mount in an editor tab of its own.
            "openFile" -> openFile(msg.path("path").asText())
            // The image pickers: the project's images, and "Add image to project…".
            "listImages" -> sendImages()
            "addImage" -> addImage()
            // The board's edits: another file of the mount written (or a file it created, deleted on undo).
            "writeFile" -> writeFile(msg.path("path").asText(), msg.path("content").let { if (it.isNull || it.isMissingNode) null else it.asText() })
        }
    }

    /**
     * Write a file of the mount (relative to its `specs/ui`) the way an IDE edit does: through its
     * Document, in an undoable command, then saved (the board's edits are explicit actions on files
     * that are not open in this editor). A new file is created, folders included; `null` deletes it.
     */
    private fun writeFile(path: String, content: String?) {
        if (!isWritableSpecPath(path)) return
        ApplicationManager.getApplication().invokeLater {
            val root = specsUiRoot(file) ?: return@invokeLater
            WriteCommandAction.runWriteCommandAction(project, "Mateu Board Edit", null, {
                val existing = root.findFileByRelativePath(path)
                if (content == null) {
                    existing?.delete(this)
                    return@runWriteCommandAction
                }
                val target = existing ?: run {
                    val dir = path.substringBeforeLast('/', "")
                    val parent = if (dir.isEmpty()) root else com.intellij.openapi.vfs.VfsUtil.createDirectoryIfMissing(root, dir)
                    parent?.createChildData(this, path.substringAfterLast('/'))
                } ?: return@runWriteCommandAction
                val doc = FileDocumentManager.getInstance().getDocument(target)
                if (doc == null) {
                    target.setBinaryContent(content.toByteArray(Charsets.UTF_8))
                } else {
                    if (target == file) applyingFromWeb = true
                    try { doc.setText(content) } finally { applyingFromWeb = false }
                    FileDocumentManager.getInstance().saveDocument(doc)
                }
            })
            filesAlarm.cancelAllRequests()
            filesAlarm.addRequest({ sendFiles() }, 150)
        }
    }

    /** The module the edited file belongs to (its images are the ones offered), or null off-disk. */
    private fun moduleRoot(): java.nio.file.Path? = moduleRootCached

    private val moduleRootCached: java.nio.file.Path? by lazy {
        runCatching { ProjectImages.moduleRootOf(file.toNioPath(), project.basePath?.let { java.nio.file.Path.of(it) }) }.getOrNull()
    }

    private fun imageEntry(token: String, found: ProjectImages.Found): Map<String, String> {
        val src = MateuVisualEditorServer.imageUrl(token, found.path)
        // same origin as the editor (the loopback server): the picker's thumbnail AND the canvas's image
        return mapOf("path" to found.path, "url" to found.url, "thumb" to src, "src" to src)
    }

    /** Push the module's images (path, served URL, a thumbnail the loopback server answers). */
    private fun sendImages() {
        val root = moduleRoot()
        val images = if (root == null) emptyList() else {
            val token = MateuVisualEditorServer.registerImageRoot(root)
            ProjectImages.list(root).map { imageEntry(token, it) }
        }
        sendToWeb(mapOf("type" to "images", "images" to images))
    }

    /** "Add image to project…": choose a file, copy it into the module's images folder, answer with it. */
    private fun addImage() {
        ApplicationManager.getApplication().invokeLater {
            val root = moduleRoot()
            val descriptor = com.intellij.openapi.fileChooser.FileChooserDescriptorFactory.createSingleFileDescriptor()
                .withTitle("Add Image to Project")
                .withFileFilter { vf -> ProjectImages.isImage(vf.name) }
            val chosen = if (root == null) null else com.intellij.openapi.fileChooser.FileChooser.chooseFile(descriptor, project, null)
            if (root == null || chosen == null) {
                sendToWeb(mapOf("type" to "imageAdded", "image" to null))
                return@invokeLater
            }
            val found = runCatching { ProjectImages.copyInto(root, chosen.toNioPath()) }.getOrNull()
            if (found == null) {
                sendToWeb(mapOf("type" to "imageAdded", "image" to null))
                return@invokeLater
            }
            // the VFS learns about the new file (and the project view shows it)
            com.intellij.openapi.vfs.LocalFileSystem.getInstance().refreshAndFindFileByNioFile(root.resolve(found.path))
            val token = MateuVisualEditorServer.registerImageRoot(root)
            sendToWeb(mapOf("type" to "imageAdded", "image" to imageEntry(token, found)))
            sendImages()
        }
    }

    /** Open a file of the mount (a path relative to its `specs/ui`) in the IDE, as the board asks. */
    private fun openFile(path: String) {
        if (path.isBlank() || path.split('/').contains("..")) return
        ApplicationManager.getApplication().invokeLater {
            val target = specsUiRoot(file)?.findFileByRelativePath(path) ?: return@invokeLater
            FileEditorManager.getInstance(project).openFile(target, true)
        }
    }

    /** Reply with every YAML file under the mount's `specs/ui` directory (path relative to it) so the
     *  editor can build its reference index. The edited file lives under `specs/ui`, one of its ancestors. */
    private fun sendFiles() {
        val files = ApplicationManager.getApplication().runReadAction(
            Computable {
                val root = specsUiRoot(file)
                if (root == null) {
                    emptyList()
                } else {
                    val out = mutableListOf<Map<String, String>>()
                    VfsUtilCore.iterateChildrenRecursively(root, null) { vf ->
                        val ext = vf.extension
                        if (!vf.isDirectory && (ext == "yaml" || ext == "yml")) {
                            val rel = VfsUtilCore.getRelativePath(vf, root) ?: vf.name
                            val text = FileDocumentManager.getInstance().getDocument(vf)?.text
                                ?: String(vf.contentsToByteArray())
                            out.add(mapOf("path" to rel, "content" to text))
                        }
                        true
                    }
                    out
                }
            },
        )
        sendToWeb(mapOf("type" to "files", "files" to files))
    }

    /** The nearest ancestor `specs/ui` directory of a file, or null when it is not under one. */
    private fun specsUiRoot(f: VirtualFile): VirtualFile? {
        var dir = f.parent
        while (dir != null) {
            if (dir.name == "ui" && dir.parent?.name == "specs") return dir
            dir = dir.parent
        }
        return null
    }

    private fun sendInit() {
        val text = ApplicationManager.getApplication().runReadAction(
            Computable { FileDocumentManager.getInstance().getDocument(file)?.text ?: String(file.contentsToByteArray()) },
        )
        val path = ApplicationManager.getApplication().runReadAction(
            Computable { specsUiRoot(file)?.let { VfsUtilCore.getRelativePath(file, it) } ?: file.name },
        )
        sendToWeb(mapOf("type" to "init", "yaml" to text, "baseUrl" to "", "path" to path))
    }

    /**
     * Push the edited YAML into the IDE Document ONLY — this marks the file modified (the tab shows
     * the unsaved-changes dot). It does NOT write to disk: that is the IDE's native save (Ctrl+S,
     * Save All, the on-close prompt, or the user's own save policy). No save button, no auto-write.
     */
    private fun updateDocument(yaml: String) {
        ApplicationManager.getApplication().invokeLater {
            val doc = FileDocumentManager.getInstance().getDocument(file) ?: return@invokeLater
            if (doc.text == yaml) return@invokeLater
            applyingFromWeb = true
            try {
                WriteCommandAction.runWriteCommandAction(project) { doc.setText(yaml) }
            } finally {
                applyingFromWeb = false
            }
        }
    }

    private fun sendToWeb(message: Map<String, Any?>) {
        val b = browser ?: return
        val json = mapper.writeValueAsString(message)
        ApplicationManager.getApplication().invokeLater {
            b.cefBrowser.executeJavaScript("window.postMessage($json, '*');", b.cefBrowser.url, 0)
        }
    }

    companion object {
        /** A path the board may write (`writeFile`): relative to specs/ui, a YAML file, never escaping it. */
        internal fun isWritableSpecPath(path: String): Boolean =
            path.isNotBlank() && !path.startsWith("/") && !path.contains('\\') && !Regex("^[A-Za-z]:").containsMatchIn(path) &&
                !path.split('/').contains("..") && (path.endsWith(".yaml") || path.endsWith(".yml"))
    }

    override fun getComponent(): JComponent = browser?.component ?: fallback!!
    override fun getPreferredFocusedComponent(): JComponent? = browser?.component
    override fun getName(): String = "Visual Editor"
    override fun getFile(): VirtualFile = file
    override fun setState(state: FileEditorState) {}
    override fun isModified(): Boolean = false
    override fun isValid(): Boolean = true
    override fun addPropertyChangeListener(listener: PropertyChangeListener) { listeners.add(listener) }
    override fun removePropertyChangeListener(listener: PropertyChangeListener) { listeners.remove(listener) }
    override fun dispose() {
        query?.let { Disposer.dispose(it) }
        browser?.let { Disposer.dispose(it) }
    }
}
