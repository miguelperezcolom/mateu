package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Fills a field's select options from an arbitrary (non-Mateu) REST endpoint, fetched CLIENT-SIDE:
 * the renderer calls {@link #url()} directly (no Mateu server mediating), navigates {@link
 * #itemsPath()} to the array in the JSON response, and maps each item via {@link #valuePath()} /
 * {@link #labelPath()} into the option value/label. The field renders as a select.
 *
 * <p>The first surface of the "decouple the UI from the Mateu backend" line — a Mateu form talking
 * to any REST API. {@code url}/{@code headers}/{@code body} support {@code ${state.x}}
 * interpolation, so the request can depend on other field values.
 *
 * <p>Example:
 *
 * <pre>{@code
 * @RestOptions(
 *     url = "https://restcountries.com/v3.1/all?fields=cca2,name",
 *     itemsPath = "",           // the response root is already the array
 *     valuePath = "cca2",
 *     labelPath = "name.common")
 * String country;
 * }</pre>
 *
 * <p>ANNOTATION_TYPE so it composes as a meta-annotation (e.g. {@code @CountryPicker}), resolved
 * via MetaAnnotations.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface RestOptions {

  /** The endpoint URL; supports {@code ${state.x}}/{@code ${data.y}} interpolation. */
  String url();

  /** The HTTP method (GET, POST, …). */
  String method() default "GET";

  /** Request headers as {@code "Name: Value"} strings (values interpolated). */
  String[] headers() default {};

  /** A request body template (interpolated) for non-GET methods. */
  String body() default "";

  /**
   * A dot path to the array inside the JSON response (e.g. {@code data.items}); blank means the
   * response root IS the array.
   */
  String itemsPath() default "";

  /** A dot path within each item to the option value. */
  String valuePath() default "value";

  /** A dot path within each item to the option label. */
  String labelPath() default "label";
}
