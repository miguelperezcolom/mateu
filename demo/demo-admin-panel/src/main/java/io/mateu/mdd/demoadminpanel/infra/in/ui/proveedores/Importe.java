package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Semantic annotation for a monetary amount. Composes {@link Stereotype} with the money stereotype,
 * so a developer writes just {@code @Importe BigDecimal total;} instead of
 * {@code @Stereotype(FieldStereotype.money)}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Stereotype(FieldStereotype.money)
public @interface Importe {}
