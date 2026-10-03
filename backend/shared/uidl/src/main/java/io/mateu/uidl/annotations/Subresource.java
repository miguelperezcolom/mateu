package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * A field whose type is a listing or crud ({@code AutoCrud}, any orchestrator) rendered as one of
 * the record's SUB-RESOURCES: an embedded listing with its own title, help line, filters, paging
 * and actions, inside one of the page's tabs — several of them stacked in the same tab when they
 * name it (OCI's VCN "Gateways" tab holds five gateway listings).
 *
 * <pre>{@code
 * @Subresource(tab = "gateways", order = 1, help = "Gateways to the internet")
 * InternetGateways internetGateways;
 *
 * @Subresource(tab = "gateways", order = 2)
 * NatGateways natGateways;
 *
 * @Subresource(tab = "subnets", load = Subresource.Load.EAGER)
 * Subnets subnets;
 * }</pre>
 *
 * <p>The sub-listing gets the parent as CONTEXT, not as a filter the user can remove: the host
 * route's path parameters ({@code :id}), the host's own simple field values whose names match the
 * listing's fields, and the explicit {@link #context()} bindings are seeded into it on its first
 * load.
 *
 * <p>Loading is lazy by default ({@link Load#ON_OPEN}, decision D2 of the MAUI parity plan): the
 * listing is fetched when its tab is opened. {@link Load#EAGER} fetches it with the page and puts
 * the row count on the tab ("Subnets 12").
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Subresource {

  /** When a sub-listing is fetched. */
  enum Load {
    /** With the page; the tab shows the listing's row count. */
    EAGER,
    /** When its tab is opened (the default). */
    ON_OPEN
  }

  /**
   * The tab it sits in: matched against the page's {@code @Tab}s by key or label; a new tab
   * (labelled with it, its key the value kebab-cased) when none matches. Empty: a tab of its own,
   * named after the field.
   */
  String tab() default "";

  /** Its position among the sub-resources of the same tab (ascending). */
  int order() default 0;

  /** A one-line help text drawn under its title. */
  String help() default "";

  /** When it is fetched: {@link Load#ON_OPEN} (default) or {@link Load#EAGER}. */
  Load load() default Load.ON_OPEN;

  /**
   * A feature flag that must be on for it to show ({@code "flag"} or {@code "!flag"}), like {@link
   * Tab#show()}. Empty: always.
   */
  String show() default "";

  /**
   * Whether the embedded listing draws its own title. Even when {@code true} the title is dropped
   * when it only repeats the tab's label or the page's title.
   */
  boolean showTitle() default true;

  /**
   * Explicit context bindings, {@code "listingField=hostField"} (or just {@code "field"} for the
   * same name on both sides): the host field's value is seeded into the listing's field.
   */
  String[] context() default {};
}
