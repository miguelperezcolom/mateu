package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;

/**
 * Never implemented: nothing reads it, and it has no runtime retention, so a field carrying it
 * renders exactly as without it.
 *
 * @deprecated use {@link BulletedList} on a {@code List<String>} field to render it as a plain
 *     (unordered) list — or a fluent {@code io.mateu.uidl.data.BulletedList}. For listings
 *     (filters, row and bulk actions) use a {@code Listing}/{@code AutoCrud}; no annotation is
 *     needed for the collection class.
 */
@Deprecated(since = "3.0-alpha.426", forRemoval = true)
@Documented
public @interface List {

  String style() default "";

  boolean ordered() default false;
}
