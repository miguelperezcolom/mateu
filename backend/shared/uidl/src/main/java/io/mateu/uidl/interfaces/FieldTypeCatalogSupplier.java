package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.FieldTypeEntry;
import java.util.List;

/**
 * Implemented by a BEAN that contributes FIELD TYPES to the app's domain vocabulary in code — the
 * programmatic twin of {@code specs/ui/types.yaml}, as {@link RestSourceCatalogSupplier} is of
 * {@code sources.yaml}. The authored file wins over what a bean contributes, entry by entry.
 */
@Experimental("field types (types.yaml)")
public interface FieldTypeCatalogSupplier {

  /** The field types this bean contributes. Empty when it contributes none. */
  List<FieldTypeEntry> fieldTypes();
}
