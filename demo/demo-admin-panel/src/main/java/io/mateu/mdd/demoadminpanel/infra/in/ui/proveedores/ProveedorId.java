package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.annotations.Lookup;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Semantic ("componente semántico") annotation: a field that holds a supplier id. Composes
 * {@link Lookup} with the supplier's options/label suppliers, so a developer just writes
 * {@code @ProveedorId String proveedorId;} instead of repeating the @Lookup configuration.
 *
 * <p>Mateu resolves it via {@code MetaAnnotations} (an annotation meta-annotated with @Lookup is
 * treated as a @Lookup).
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Lookup(search = ProveedorOptionsSupplier.class, label = ProveedorLabelSupplier.class)
public @interface ProveedorId {}
