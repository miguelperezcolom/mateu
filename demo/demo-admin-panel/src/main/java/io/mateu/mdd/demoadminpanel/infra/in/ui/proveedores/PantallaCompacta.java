package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Compact;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Semantic CLASS annotation: a high-density screen. Composes @Compact. */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Compact
public @interface PantallaCompacta {}
