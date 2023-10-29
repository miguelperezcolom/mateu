package io.mateu.core.domain.queries.getUI;

import io.mateu.core.application.NotFoundException;
import io.mateu.core.domain.model.modelToDtoMappers.UIMapper;
import io.mateu.mdd.core.interfaces.DynamicUI;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.UI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GetUIQueryHandler {

  @Autowired UIMapper uiMapper;

  public UI run(GetUIQuery query, ServerHttpRequest serverHttpRequest) {

    String uiId = query.getUiId();

    try {
      Class uiClass = Class.forName(uiId);
      Object uiInstance = ReflectionHelper.newInstance(uiClass);

      if (uiInstance == null) {
        throw new Exception();
      }

      if (uiInstance instanceof DynamicUI) {
        return ((DynamicUI) uiInstance).build().toFuture().get();
      }

      UI ui = uiMapper.map(uiInstance, serverHttpRequest);

      return ui;

    } catch (Exception e) {
      e.printStackTrace();
      log.error("error on getUi", e);
      throw new NotFoundException("No class with name " + uiId + " found");
    }
  }
}
