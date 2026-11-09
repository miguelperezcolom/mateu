package io.mateu.explorer.examples.behaviour.captureandimages;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FileUpload;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UploadableImage;
import io.mateu.uidl.data.Message;

/**
 * {@code @UploadableImage}: a preview with Upload / Replace / Delete; {@code @FileUpload}: any file.
 * Both are read in the browser into a data URI stored in the String field (it may also hold a plain
 * URL), so they need no upload endpoint either.
 */
@Title("Product images")
public class ProductImages {

  @UploadableImage String picture;

  @FileUpload(accept = ".pdf,.txt")
  String datasheet;

  @Button
  Message save() {
    return Message.success(
        "Picture: " + DeliveryProof.size(picture) + " · datasheet: " + DeliveryProof.size(datasheet));
  }
}
