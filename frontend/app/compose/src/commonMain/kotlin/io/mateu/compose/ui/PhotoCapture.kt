package io.mateu.compose.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.ImageBitmap

/**
 * Opens the platform's photo capture and returns the shot as a JPEG data URI through
 * [onCaptured] (null = cancelled). Returns null when capture is unavailable on the platform, so
 * the field can fall back to an honest hint. Android: the system camera intent
 * (TakePicturePreview). iOS: UIImagePickerController with the camera source. Desktop: a file
 * dialog picking an image (the JVM has no camera API — same parity decision as JavaFX).
 */
@Composable
expect fun rememberPhotoCaptureLauncher(onCaptured: (String?) -> Unit): (() -> Unit)?

/** Decodes a data URI (or fails to null) so capture fields can preview their committed value. */
expect fun decodeDataUriToImageBitmap(dataUri: String): ImageBitmap?
