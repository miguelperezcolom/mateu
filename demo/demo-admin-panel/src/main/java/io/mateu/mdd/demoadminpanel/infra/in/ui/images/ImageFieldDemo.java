package io.mateu.mdd.demoadminpanel.infra.in.ui.images;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UploadableImage;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Demo of the uploadable image field: a {@code String} annotated with {@code @UploadableImage}
 * renders the image preview plus <em>Upload/Replace</em> and <em>Delete</em> actions. The picked
 * image is read client-side into a data URI, so the value lives entirely in the string — pressing
 * <em>Save</em> round-trips it to the backend.
 */
@UI("/image-field")
@Title("Uploadable image field")
public class ImageFieldDemo {

  String name = "Mi perfil";

  @UploadableImage
  @Label("Avatar")
  String avatar =
      "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='240'%20height='140'%3E%3Crect%20width='240'%20height='140'%20fill='%234f8cff'/%3E%3Ctext%20x='120'%20y='78'%20font-size='28'%20fill='white'%20text-anchor='middle'%20font-family='sans-serif'%3EMateu%3C/text%3E%3C/svg%3E";

  // captured (not uploaded): a drawing canvas whose accepted strokes land here as a PNG data URI
  @io.mateu.uidl.annotations.Signature
  @Label("Firma")
  String signature;

  // captured (not uploaded): the device camera; the shot lands here as a JPEG data URI
  @io.mateu.uidl.annotations.PhotoCapture
  @Label("Foto")
  String photo;

  @Toolbar
  Object save(HttpRequest httpRequest) {
    var present = avatar != null && !avatar.isEmpty();
    var signed = signature != null && !signature.isEmpty();
    var shot = photo != null && !photo.isEmpty();
    return Message.success(
        "Saved. Avatar " + (present ? "present" : "empty")
            + ", signature " + (signed ? "present (" + signature.length() + " chars)" : "empty")
            + ", photo " + (shot ? "present (" + photo.length() + " chars)" : "empty") + ".");
  }
}
