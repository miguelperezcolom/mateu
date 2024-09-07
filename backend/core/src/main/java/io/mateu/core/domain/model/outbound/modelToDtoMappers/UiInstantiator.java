package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.exceptions.NotFoundException;
import io.mateu.core.domain.uidefinition.core.interfaces.DynamicUI;
import io.mateu.core.domain.uidefinition.core.interfaces.HasInitMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class UiInstantiator {

  private final ReflectionHelper reflectionHelper;

  public UiInstantiator(ReflectionHelper reflectionHelper) {
    this.reflectionHelper = reflectionHelper;
  }

  public Object instantiateUi(String uiId, ServerHttpRequest serverHttpRequest) {
    try {
      Class uiClass = Class.forName(uiId);
      Object uiInstance = reflectionHelper.newInstance(uiClass);

      if (uiInstance == null) {
        throw new Exception();
      }

      if (uiInstance instanceof HasInitMethod) {
        ((HasInitMethod) uiInstance).init(serverHttpRequest);
      }

      if (uiInstance instanceof DynamicUI) {
        return ((DynamicUI) uiInstance).build().toFuture().get();
      }

      return uiInstance;

    } catch (Exception e) {
      //      log.error("error on getUi", e);
      //throw new NotFoundException("No class with name " + uiId + " found");
      throw new RuntimeException(e);
    }
  }
}
