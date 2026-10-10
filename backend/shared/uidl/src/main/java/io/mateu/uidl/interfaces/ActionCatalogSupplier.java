package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Action;
import java.util.List;

/**
 * Implemented by a BEAN that contributes entries to the app's ACTION catalogue — named,
 * client-runnable actions (flows with {@code steps}, or a {@code restAction}) that the shell menu
 * and any page can run by id. The code twin of {@code specs/ui/actions.yaml}, exactly as {@link
 * RestSourceCatalogSupplier} is the twin of {@code sources.yaml}; the authored file wins over what
 * a supplier contributes.
 *
 * <p>Only client-runnable actions are accepted: an entry with neither steps nor a restAction is
 * dropped with a warning — server logic stays an {@code @Action} method.
 */
public interface ActionCatalogSupplier {

  /** The actions this bean contributes. Empty when it contributes none. */
  List<Action> actionCatalog();
}
