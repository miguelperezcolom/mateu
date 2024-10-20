package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.views.SingleComponentView;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
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
  private final ReflectionHelper reflectionHelper;
  private final Serializer serializer;

  public ActualUiInstanceProvider(
      EntityProvider entityProvider,
      ApplicationContext applicationContext,
      ReflectionHelper reflectionHelper,
      Serializer serializer) {
    this.entityProvider = entityProvider;
    this.applicationContext = applicationContext;
    this.reflectionHelper = reflectionHelper;
    this.serializer = serializer;
  }

  @SneakyThrows
  public Object getActualUiInstance(Object uiInstance, ServerHttpRequest serverHttpRequest) {
    Object actualUiInstance = uiInstance;
    if (uiInstance instanceof SingleComponentView singleComponentView) {
      actualUiInstance = singleComponentView.component();
    } else if (uiInstance instanceof ObjectEditor) {
      ObjectEditor objectEditor = (ObjectEditor) uiInstance;
      actualUiInstance = reflectionHelper.newInstance(objectEditor.getType());
      Object filled =
          serializer.fromJson(serializer.toJson(objectEditor.getData()), objectEditor.getType());
      reflectionHelper.copy(filled, actualUiInstance);
    } else if (uiInstance instanceof MethodParametersEditor) {
      // MethodParametersEditor methodParametersEditor = (MethodParametersEditor) uiInstance;
      // actualUiInstance = Helper.fromJson(Helper.toJson(fieldEditor.getData()),
      // fieldEditor.getType());
    } else if (uiInstance instanceof Class
        && Listing.class.isAssignableFrom((Class<?>) uiInstance)) {
      actualUiInstance = reflectionHelper.newInstance((Class) uiInstance);
    }
    return actualUiInstance;
  }
}
