package io.mateu.core.domain.queries.getUI;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UiInstantiator;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.dtos.UI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class GetUIQueryHandler {

  final UIMapper uiMapper;
  final ReflectionHelper reflectionHelper;
  final UiInstantiator uiInstantiator;

  public UI run(GetUIQuery query, ServerHttpRequest serverHttpRequest) throws Exception {

    String uiId = query.getUiId();

    Object uiInstance = uiInstantiator.instantiateUi(uiId, serverHttpRequest);

    UI ui = uiMapper.map(uiInstance, serverHttpRequest);

    return ui;
  }
}
