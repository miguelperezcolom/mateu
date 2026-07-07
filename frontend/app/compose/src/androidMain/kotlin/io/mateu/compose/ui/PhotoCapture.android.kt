package io.mateu.compose.ui

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import java.io.ByteArrayOutputStream

/** The system camera intent: returns a preview Bitmap, no CAMERA runtime permission needed. */
@Composable
actual fun rememberPhotoCaptureLauncher(onCaptured: (String?) -> Unit): (() -> Unit)? {
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicturePreview()) { bitmap ->
        if (bitmap == null) {
            onCaptured(null)
        } else {
            val out = ByteArrayOutputStream()
            bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 90, out)
            onCaptured("data:image/jpeg;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP))
        }
    }
    return { launcher.launch(null) }
}

actual fun decodeDataUriToImageBitmap(dataUri: String): ImageBitmap? = try {
    val bytes = Base64.decode(dataUri.substringAfter("base64,", ""), Base64.DEFAULT)
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap()
} catch (e: Exception) {
    null
}
