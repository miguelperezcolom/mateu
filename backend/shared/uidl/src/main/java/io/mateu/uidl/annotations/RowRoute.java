package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * On a listing or crud class: clicking a row NAVIGATES to this route instead of opening the crud's
 * own record view — a template over the row, {@code "/customers/${row.id}"}. The way into a record
 * master whose tabs are pages ({@code routes.yaml} children): the route is a real URL, so the
 * master is addressable, shareable and survives a reload. The Java twin of a definition's {@code
 * Listing.rowRoute}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface RowRoute {
  String value();
}
