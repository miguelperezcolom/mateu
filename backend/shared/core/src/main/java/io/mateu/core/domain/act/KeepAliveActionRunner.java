package io.mateu.core.domain.act;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.KeepAliveHandler;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Map;
import reactor.core.publisher.Flux;

/**
 * The idle-session warning's "Stay signed in": the {@code _keep-alive} app-level action. Reaching
 * the server is most of it (that is what renews an ordinary server session); an app class
 * implementing {@link KeepAliveHandler} is called too, to refresh whatever else "signed in" means
 * for it. Answers an empty increment.
 */
@Named
@Singleton
public class KeepAliveActionRunner implements ActionRunner {

  public static final String ACTION_ID = "_keep-alive";

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return ACTION_ID.equals(actionId);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var handler = findHandler(instance, httpRequest);
    if (handler != null) {
      handler.keepAlive(httpRequest);
    }
    return Flux.just(UIIncrementDto.builder().build());
  }

  private KeepAliveHandler findHandler(Object instance, HttpRequest httpRequest) {
    if (instance instanceof KeepAliveHandler handler) {
      return handler;
    }
    var serverSideType = httpRequest.runActionRq().serverSideType();
    if (serverSideType != null && !serverSideType.isBlank()) {
      var appClass = forName(serverSideType);
      if (KeepAliveHandler.class.isAssignableFrom(appClass)) {
        return (KeepAliveHandler)
            io.mateu.uidl.di.MateuBeanProvider.getSingletonBean(
                    io.mateu.uidl.interfaces.InstanceFactory.class)
                .newInstance(appClass, Map.of(), httpRequest);
      }
    }
    return null;
  }
}
