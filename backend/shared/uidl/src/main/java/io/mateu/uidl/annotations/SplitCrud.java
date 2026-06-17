package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Switches a {@link io.mateu.core.infra.declarative.orchestrators.crud.Crud} to a
 * split-panel layout: the record list is displayed on the left and the create/edit form on the
 * right, both visible at the same time.
 *
 * <p>Differences from the default (full-page) CRUD layout:
 *
 * <ul>
 *   <li>The app layout is set to {@code SPLIT} automatically.
 *   <li>The <em>Cancel</em> button is hidden in the create form (navigation back is implicit).
 *   <li>After saving a record the list is refreshed automatically so it stays in sync.
 * </ul>
 *
 * <pre>{@code
 * @UI("/products")
 * @SplitCrud
 * public class ProductsCrud extends AutoCrud<Product> { ... }
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface SplitCrud {}
