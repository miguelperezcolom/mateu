package io.mateu.uidl.annotations;

import io.mateu.uidl.data.StatusType;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Shows a listing column as a STATUS chip: the field's value, capitalised, in the tone the {@link
 * #mappings()} give it ({@code "ok"} → {@code SUCCESS}), or {@link #defaultStatus()} when no
 * mapping matches. For a row/column of a listing or grid.
 *
 * <pre>{@code
 * @Status(
 *     mappings = {@StatusMapping(from = "PAID", to = StatusType.SUCCESS),
 *                 @StatusMapping(from = "OVERDUE", to = StatusType.DANGER)},
 *     defaultStatus = StatusType.NONE)
 * String state;
 * }</pre>
 *
 * <p>Not to be confused with its neighbours: {@link Badge} renders a form field as a chip inside
 * the form body, and {@link BadgeInHeader} puts a chip in the page HEADER. {@code @Status} maps a
 * value to a tone, cell by cell. A field typed {@code io.mateu.uidl.data.Status} carries its tone
 * itself and needs no annotation.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Documented
public @interface Status {
  /** Which raw values (their {@code toString()}) get which tone. */
  StatusMapping[] mappings();

  /** The tone of a value no mapping matches. */
  StatusType defaultStatus();
}
