package io.mateu.compose.ui

import android.util.Base64
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import java.io.ByteArrayOutputStream

actual fun encodeSignatureToPngDataUri(bitmap: ImageBitmap): String? = try {
    val out = ByteArrayOutputStream()
    bitmap.asAndroidBitmap().compress(android.graphics.Bitmap.CompressFormat.PNG, 100, out)
    "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
} catch (e: Exception) {
    null
}
