package io.mateu.ijp.hub

import com.google.zxing.BarcodeFormat
import com.google.zxing.BinaryBitmap
import com.google.zxing.DecodeHintType
import com.google.zxing.MultiFormatReader
import com.google.zxing.NotFoundException
import com.google.zxing.RGBLuminanceSource
import com.google.zxing.common.HybridBinarizer
import com.google.zxing.multi.GenericMultipleBarcodeReader
import java.awt.GraphicsEnvironment
import java.awt.Image
import java.awt.Rectangle
import java.awt.Robot
import java.awt.Toolkit
import java.awt.datatransfer.DataFlavor
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO

/**
 * Reading QR codes on a desktop, where the code is usually ON the screen (the web's "Open on mobile"
 * dialog, a slide, a chat) rather than in front of a camera: the hub reads them from a capture of every
 * screen, from an image on the clipboard or from an image file. Every text found is handed back; the
 * caller keeps the first that is a Mateu link (a screen may show other codes too).
 *
 * macOS: capturing the screen needs the Screen Recording permission; without it the capture is only
 * the wallpaper, so "nothing found" says to grant it or to use the clipboard instead.
 */
object HubQr {

    private val hints = mapOf(
        DecodeHintType.POSSIBLE_FORMATS to listOf(BarcodeFormat.QR_CODE),
        DecodeHintType.TRY_HARDER to true,
        DecodeHintType.CHARACTER_SET to "UTF-8",
    )

    /** Every QR text in [image] (several codes on one screen are all read). */
    fun decode(image: BufferedImage): List<String> {
        val bitmap = BinaryBitmap(HybridBinarizer(luminance(image)))
        val found = try {
            GenericMultipleBarcodeReader(MultiFormatReader()).decodeMultiple(bitmap, hints).map { it.text }
        } catch (e: NotFoundException) {
            emptyList()
        }
        if (found.isNotEmpty()) return found.distinct()
        // a small code on a big screen: the multiple reader can miss what a single read over a scaled-up copy finds
        return listOfNotNull(runCatching { MultiFormatReader().decode(BinaryBitmap(HybridBinarizer(luminance(scaled(image, 2)))), hints).text }.getOrNull())
    }

    /** One capture per screen (a multi-monitor desk has the code on any of them). */
    fun captureScreens(): List<BufferedImage> {
        if (GraphicsEnvironment.isHeadless()) return emptyList()
        return GraphicsEnvironment.getLocalGraphicsEnvironment().screenDevices.mapNotNull { device ->
            runCatching {
                val bounds: Rectangle = device.defaultConfiguration.bounds
                Robot(device).createScreenCapture(bounds)
            }.getOrNull()
        }
    }

    fun fromScreens(): List<String> = captureScreens().flatMap(::decode).distinct()

    /** The clipboard's image, if it holds one (a screenshot copied with the system shortcut). */
    fun clipboardImage(): BufferedImage? = runCatching {
        val clipboard = Toolkit.getDefaultToolkit().systemClipboard
        if (!clipboard.isDataFlavorAvailable(DataFlavor.imageFlavor)) return null
        toBuffered(clipboard.getData(DataFlavor.imageFlavor) as Image)
    }.getOrNull()

    fun fromClipboard(): List<String> = clipboardImage()?.let(::decode).orEmpty()

    fun fromFile(file: File): List<String> = runCatching { ImageIO.read(file) }.getOrNull()?.let(::decode).orEmpty()

    /** The first text that is a Mateu link (or, failing that, the first text at all — maybe a page address). */
    fun pick(texts: List<String>, options: HubLinks.Options = HubLinks.Options()): String? =
        texts.firstOrNull { HubLinks.parse(it, options) !is HubLinks.Link.Invalid } ?: texts.firstOrNull()

    /** ZXing core reads ARGB pixels (its BufferedImage source lives in the javase artifact we do not ship). */
    private fun luminance(image: BufferedImage) =
        RGBLuminanceSource(image.width, image.height, image.getRGB(0, 0, image.width, image.height, null, 0, image.width))

    internal fun toBuffered(image: Image): BufferedImage {
        if (image is BufferedImage) return image
        val out = BufferedImage(image.getWidth(null).coerceAtLeast(1), image.getHeight(null).coerceAtLeast(1), BufferedImage.TYPE_INT_RGB)
        out.createGraphics().apply { drawImage(image, 0, 0, null); dispose() }
        return out
    }

    private fun scaled(image: BufferedImage, factor: Int): BufferedImage {
        val out = BufferedImage(image.width * factor, image.height * factor, BufferedImage.TYPE_INT_RGB)
        out.createGraphics().apply { drawImage(image, 0, 0, out.width, out.height, null); dispose() }
        return out
    }
}
