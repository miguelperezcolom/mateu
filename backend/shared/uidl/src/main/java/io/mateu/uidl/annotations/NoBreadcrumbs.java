package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Turns the automatic breadcrumb trail off.
 *
 * <p>Every page gets a trail without declaring one: the shell builds it from the menu path to the
 * page's route, then the CRUD level (listing → the record → «Editar» / «Nuevo»). On a page class
 * this hides it for that page (a home, a welcome, a wizard); on the {@code @UI} shell class it
 * hides it for the whole app. An explicit {@link Breadcrumbs} / {@code BreadcrumbsSupplier} still
 * shows.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface NoBreadcrumbs {}
