package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RestDataSourceDto;
import io.mateu.dtos.RestSourceEntryDto;
import io.mateu.dtos.UIIncrementDto;
import java.lang.reflect.RecordComponent;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Puts on a response the catalogue entries its components name by {@code ref}.
 *
 * <p>The whole REST source catalogue rides the APP metadata ({@code AppDto.restSources}). A page
 * served with no app shell — a plain {@code @UI} page, a definition-only YAML route opened on its
 * own — never receives an {@code AppDto}, so a surface naming a source by {@code ref} could not be
 * resolved in the browser: a by-ref REST action failed with only a console warning. Each response
 * therefore also carries the entries IT references (not the whole table), whatever is mounted
 * around it.
 *
 * <p>A response that already carries the app's catalogue gets nothing extra. The walk is the same
 * generic walk of the wire records as {@link TreeActionHarvester}, so a surface moving or a new one
 * appearing does not make it go blind.
 */
public final class ReferencedRestSources {

  private ReferencedRestSources() {}

  /** The increment with the entries it references; the same instance when there are none. */
  public static UIIncrementDto apply(UIIncrementDto increment) {
    if (increment == null) {
      return null;
    }
    var walk = new Walk();
    walk.collect(increment.commands());
    walk.collect(increment.fragments());
    if (walk.carriesCatalogue || walk.refs.isEmpty()) {
      return increment;
    }
    List<RestSourceEntryDto> referenced =
        RestSourceCatalogMapper.mapCatalogue().stream()
            .filter(entry -> walk.refs.contains(entry.name()))
            .toList();
    return referenced.isEmpty() ? increment : increment.withRestSources(referenced);
  }

  private static final class Walk {
    final Set<String> refs = new LinkedHashSet<>();
    final Map<Object, Boolean> visited = new IdentityHashMap<>();
    boolean carriesCatalogue;

    void collect(Object node) {
      if (node == null || node instanceof String || visited.put(node, Boolean.TRUE) != null) {
        return;
      }
      if (node instanceof Collection<?> items) {
        items.forEach(this::collect);
        return;
      }
      if (node instanceof Map<?, ?> map) {
        map.values().forEach(this::collect);
        return;
      }
      if (node instanceof AppDto app && app.restSources() != null && !app.restSources().isEmpty()) {
        carriesCatalogue = true;
      }
      if (node instanceof RestDataSourceDto source
          && source.ref() != null
          && !source.ref().isBlank()) {
        refs.add(source.ref().trim());
      }
      if (node instanceof ClientSideComponentDto client) {
        collect(client.metadata());
        collect(client.children());
        return;
      }
      var type = node.getClass();
      if (!type.isRecord() || !type.getPackageName().startsWith("io.mateu.dtos")) {
        return;
      }
      for (RecordComponent component : type.getRecordComponents()) {
        try {
          collect(component.getAccessor().invoke(node));
        } catch (ReflectiveOperationException e) {
          // an accessor that cannot be read names nothing
        }
      }
    }
  }
}
