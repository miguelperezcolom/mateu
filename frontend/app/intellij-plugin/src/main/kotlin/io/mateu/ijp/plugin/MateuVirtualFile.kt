package io.mateu.ijp.plugin

import com.intellij.openapi.fileTypes.PlainTextFileType
import com.intellij.testFramework.LightVirtualFile
import io.mateu.ijp.state.AppSession

/**
 * A lightweight in-memory "file" that stands for one Mateu view, so it can be opened as an **editor
 * tab** in the central editor area (which natively supports tabs, splitting and drag-out). Carries
 * the shared [AppSession] and the navigation coordinates the editor uses to render the view.
 */
class MateuVirtualFile(
    val session: AppSession,
    val label: String,
    val route: String?,
    val consumedRoute: String?,
    val sst: String?,
    val actionId: String?,
) : LightVirtualFile(label, PlainTextFileType.INSTANCE, "")
