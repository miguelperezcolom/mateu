package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Semantic annotation that bundles SEVERAL field annotations into one: the money stereotype, a
 * label and a helper text. A field annotated {@code @ImporteTotal} resolves each of them
 * independently via {@code MetaAnnotations}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Stereotype(FieldStereotype.money)
@Label("Importe total (€)")
@Help("Importe total del pedido, IVA incluido")
public @interface ImporteTotal {}
