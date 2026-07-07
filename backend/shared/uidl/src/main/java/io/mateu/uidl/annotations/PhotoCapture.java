package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a String field as a PHOTO CAPTURE: opens the device camera (getUserMedia) with a live
 * preview and a shutter, storing the shot as a JPEG data URI in the field value — same
 * self-contained contract as {@code @UploadableImage}, no upload endpoint involved. When no camera
 * is available the widget falls back to a file input with {@code capture}, which on phones opens
 * the native camera. The read-only rendering shows the photo.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface PhotoCapture {}
