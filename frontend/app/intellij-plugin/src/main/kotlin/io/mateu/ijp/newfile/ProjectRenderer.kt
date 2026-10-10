package io.mateu.ijp.newfile

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VfsUtil
import com.intellij.openapi.vfs.VfsUtilCore
import com.intellij.openapi.vfs.VirtualFile
import io.mateu.ijp.newfile.ProjectDescriptor.Renderer

/**
 * Where a project's descriptor (`specs/ui/project.yaml`) lives and how to read/write it through the
 * VFS. One per project: the first `type: Project` file found under a `specs/ui` folder wins; when
 * there is none, it is created in the folder New | Mateu would target from the project root.
 *
 * This is also the HOOK the New Project wizard (queued) calls: [rendererOf] to preselect the
 * renderer, [setRenderer] to write it, and [Renderer.artifactId] / [ProjectDescriptor.dependencyXml]
 * for the pom it writes — never a hard-coded artifact.
 */
object ProjectRenderer {

    /** The descriptor file, or null when the project has none yet. Call under a read action. */
    fun descriptorOf(project: Project): VirtualFile? {
        val base = project.basePath?.let { LocalFileSystem.getInstance().findFileByPath(it) } ?: return null
        var found: VirtualFile? = null
        VfsUtilCore.iterateChildrenRecursively(base, { dir -> !dir.isDirectory || dir.name !in SKIPPED_DIRS }) { f ->
            if (!f.isDirectory && f.name == ProjectDescriptor.FILE_NAME && f.path.contains("/specs/ui/") &&
                ProjectDescriptor.isProject(SpecsWorkspace.textOf(f))
            ) {
                found = f
                false
            } else {
                true
            }
        }
        return found
    }

    /** Whether the project already has a descriptor (New | Mateu offers "Project settings" only when not). */
    fun hasDescriptor(project: Project): Boolean = descriptorOf(project) != null

    /** The project's renderer (Vaadin when it declares none). */
    fun rendererOf(project: Project): Renderer = ProjectDescriptor.rendererOf(descriptorOf(project)?.let { SpecsWorkspace.textOf(it) })

    /** Where a NEW descriptor goes: the project's specs/ui folder (created if missing). */
    fun defaultDescriptorPath(project: Project): String? {
        val base = project.basePath ?: return null
        val dir = MateuNewFiles.targetDir(base, base) { LocalFileSystem.getInstance().findFileByPath(it)?.isDirectory == true }
        return "$dir/${ProjectDescriptor.FILE_NAME}"
    }

    /**
     * Write [renderer] into the descriptor (creating it when missing), as one undoable command.
     * Returns the error message, if any.
     */
    fun setRenderer(project: Project, renderer: Renderer): String? {
        val existing = descriptorOf(project)
        return SpecsWorkspace.write(project, "Set Mateu Renderer") {
            if (existing != null) {
                SpecsWorkspace.edit(existing.path) { ProjectDescriptor.withRenderer(it, renderer) }
            } else {
                val path = defaultDescriptorPath(project) ?: error("The project has no base path")
                val dir = VfsUtil.createDirectoryIfMissing(path.substringBeforeLast('/')) ?: error("Cannot create ${path.substringBeforeLast('/')}")
                val file = dir.findChild(ProjectDescriptor.FILE_NAME) ?: dir.createChildData(this, ProjectDescriptor.FILE_NAME)
                VfsUtil.saveText(file, ProjectDescriptor.withRenderer(VfsUtil.loadText(file), renderer))
            }
        }
    }

    private val SKIPPED_DIRS = setOf("node_modules", "target", "build", "out", "dist", ".git", ".idea", ".gradle")
}
