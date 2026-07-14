package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * PERSONA PROJECTION: the annotated field, action method or menu entry is shown only when the
 * CURRENT AUDIENCE is unset (no projection active → everything visible) or is one of the declared
 * values. When an audience IS selected and doesn't match, the element is hidden.
 *
 * <p>The current audience is the application-context value under the key {@code "audience"} ({@code
 * httpRequest.appContext("audience")}): declare an {@link AppContext} field named {@code audience}
 * on the app class (typically an enum — its constants travel as their name) and the app header
 * shows the audience switch for free.
 *
 * <p><b>NOT a security boundary</b> — it is a UX projection aid (one declared model, projected per
 * persona). The data still travels to any client that clears the selector; combine with {@link
 * EyesOnly} for real access control.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface Audience {

  /** The audiences the element is meant for (matched case-sensitively, OR within the list). */
  String[] value();
}
