package io.mateu.compose.ui

import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asSkiaBitmap
import org.jetbrains.skia.EncodedImageFormat
import org.jetbrains.skia.Image
import kotlin.io.encoding.Base64
import kotlin.io.encoding.ExperimentalEncodingApi

@OptIn(ExperimentalEncodingApi::class)
actual fun encodeSignatureToPngDataUri(bitmap: ImageBitmap): String? = try {
    val bytes = Image.makeFromBitmap(bitmap.asSkiaBitmap())
        .encodeToData(EncodedImageFormat.PNG)?.bytes
    bytes?.let { "data:image/png;base64," + Base64.encode(it) }
} catch (e: Exception) {
    null
}
