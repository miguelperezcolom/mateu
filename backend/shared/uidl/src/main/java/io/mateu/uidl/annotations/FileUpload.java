package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a {@code String} field as a generic file upload: a pick-file action showing the chosen
 * file's name plus a remove action (no preview — the generic sibling of {@code @UploadableImage}).
 * The picked file is read client-side into a <b>data URI</b> (base64) stored as the field value, so
 * the file travels in the string itself and no upload endpoint is required. The frontend embeds the
 * original file name as a data-URI parameter ({@code data:<mime>;name=<encoded>;base64,...}, RFC
 * 2397 allows parameters) so it can be displayed on re-render; server-side, decode everything after
 * the first comma as base64.
 *
 * <p>Shorthand for {@code @Stereotype(FieldStereotype.fileUpload)}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface FileUpload {

  /**
   * Optional {@code accept} attribute for the file input (e.g. {@code ".csv"} or {@code
   * "application/pdf"}). Travels in the field's generic {@code attributes} map under the {@code
   * accept} key.
   */
  String accept() default "";
}
