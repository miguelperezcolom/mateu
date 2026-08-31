package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The placeholder shown in the page header while the title is still empty (the Oracle Redwood
 * {@code pageTitlePlaceholder} header element) — the create-mode affordance: "New booking…", "New
 * requisition…".
 *
 * <p>It is a placeholder, not a default: it renders only while the page has no title of its own,
 * and is replaced as soon as one exists. Use {@link
 * io.mateu.uidl.interfaces.TitlePlaceholderSupplier} instead when the text depends on runtime
 * state; the supplier wins over this annotation when both are present.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface TitlePlaceholder {

  String value();
}
