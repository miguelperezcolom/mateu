package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Semantic METHOD annotation: a "Guardar" toolbar action. Composes @Toolbar + @Label. */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Toolbar
@Label("Guardar")
public @interface AccionGuardar {}
