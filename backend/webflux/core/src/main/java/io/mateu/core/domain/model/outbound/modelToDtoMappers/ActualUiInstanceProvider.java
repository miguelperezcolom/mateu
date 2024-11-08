package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.views.SingleComponentView;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ActualUiInstanceProvider {

  private final EntityProvider entityProvider;
  private final ApplicationContext applicationContext;
  private final ReflectionService reflectionService;
  private final SerializerService serializerService;

  public ActualUiInstanceProvider(
      EntityProvider entityProvider,
      ApplicationContext applicationContext,
      ReflectionService reflectionService,
      SerializerService serializerService) {
    this.entityProvider = entityProvider;
    this.applicationContext = applicationContext;
    this.reflectionService = reflectionService;
    this.serializerService = serializerService;
  }

  @SneakyThrows
  public Object getActualUiInstance(Object uiInstance, ServerHttpRequest serverHttpRequest) {
    Object actualUiInstance = uiInstance;
    if (uiInstance instanceof SingleComponentView singleComponentView) {
      actualUiInstance = singleComponentView.component();
    } else if (uiInstance instanceof ObjectEditor) {
      ObjectEditor objectEditor = (ObjectEditor) uiInstance;
      actualUiInstance = reflectionService.newInstance(objectEditor.getType());
      Object filled =
          serializerService.fromJson(
              serializerService.toJson(objectEditor.getData()), objectEditor.getType());
      reflectionService.copy(filled, actualUiInstance);
    } else if (uiInstance instanceof MethodParametersEditor) {
      // MethodParametersEditor methodParametersEditor = (MethodParametersEditor) uiInstance;
      // actualUiInstance = Helper.fromJson(Helper.toJson(fieldEditor.getData()),
      // fieldEditor.getType());
    } else if (uiInstance instanceof Class
        && Listing.class.isAssignableFrom((Class<?>) uiInstance)) {
      actualUiInstance = reflectionService.newInstance((Class) uiInstance);
    }
    return actualUiInstance;
  }
}
