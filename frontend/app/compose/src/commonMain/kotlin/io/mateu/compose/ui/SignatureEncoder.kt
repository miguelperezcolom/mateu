package io.mateu.compose.ui

import androidx.compose.ui.graphics.ImageBitmap

/**
 * Encodes a signature bitmap as a PNG data URI ("data:image/png;base64,…"), the wire contract of
 * @Signature fields. Skiko on desktop/iOS, android.graphics on Android.
 */
expect fun encodeSignatureToPngDataUri(bitmap: ImageBitmap): String?
