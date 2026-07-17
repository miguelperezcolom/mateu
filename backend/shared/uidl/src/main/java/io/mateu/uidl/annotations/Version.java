package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Optimistic-locking version field of an entity (an {@code int} or {@code long}). The framework
 * bumps it on every successful save; when a save arrives carrying a version OLDER than the stored
 * one (someone else saved in between), the save is rejected and the user gets a conflict dialog —
 * reload to see the other user's changes, or overwrite them explicitly. The field travels in the
 * form state but is never editable (annotate it {@code @Hidden} to keep it off the form entirely).
 * Works out of the box on {@code AutoCrud} editors, creation forms and inline row editing.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Version {}
