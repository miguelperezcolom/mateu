package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.application.runaction.ComponentRegistry;
import io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper;
import io.mateu.dtos.ComponentEntryDto;
import io.mateu.uidl.data.ComponentCatalog;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * Puts the app's business-component catalogue on the wire (coherence-plan #13), the twin of {@link
 * RestSourceCatalogMapper} one level up. A {@code ComponentRef} carries only a name, so the
 * catalogue has to reach the renderer — or the client-side expander — for a reference to mean
 * anything with no backend. Each entry's composition is mapped to the wire here (which also
 * resolves any nested reference). It rides the APP metadata: app-wide configuration, not
 * per-response. Empty for an app that declares no business component.
 */
@Slf4j
final class ComponentCatalogMapper {

  private ComponentCatalogMapper() {}

  static List<ComponentEntryDto> mapCatalogue(
      String baseUrl, String route, HttpRequest httpRequest) {
    var catalog = catalogue();
    if (catalog == null || catalog.hasNoComponents()) {
      return List.of();
    }
    return catalog.components().stream()
        .map(
            entry ->
                new ComponentEntryDto(
                    entry.name(),
                    ComponentToFragmentDtoMapper.mapComponentToDto(
                        null, entry.component(), baseUrl, route, "", null, httpRequest)))
        .toList();
  }

  /**
   * The registry, when there is a container to ask — as in {@link RestSourceCatalogMapper}, an app
   * rendering without its catalogue beats one that will not render at all.
   */
  private static ComponentCatalog catalogue() {
    try {
      var registry = MateuBeanProvider.getBean(ComponentRegistry.class);
      return registry == null ? ComponentCatalog.empty() : registry.catalog();
    } catch (Throwable t) {
      log.debug("No component registry available ({})", t.toString());
      return ComponentCatalog.empty();
    }
  }
}
