package io.mateu.ijp.visualeditor

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.runReadAction
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorState
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.openapi.util.UserDataHolderBase
import com.intellij.openapi.vfs.VfsUtilCore
import com.intellij.openapi.vfs.VirtualFile
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

    private val browser: JBCefBrowser? = if (JBCefApp.isSupported()) JBCefBrowser() else null
    private val query: JBCefJSQuery? = browser?.let { JBCefJSQuery.create(it as com.intellij.ui.jcef.JBCefBrowserBase) }
    private val fallback: JComponent? = if (browser == null) JLabel("JCEF is not available in this IDE runtime.") else null

    init {
        val b = browser
        val q = query
        if (b != null && q != null) {
            q.addHandler { request -> onWebMessage(request); null }
            val port = MateuVisualEditorServer.ensureStarted(loadMateuConfig().baseUrl)
            b.jbCefClient.addLoadHandler(object : CefLoadHandlerAdapter() {
                override fun onLoadEnd(cef: CefBrowser?, frame: CefFrame?, httpStatusCode: Int) {
                    if (frame?.isMain == true) installBridge()
                }
            }, b.cefBrowser)
            b.loadURL("http://127.0.0.1:$port/index.html")
        }
    }

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
        }
    }

    /** Reply with every YAML file under the mount's `specs/ui` directory (path relative to it) so the
     *  editor can build its reference index. The edited file lives under `specs/ui`, one of its ancestors. */
    private fun sendFiles() {
        val files = runReadAction {
            val root = specsUiRoot(file) ?: return@runReadAction emptyList<Map<String, String>>()
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
        val text = runReadAction {
            FileDocumentManager.getInstance().getDocument(file)?.text ?: String(file.contentsToByteArray())
        }
        val path = runReadAction {
            specsUiRoot(file)?.let { VfsUtilCore.getRelativePath(file, it) } ?: file.name
        }
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
            WriteCommandAction.runWriteCommandAction(project) { doc.setText(yaml) }
        }
    }

    private fun sendToWeb(message: Map<String, Any?>) {
        val b = browser ?: return
        val json = mapper.writeValueAsString(message)
        ApplicationManager.getApplication().invokeLater {
            b.cefBrowser.executeJavaScript("window.postMessage($json, '*');", b.cefBrowser.url, 0)
        }
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
