package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.PhotoCapture;
import io.mateu.uidl.annotations.Signature;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Capture fields: @Signature and @PhotoCapture String fields render as capture widgets (drawing
 * canvas / device camera) whose result lands in the field value as a data URI — same self-contained
 * contract as @UploadableImage, no upload endpoint.
 */
class CaptureFieldsSyncTest {

  @SuppressWarnings("unused")
  @UI("/capture")
  @Title("Capture")
  public static class CaptureForm {
    @Signature String signature;
    @PhotoCapture String photo;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CaptureForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void captureAnnotationsBecomeTheirStereotypes() {
    var increment = mateu.sync("/capture");
    var fields = new java.util.ArrayList<io.mateu.dtos.FormFieldDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.FormFieldDto.class, fields);
    assertThat(fields)
        .extracting(io.mateu.dtos.FormFieldDto::fieldId, io.mateu.dtos.FormFieldDto::stereotype)
        .contains(
            org.assertj.core.groups.Tuple.tuple("signature", "signature"),
            org.assertj.core.groups.Tuple.tuple("photo", "camera"));
  }
}
