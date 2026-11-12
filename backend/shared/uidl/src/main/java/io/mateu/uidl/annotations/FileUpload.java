package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
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
 *
 * <p><b>Large files</b>: while the application registers a {@link
 * io.mateu.uidl.interfaces.FileStorage}, the file is UPLOADED instead (progress, cancel,
 * server-side size and type limits) and the value becomes the reference the store returns ({@code
 * mateu-file:<id>?name=…}, see {@link io.mateu.uidl.data.StoredFile#parse}) — never the bytes. On a
 * {@code List<String>} field (or with {@link #multiple()}) several files can be picked and the
 * value is a list of references.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Documented
public @interface FileUpload {

  /**
   * The {@link #storage()} that keeps the file INLINE (a data URI in the value) even while a {@link
   * io.mateu.uidl.interfaces.FileStorage} is registered — for a field whose code reads the bytes
   * from the value (the import wizard's CSV).
   */
  @Experimental("file uploads through a storage port (3.0)")
  String INLINE = "inline";

  /**
   * Optional {@code accept} attribute for the file input (e.g. {@code ".csv"} or {@code
   * "application/pdf"}). Travels in the field's generic {@code attributes} map under the {@code
   * accept} key.
   */
  String accept() default "";

  /**
   * The largest file accepted, in bytes; {@code 0} (the default) = the server's default ({@code
   * mateu.uploads.max-bytes}, 100 MB) when a {@link io.mateu.uidl.interfaces.FileStorage} is
   * registered, 10 MB for a data URI otherwise. Enforced by the server while the file streams.
   */
  @Experimental("file uploads through a storage port (3.0)")
  long maxBytes() default 0;

  /**
   * Whether several files can be picked (the value is then a list of references). Inferred for a
   * {@code List<String>} / {@code Set<String>} / array field.
   */
  @Experimental("file uploads through a storage port (3.0)")
  boolean multiple() default false;

  /**
   * The {@link io.mateu.uidl.interfaces.FileStorage#name()} that keeps the file; {@code ""} = the
   * default store; {@link #INLINE} = no store, the file stays a data URI in the value.
   */
  @Experimental("file uploads through a storage port (3.0)")
  String storage() default "";
}
