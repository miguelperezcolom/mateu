package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.DefaultActionRunnerProvider.asFlux;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.UploadEnabled;
import jakarta.inject.Named;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
public class ImportActionRunner implements ActionRunner {

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return instance instanceof UploadEnabled && "process-import".equals(actionId);
  }

  @Override
  public int priority() {
    return 50;
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var uploadEnabled = (UploadEnabled) instance;
    var params = command.httpRequest().runActionRq().parameters();
    var fileId = params != null ? (String) params.get("fileId") : null;
    var result = uploadEnabled.processUpload(fileId, command.httpRequest());
    return asFlux(result, instance);
  }
}
