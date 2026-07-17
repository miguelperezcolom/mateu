package io.mateu.core.infra.declarative.orchestrators.importwizard;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.FileUpload;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * First step of the {@link ImportWizard}: provide the CSV either as an uploaded file (a data URI,
 * read client-side — no upload endpoint) or by pasting it into the textarea. The first non-blank
 * source wins, the file first.
 */
public class UploadStep implements WizardStep {

  @FileUpload(accept = ".csv")
  @Label("CSV file")
  public String file;

  @Stereotype(FieldStereotype.textarea)
  @Label("...or paste the CSV")
  public String pasted;

  /** The CSV text: the uploaded file (base64-decoded) when present, else the pasted text. */
  String content() {
    if (file != null && !file.isBlank()) {
      return decode(file);
    }
    return pasted != null ? pasted : "";
  }

  /**
   * Decodes a {@code data:} URI into text (base64 payload after the first comma, UTF-8); a plain
   * (non-data-URI) value is returned as-is.
   */
  private static String decode(String value) {
    if (!value.startsWith("data:")) {
      return value;
    }
    int comma = value.indexOf(',');
    if (comma < 0) {
      return "";
    }
    var meta = value.substring(0, comma);
    var payload = value.substring(comma + 1);
    if (meta.contains(";base64")) {
      try {
        return new String(Base64.getMimeDecoder().decode(payload), StandardCharsets.UTF_8);
      } catch (IllegalArgumentException e) {
        return "";
      }
    }
    return URLDecoder.decode(payload, StandardCharsets.UTF_8);
  }
}
