package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.dynamic.DynamicUI;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.interfaces.HasInitMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class UiInstantiator {

  private final ReflectionService reflectionService;

  public UiInstantiator(ReflectionService reflectionService) {
    this.reflectionService = reflectionService;
  }

  public Object instantiateUi(String uiId, ServerHttpRequest serverHttpRequest) {
    try {
      Class uiClass = Class.forName(uiId);
      Object uiInstance = reflectionService.newInstance(uiClass);

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
      // throw new NotFoundException("No class with name " + remoteUiId + " found");
      throw new RuntimeException(e);
    }
  }
}
