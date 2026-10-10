package io.mateu.ijp.newfile

import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VfsUtil
import com.intellij.openapi.vfs.VfsUtilCore
import com.intellij.openapi.vfs.VirtualFile
import io.mateu.ijp.newfile.MateuRoutes.SpecFile
import io.mateu.ijp.newfile.MateuRoutes.SpecKind

/**
 * The specs/ui files of one root ([root], absolute), classified by their top-level `type:` — what the
 * routes wizards offer (mounts, app shells, pages, routes files). Unsaved editor content wins over the
 * file on disk. Files that do not parse are left out. Call under a read action (EDT is fine).
 */
class SpecsWorkspace private constructor(val root: String, val files: List<SpecFile>, private val texts: Map<String, String>) {

    fun ofKind(vararg kinds: SpecKind): List<SpecFile> = files.filter { it.kind in kinds }

    fun text(rel: String): String? = texts[rel]

    fun abs(rel: String) = "$root/$rel"

    fun rel(abs: String): String? = abs.takeIf { it.startsWith("$root/") }?.removePrefix("$root/")

    /** The mount (relative path) whose `routes:` lists [routesRel], or null. */
    fun mountListing(routesRel: String): String? =
        MateuRoutes.mountListing(ofKind(SpecKind.MOUNT).associate { it.path to texts.getValue(it.path) }, routesRel)

    companion object {
        fun scan(root: String): SpecsWorkspace {
            val dir = LocalFileSystem.getInstance().findFileByPath(root)
            val files = ArrayList<SpecFile>()
            val texts = HashMap<String, String>()
            if (dir != null && dir.isDirectory) {
                VfsUtilCore.iterateChildrenRecursively(dir, null) { f ->
                    if (!f.isDirectory && (f.extension == "yaml" || f.extension == "yml")) {
                        val text = textOf(f)
                        val kind = text?.let { MateuRoutes.classify(it) }
                        val rel = VfsUtilCore.getRelativePath(f, dir, '/')
                        if (kind != null && rel != null) {
                            files += SpecFile(rel, kind)
                            texts[rel] = text
                        }
                    }
                    true
                }
            }
            return SpecsWorkspace(root.trimEnd('/'), files.sortedBy { it.path }, texts)
        }

        fun textOf(f: VirtualFile): String? =
            FileDocumentManager.getInstance().getCachedDocument(f)?.text ?: runCatching { VfsUtil.loadText(f) }.getOrNull()

        /**
         * Rewrite a file through its document (so the change is undoable and an open editor follows),
         * with [transform] computing the new text from the current one. Must run inside a write command.
         */
        fun edit(path: String, transform: (String) -> String) {
            val f = LocalFileSystem.getInstance().refreshAndFindFileByPath(path) ?: error("$path not found")
            val doc = FileDocumentManager.getInstance().getDocument(f) ?: error("$path cannot be edited")
            val updated = transform(doc.text)
            if (updated != doc.text) {
                doc.setText(updated)
                FileDocumentManager.getInstance().saveDocument(doc)
            }
        }

        /** Run [block] as one undoable command; returns the error message, if any. */
        fun write(project: Project, name: String, block: () -> Unit): String? {
            var error: String? = null
            WriteCommandAction.runWriteCommandAction(project, name, null, {
                try {
                    block()
                } catch (ex: Exception) {
                    error = ex.message ?: ex.toString()
                }
            })
            return error
        }
    }
}
