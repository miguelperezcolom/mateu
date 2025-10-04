package io.mateu.core.domain.reflection;

import static io.mateu.core.domain.DefaultActionRunnerProvider.asFlux;

import io.mateu.core.domain.ActionRunner;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ContentSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
public class ComponentTreeActionRunner implements ActionRunner {

  // todo: cacheable?
  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    if (instance instanceof ComponentTreeSupplier componentTreeSupplier) {
      var button = findButton(componentTreeSupplier, actionId, httpRequest);
      if (button == null) {
        return false;
      }
      if (button.runnable() != null || button.callable() != null) {
        return true;
      }
    }
    return false;
  }

  @Override
  public int priority() {
    return 100;
  }

  @SneakyThrows
  @Override
  public Flux<?> run(
      Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
    Button button = findButton((ComponentTreeSupplier) instance, actionId, httpRequest);
    Object result = null;
    if (button != null) {
      if (button.runnable() != null) {
        button.runnable().run();
      }
      if (button.callable() != null) {
        result = button.callable().call();
      }
    }
    return asFlux(result, instance);
  }

  private Button findButton(
      ComponentTreeSupplier componentTreeSupplier, String actionId, HttpRequest httpRequest) {
    var root = componentTreeSupplier.component(httpRequest);
    return findButton(root, actionId);
  }

  private Button findButton(Component component, String actionId) {
    if (component instanceof Button button && actionId.equals(button.actionId())) {
      return button;
    }
    if (component instanceof Form form) {
      if (form.header() != null) {
        for (Component child : form.header()) {
          var found = findButton(child, actionId);
          if (found != null) {
            return found;
          }
        }
      }
      if (form.footer() != null) {
        for (Component child : form.footer()) {
          var found = findButton(child, actionId);
          if (found != null) {
            return found;
          }
        }
      }
    }
    if (component instanceof ContentSupplier hasContent) {
      for (Component child : hasContent.content()) {
        var found = findButton(child, actionId);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }
}
