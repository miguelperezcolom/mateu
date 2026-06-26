package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a {@code String} field as an uploadable image: the image preview combined with an upload
 * (replace) action and a delete action. The field value holds the image itself as a data URI
 * (base64) — the upload is read client-side, so no upload endpoint is required — or a URL.
 *
 * <p>Shorthand for {@code @Stereotype(FieldStereotype.uploadableImage)}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface UploadableImage {}
