package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getContent;

import io.mateu.uidl.di.BeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import io.mateu.uidl.reflection.ComponentMapper;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.util.Collection;
import lombok.RequiredArgsConstructor;

@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ComponentMapperBean implements ComponentMapper {

  private final Translator translator;
  private final BeanProvider beanProvider;

  @Override
  public Collection<? extends Component> mapToComponents(
      Object object,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    TranslatorContext.set(translator, httpRequest);
    ExporterContext.set(
        !beanProvider.getBeans(ExcelExporter.class).isEmpty(),
        !beanProvider.getBeans(PdfExporter.class).isEmpty(),
        !beanProvider.getBeans(CsvExporter.class).isEmpty());
    try {
      return getContent(object, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    } finally {
      TranslatorContext.clear();
      ExporterContext.clear();
    }
  }
}
