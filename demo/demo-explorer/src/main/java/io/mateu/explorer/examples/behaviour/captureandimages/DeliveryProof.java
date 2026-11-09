package io.mateu.explorer.examples.behaviour.captureandimages;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.PhotoCapture;
import io.mateu.uidl.annotations.Signature;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;

/**
 * Fields that CAPTURE instead of uploading. {@code @Signature} draws on a pad and {@code
 * @PhotoCapture} uses the camera (on a phone, the native one); both store a data URI (PNG / JPEG)
 * in the String field, so the capture round-trips like any other value — no upload endpoint.
 */
@Title("Proof of delivery")
public class DeliveryProof {

  String receivedBy = "";

  @Signature String signature;

  @PhotoCapture String photo;

  @Button
  Message confirm() {
    return Message.success(
        "Signature: " + size(signature) + " · photo: " + size(photo) + " (data URIs)");
  }

  static String size(String dataUri) {
    return dataUri == null || dataUri.isBlank() ? "none" : (dataUri.length() / 1024) + " KB";
  }
}
