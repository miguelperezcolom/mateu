package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Turns off the CRUD navigation Mateu adds to a page that overrides a CRUD's sub-screen.
 *
 * <p>When an authored route ({@code routes.yaml} or a {@code RouteEntrySupplier}) binds a CRUD's
 * {@code <crud>/:id}, {@code <crud>/:id/edit} or {@code <crud>/new} to your own view model, that
 * page gets the CRUD's standard navigation without writing it: "Back to list" and "Edit" on the
 * record page, "Cancel" on the editor and on the creation page — labelled by the CRUD's own hooks
 * ({@code backToListLabel()}, {@code editLabel()}, {@code cancelLabel()}), with the CRUD's action
 * ids ({@code cancel-view}, {@code edit}, {@code cancel-edit}, {@code cancel-new}). A button or
 * method of the page with one of those ids wins over the injected one. Put this annotation on the
 * view-model class of a fully custom page to get none of them.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
@Documented
public @interface NoCrudNavigation {}
