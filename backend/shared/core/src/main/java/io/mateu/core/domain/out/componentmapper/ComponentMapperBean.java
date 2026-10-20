package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getContent;

import io.mateu.uidl.di.BeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import io.mateu.uidl.reflection.ComponentMapper;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Collection;
import lombok.RequiredArgsConstructor;

@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ComponentMapperBean implements ComponentMapper {

  private final Translator translator;
  private final BeanProvider beanProvider;

  /**
   * The formats the app's {@link ListingExporter} beans write, found once: the set of exporters is
   * fixed once the container is up, and asking for them on every mapped component was a {@code
   * getBeansOfType} per request. Only the formats are kept, never an exporter instance.
   */
  private volatile java.util.Set<io.mateu.uidl.data.ExportFormat> exportFormats;

  private java.util.Set<io.mateu.uidl.data.ExportFormat> exportFormats() {
    var known = exportFormats;
    if (known == null) {
      known =
          java.util.Collections.unmodifiableSet(
              io.mateu.core.domain.act.ListingExporters.formats(
                  beanProvider.getBeans(ListingExporter.class)));
      exportFormats = known;
    }
    return known;
  }

  @Override
  public Collection<? extends Component> mapToComponents(
      Object object,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    TranslatorContext.set(translator, httpRequest);
    ExporterContext.set(exportFormats());
    io.mateu.core.domain.RequestBound.bind(object, httpRequest);
    try {
      return getContent(object, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    } finally {
      TranslatorContext.clear();
      ExporterContext.clear();
    }
  }
}
