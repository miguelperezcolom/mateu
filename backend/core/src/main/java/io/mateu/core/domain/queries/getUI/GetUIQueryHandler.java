package io.mateu.core.domain.queries.getUI;

import io.mateu.core.application.NotFoundException;
import io.mateu.core.domain.model.modelToDtoMappers.UIMapper;
import io.mateu.mdd.core.interfaces.DynamicUI;
import io.mateu.mdd.core.interfaces.HasInitMethod;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.UI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetUIQueryHandler {

  final UIMapper uiMapper;
  final ReflectionHelper reflectionHelper;

  public UI run(GetUIQuery query, ServerHttpRequest serverHttpRequest) {

    String uiId = query.getUiId();

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

      UI ui = uiMapper.map(uiInstance, serverHttpRequest);

      return ui;

    } catch (Exception e) {
      //      log.error("error on getUi", e);
      throw new NotFoundException("No class with name " + uiId + " found");
    }
  }
}
