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
 * over a JCEF query pipe (web→IDE) and `window.postMessage` (IDE→web): the web app posts `save`
 * with the edited YAML, and the IDE seeds the open file's text via `init`.
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
            "save" -> save(msg.path("yaml").asText())
        }
    }

    private fun sendInit() {
        val text = runReadAction {
            FileDocumentManager.getInstance().getDocument(file)?.text ?: String(file.contentsToByteArray())
        }
        sendToWeb(mapOf("type" to "init", "yaml" to text, "baseUrl" to ""))
    }

    private fun save(yaml: String) {
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
