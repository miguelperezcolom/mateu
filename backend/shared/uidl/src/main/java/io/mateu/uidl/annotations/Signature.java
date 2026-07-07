package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a String field as a SIGNATURE CAPTURE: a drawing canvas (mouse/touch) with clear/accept
 * actions. Accepting stores the strokes as a PNG data URI in the field value, so the signature
 * round-trips like any other field — same self-contained contract as {@code @UploadableImage}, no
 * upload endpoint involved. The read-only rendering shows the signature image.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Signature {}
