package io.mateu.explorer.examples.behaviour.semanticannotations;

import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** A DOMAIN annotation: "the total amount of an order", meaning a labelled, explained money field. */
@Stereotype(FieldStereotype.money)
@Label("Total amount")
@Help("Taxes included")
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface TotalAmount {}
