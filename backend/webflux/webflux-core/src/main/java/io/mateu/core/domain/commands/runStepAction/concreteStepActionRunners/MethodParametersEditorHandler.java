package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.reflection.ReflectionService;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MethodParametersEditorHandler {

  private final ReflectionService reflectionService;

  public MethodParametersEditorHandler(ReflectionService reflectionService) {
    this.reflectionService = reflectionService;
  }

  public boolean handles(MethodParametersEditor methodParametersEditor, String actionId) {
    return "run".equals(actionId);
  }

  @SneakyThrows
  public Object getTargetInstance(MethodParametersEditor methodParametersEditor) {
    return reflectionService.newInstance(
        methodParametersEditor.getType(), methodParametersEditor.getData());
  }
}
