package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Fills a listing's rows from an arbitrary (non-Mateu) REST endpoint, fetched CLIENT-SIDE: the
 * renderer calls {@link #url()} directly (no Mateu server mediating), navigates {@link
 * #itemsPath()} to the array in the JSON response, and maps each item into a row by reading each
 * COLUMN by its field name as a dot path (so a {@code Row(String code, String name)} reads {@code
 * code}/{@code name} from each item). The columns come from the {@code Listing<Row>}'s Row type as
 * usual.
 *
 * <p>The listing surface of the "decouple the UI from the Mateu backend" line — a Mateu table
 * talking to any REST API. {@code url}/{@code headers}/{@code body} support {@code ${state.x}}
 * interpolation (including {@code ${searchText}}/{@code ${page}}/{@code ${size}}), so an endpoint
 * that supports server-side search/paging gets them; otherwise the renderer filters and paginates
 * the fetched rows in memory.
 *
 * <p>Put it on a {@code @UI} class implementing {@code Listing<Row>}; its {@code search(...)} is
 * never called (the rows are fetched client-side), so it may return empty {@code ListingData}.
 *
 * <p>Example:
 *
 * <pre>{@code
 * @UI("/rest-countries")
 * @RestListing(url = "/countries.json", itemsPath = "data.countries")
 * public class RestCountries implements Listing<RestCountries.Row> {
 *   public record Row(String code, String name, long population) {}
 *   @Override public ListingData<Row> search(SearchRequest r, HttpRequest h) {
 *     return new ListingData<>(Page.empty());
 *   }
 * }
 * }</pre>
 *
 * <p>ANNOTATION_TYPE so it composes as a meta-annotation, resolved via MetaAnnotations.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface RestListing {

  /** The endpoint URL; supports {@code ${state.x}}/{@code ${searchText}} interpolation. */
  String url();

  /** The HTTP method (GET, POST, …). */
  String method() default "GET";

  /** Request headers as {@code "Name: Value"} strings (values interpolated). */
  String[] headers() default {};

  /** A request body template (interpolated) for non-GET methods. */
  String body() default "";

  /**
   * A dot path to the array inside the JSON response (e.g. {@code data.countries}); blank means the
   * response root IS the array.
   */
  String itemsPath() default "";
}
