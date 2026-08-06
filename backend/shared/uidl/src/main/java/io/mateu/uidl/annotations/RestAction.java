package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Makes a button call an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE instead of dispatching to
 * the Mateu server: the renderer calls {@link #url()} directly (no Mateu server mediating) with the
 * interpolated {@link #body()}, then applies the response — shows {@link #successMessage()} as a
 * toast and, when {@link #resultPath()} is set, merges the object at that path in the JSON response
 * into the form state (so bound fields refresh).
 *
 * <p>The action surface of the "decouple the UI from the Mateu backend" line (after
 * {@code @RestOptions} for select options and {@code @RestListing} for listing rows). Put it on a
 * method that is ALSO a {@code @Button}/{@code @Toolbar} (which renders the clickable button);
 * {@code url}/{@code headers}/{@code body} support {@code ${state.x}} interpolation.
 *
 * <p>Example — a "Look up address" button that fills fields from a postal-code API:
 *
 * <pre>{@code
 * @Button("Look up")
 * @RestAction(
 *     url = "https://api.example.com/zip/${state.zip}",
 *     resultPath = "address",           // merge {street, city} from the response into the form
 *     successMessage = "Address found")
 * public void lookupAddress() {}
 * }</pre>
 *
 * <p>ANNOTATION_TYPE so it composes as a meta-annotation, resolved via MetaAnnotations.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface RestAction {

  /** The endpoint URL; supports {@code ${state.x}} interpolation. */
  String url();

  /** The HTTP method (POST, GET, PUT, …). */
  String method() default "POST";

  /** Request headers as {@code "Name: Value"} strings (values interpolated). */
  String[] headers() default {};

  /** A request body template (interpolated), e.g. {@code {"name": "${state.name}"}}. */
  String body() default "";

  /** A toast shown on a 2xx response (interpolated); blank shows none. */
  String successMessage() default "";

  /**
   * A dot path to the object in the JSON response to merge into the form state (so bound fields
   * refresh) — e.g. {@code address} merges {@code {street, city}}. Blank merges nothing
   * (fire-and-toast).
   */
  String resultPath() default "";
}
