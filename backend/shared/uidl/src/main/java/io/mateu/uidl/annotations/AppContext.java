package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Turns a field of the {@code @UI} app class into an APPLICATION-LEVEL CONTEXT SELECTOR: a widget
 * on the app header that fixes a value for every screen of the app — the active hotel in a PMS, the
 * company in a multi-tenant ERP, the fiscal year…
 *
 * <p>The field's type provides the choices: an enum (its constants) or any class implementing
 * {@code LookupOptionsSupplier} (searched with an empty text at app build time). The selected
 * option's value is kept in the app state under the field's name, persisted client-side and sent
 * with EVERY request, so any screen or action can read it with {@code
 * httpRequest.appContext("<fieldName>")}; picking a different value reloads the current route so
 * the whole screen rebuilds against the new context.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface AppContext {

  /** Label shown next to the selector on the header; defaults to the humanized field name. */
  String label() default "";
}
