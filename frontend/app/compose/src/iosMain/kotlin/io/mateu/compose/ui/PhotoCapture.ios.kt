package io.mateu.compose.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import kotlinx.cinterop.ExperimentalForeignApi
import org.jetbrains.skia.Image
import platform.Foundation.NSData
import platform.Foundation.base64EncodedStringWithOptions
import platform.Foundation.create
import platform.UIKit.UIApplication
import platform.UIKit.UIImage
import platform.UIKit.UIImageJPEGRepresentation
import platform.UIKit.UIImagePickerController
import platform.UIKit.UIImagePickerControllerDelegateProtocol
import platform.UIKit.UIImagePickerControllerOriginalImage
import platform.UIKit.UIImagePickerControllerSourceType
import platform.UIKit.UINavigationControllerDelegateProtocol
import platform.darwin.NSObject
import kotlinx.cinterop.BetaInteropApi

/** Keeps the picker delegate strongly referenced while the camera is presented. */
private class CameraDelegate(
    private val onCaptured: (String?) -> Unit,
) : NSObject(), UIImagePickerControllerDelegateProtocol, UINavigationControllerDelegateProtocol {

    override fun imagePickerController(
        picker: UIImagePickerController,
        didFinishPickingMediaWithInfo: Map<Any?, *>,
    ) {
        val image = didFinishPickingMediaWithInfo[UIImagePickerControllerOriginalImage] as? UIImage
        val data = image?.let { UIImageJPEGRepresentation(it, 0.9) }
        onCaptured(
            data?.let { "data:image/jpeg;base64," + it.base64EncodedStringWithOptions(0u) },
        )
        picker.dismissViewControllerAnimated(true, null)
    }

    override fun imagePickerControllerDidCancel(picker: UIImagePickerController) {
        onCaptured(null)
        picker.dismissViewControllerAnimated(true, null)
    }
}

@Composable
actual fun rememberPhotoCaptureLauncher(onCaptured: (String?) -> Unit): (() -> Unit)? {
    // no camera (e.g. the simulator) → let the field fall back to its hint
    if (!UIImagePickerController.isSourceTypeAvailable(
            UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera)) {
        return null
    }
    val delegate = remember { CameraDelegate(onCaptured) }
    return {
        val picker = UIImagePickerController()
        picker.sourceType =
            UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera
        picker.delegate = delegate
        UIApplication.sharedApplication.keyWindow?.rootViewController
            ?.presentViewController(picker, animated = true, completion = null)
    }
}

@OptIn(ExperimentalForeignApi::class, BetaInteropApi::class, kotlin.io.encoding.ExperimentalEncodingApi::class)
actual fun decodeDataUriToImageBitmap(dataUri: String): ImageBitmap? = try {
    val base64 = dataUri.substringAfter("base64,", "")
    if (base64.isEmpty()) null
    else {
        val bytes = kotlin.io.encoding.Base64.decode(base64)
        Image.makeFromEncoded(bytes).toComposeImageBitmap()
    }
} catch (e: Exception) {
    null
}
