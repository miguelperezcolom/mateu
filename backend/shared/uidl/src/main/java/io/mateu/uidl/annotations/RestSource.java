package io.mateu.uidl.annotations;

import io.mateu.uidl.data.RestSourceProvenance;
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares one named entry of the app's REST source catalogue: an endpoint stated ONCE that any
 * number of surfaces then reference by {@link #name()} — {@code @RestOptions(source = "countries")}
 * instead of repeating the URL and the mapping paths at every field that needs it.
 *
 * <p>Put it wherever it reads best — typically on the {@code @UI} app class or on a dedicated
 * catalogue class; every registered routed class is scanned and the entries are collected into one
 * catalogue, so the placement is a matter of taste rather than of meaning. An authored {@code
 * sources.yaml} is merged on top of what these declare, and the authored entry wins.
 *
 * <p>Example:
 *
 * <pre>{@code
 * @UI("")
 * @RestSource(
 *     name = "countries",
 *     url = "https://restcountries.com/v3.1/all?fields=cca2,name",
 *     valuePath = "cca2",
 *     labelPath = "name.common",
 *     description = "ISO country codes")
 * @RestSource(
 *     name = "orders",
 *     url = "/api/orders?since=${state.since}",
 *     itemsPath = "data",
 *     totalPath = "meta.total",
 *     fields = {"customerName=customer.name"})
 * public class Home {}
 * }</pre>
 *
 * <p>ANNOTATION_TYPE so it composes as a meta-annotation, resolved via MetaAnnotations.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Repeatable(RestSources.class)
public @interface RestSource {

  /** What surfaces reference. Must be unique within the catalogue. */
  String name();

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

  /** A dot path within each item to the value a select uses. */
  String valuePath() default "value";

  /** A dot path within each item to the label a select shows. */
  String labelPath() default "label";

  /**
   * The fields this source exposes, as {@code "name=dot.path"} strings. This is what lets a nested
   * response field be consumed under a flat name ({@code "customerName=customer.name"}), which a
   * surface cannot express by itself because a column id is used directly as the path. A name not
   * mentioned here is read as its own path, so declaring nothing keeps the default behaviour.
   */
  String[] fields() default {};

  /**
   * A dot path to the total number of matching items, for an endpoint that pages server-side; blank
   * means the response carries no total and the renderer pages what it fetched in memory.
   */
  String totalPath() default "";

  /**
   * Whether somebody already serves this endpoint or this project still owes it. Default {@code
   * auto} infers it from the URL: relative / same-origin means ours to build, another origin means
   * somebody else's. It decides whether the derived contract generates a server for it.
   */
  RestSourceProvenance provenance() default RestSourceProvenance.auto;

  /** A line for humans, and the {@code summary} of the derived API operation. */
  String description() default "";

  /**
   * Fetch through the Mateu SERVER (proxy mode) instead of directly from the browser: no CORS, and
   * {@code ${secret.X}} auth is injected server-side from a {@code SecretsProvider}. Default false.
   */
  boolean proxy() default false;
}
