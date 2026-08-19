package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.application.runaction.RestSourceRegistry;
import io.mateu.dtos.RestSourceEntryDto;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.di.MateuBeanProvider;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * Puts the app's REST source catalogue on the wire.
 *
 * <p>A surface referencing a source carries only its name, so the catalogue has to reach the
 * renderer for the reference to mean anything. It rides the APP metadata rather than every
 * response: it is app-wide configuration that changes between deployments, not between clicks.
 *
 * <p>An empty catalogue is the normal case for an app that declares no named source, and costs an
 * empty list on the wire.
 */
@Slf4j
final class RestSourceCatalogMapper {

  private RestSourceCatalogMapper() {}

  /** The catalogue as wire entries; empty when there is none or it cannot be read. */
  static List<RestSourceEntryDto> mapCatalogue() {
    return map(catalogue());
  }

  static List<RestSourceEntryDto> map(RestSourceCatalog catalogue) {
    if (catalogue == null || catalogue.isEmpty()) {
      return List.of();
    }
    return catalogue.sources().stream().map(RestSourceCatalogMapper::map).toList();
  }

  private static RestSourceEntryDto map(RestSourceEntry entry) {
    return new RestSourceEntryDto(
        entry.name(),
        FieldMapper.mapRestDataSource(entry.source()),
        entry.fields(),
        entry.totalPath(),
        entry.effectiveProvenance().name(),
        entry.description());
  }

  /**
   * The registry, when there is a container to ask. There is not, for instance, in a bare unit test
   * that maps a component directly — and an app rendering without its catalogue is a far better
   * outcome than one that will not render at all.
   */
  private static RestSourceCatalog catalogue() {
    try {
      var registry = MateuBeanProvider.getBean(RestSourceRegistry.class);
      return registry == null ? RestSourceCatalog.empty() : registry.catalog();
    } catch (Throwable t) {
      log.debug("No REST source registry available ({})", t.toString());
      return RestSourceCatalog.empty();
    }
  }
}
