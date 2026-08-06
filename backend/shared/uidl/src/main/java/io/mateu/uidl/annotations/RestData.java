package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Loads a screen's initial data from an arbitrary (non-Mateu) REST endpoint, fetched CLIENT-SIDE on
 * entry: when the view mounts the renderer calls {@link #url()} directly (no Mateu server
 * mediating), then merges the object at {@link #resultPath()} in the JSON response into the form
 * state, so the fields arrive populated.
 *
 * <p>The screen-data surface of the "decouple the UI from the Mateu backend" line — after
 * {@code @RestOptions} (select options), {@code @RestListing} (listing rows) and
 * {@code @RestAction} (button calls). It is exactly {@code @RestAction}'s merge, triggered on load
 * instead of on click: the view advertises a synthetic {@code __restdata__} action carrying the
 * descriptor plus an {@code OnLoad} trigger that fires it — so it reuses the same client-side
 * fetch+merge machinery.
 *
 * <p>{@code url}/{@code headers}/{@code body} support {@code ${state.x}} interpolation (against the
 * fields' initial values), so the request can depend on a route parameter seeded into the state.
 *
 * <p>Example — a profile screen whose fields come from a REST API:
 *
 * <pre>{@code
 * @UI("/profile")
 * @RestData(url = "https://api.example.com/me", resultPath = "profile")
 * public class Profile {
 *   String name;
 *   String email;
 * }
 * }</pre>
 *
 * <p>ANNOTATION_TYPE so it composes as a meta-annotation, resolved via MetaAnnotations.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface RestData {

  /** The endpoint URL; supports {@code ${state.x}} interpolation. */
  String url();

  /** The HTTP method (GET, POST, …). */
  String method() default "GET";

  /** Request headers as {@code "Name: Value"} strings (values interpolated). */
  String[] headers() default {};

  /** A request body template (interpolated) for non-GET methods. */
  String body() default "";

  /**
   * A dot path to the object in the JSON response to merge into the form state; blank merges the
   * whole response object.
   */
  String resultPath() default "";
}
