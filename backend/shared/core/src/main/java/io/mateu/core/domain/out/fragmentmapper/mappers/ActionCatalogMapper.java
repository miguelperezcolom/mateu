package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.application.runaction.ActionRegistry;
import io.mateu.dtos.ActionDto;
import io.mateu.uidl.data.ActionCatalog;
import io.mateu.uidl.di.MateuBeanProvider;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

/**
 * Puts the app's ACTION catalogue on the wire — each flow LOWERED to commands by the same mapper a
 * page's actions go through, so a client applies an entry exactly like an owner's own action.
 *
 * <p>It rides the APP metadata (like the REST source catalogue): app-wide configuration, not
 * per-response. An empty catalogue costs an empty list.
 */
@Slf4j
public final class ActionCatalogMapper {

  private ActionCatalogMapper() {}

  /** The whole catalogue as wire actions; empty when there is none or no registry to ask. */
  public static List<ActionDto> mapCatalogue() {
    return map(catalogue());
  }

  /** A catalogue as wire actions (also what the bundle manifest ships, once). */
  public static List<ActionDto> map(ActionCatalog catalogue) {
    if (catalogue == null || catalogue.hasNoActions()) {
      return List.of();
    }
    return catalogue.actions().stream().map(ActionDtoMapper::mapAction).toList();
  }

  /**
   * The catalogue entries for the given ids (plus the entries their flows name in turn), never one
   * an owner already has — see {@link ActionRegistry#referencedBy}.
   */
  static List<ActionDto> referenced(Collection<String> ids, Set<String> owned) {
    var registry = registry();
    if (registry == null || ids.isEmpty()) {
      return List.of();
    }
    // the registry walks a tree for action ids: hand it one naming exactly these
    var tree = ids.stream().map(id -> Map.of("actionId", id)).toList();
    return registry.referencedBy(tree, List.of(), owned).stream()
        .map(ActionDtoMapper::mapAction)
        .toList();
  }

  private static ActionRegistry registry() {
    try {
      return MateuBeanProvider.getBean(ActionRegistry.class);
    } catch (Throwable t) {
      log.debug("No action registry available ({})", t.toString());
      return null;
    }
  }

  private static ActionCatalog catalogue() {
    var registry = registry();
    return registry == null ? ActionCatalog.empty() : registry.catalog();
  }
}
