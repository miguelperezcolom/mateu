package io.mateu.compose.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import org.jetbrains.skia.Image
import java.awt.FileDialog
import java.awt.Frame
import kotlin.io.encoding.Base64
import kotlin.io.encoding.ExperimentalEncodingApi

/** Desktop has no camera API: the "capture" is a file dialog picking an image into a data URI. */
@OptIn(ExperimentalEncodingApi::class)
@Composable
actual fun rememberPhotoCaptureLauncher(onCaptured: (String?) -> Unit): (() -> Unit)? = {
    // Compose Desktop runs on the AWT event thread, so the modal dialog can show directly
    val dialog = FileDialog(null as Frame?, "Pick a photo", FileDialog.LOAD)
    dialog.setFilenameFilter { _, name ->
        name.lowercase().endsWith(".png") || name.lowercase().endsWith(".jpg")
            || name.lowercase().endsWith(".jpeg") || name.lowercase().endsWith(".gif")
    }
    dialog.isVisible = true
    val file = dialog.files.firstOrNull()
    if (file == null) {
        onCaptured(null)
    } else {
        try {
            val mime = if (file.name.lowercase().endsWith(".png")) "image/png" else "image/jpeg"
            onCaptured("data:$mime;base64," + Base64.encode(file.readBytes()))
        } catch (e: Exception) {
            onCaptured(null)
        }
    }
}

actual fun decodeDataUriToImageBitmap(dataUri: String): ImageBitmap? = try {
    val base64 = dataUri.substringAfter("base64,", "")
    if (base64.isEmpty()) null
    else Image.makeFromEncoded(java.util.Base64.getDecoder().decode(base64)).toComposeImageBitmap()
} catch (e: Exception) {
    null
}
