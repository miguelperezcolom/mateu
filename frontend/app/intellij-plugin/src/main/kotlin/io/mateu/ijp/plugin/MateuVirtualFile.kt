package io.mateu.ijp.plugin

import com.intellij.openapi.fileTypes.PlainTextFileType
import com.intellij.testFramework.LightVirtualFile
import javax.swing.JComponent

/**
 * A lightweight in-memory "file" standing for one Mateu view, so it can be opened as an **editor
 * tab** in the central editor area (native tabs / splitting / drag-out). Carries the already-rendered
 * [ui] panel — the file-editor provider just wraps it.
 */
class MateuVirtualFile(
    val label: String,
    val ui: JComponent,
) : LightVirtualFile(label, PlainTextFileType.INSTANCE, "")
