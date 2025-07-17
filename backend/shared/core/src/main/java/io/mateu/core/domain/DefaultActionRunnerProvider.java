package io.mateu.core.domain;

import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveCrudlBackend;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

@Named
public class DefaultActionRunnerProvider implements ActionRunnerProvider {

  private final BeanProvider beanProvider;

  public DefaultActionRunnerProvider(BeanProvider beanProvider) {
    this.beanProvider = beanProvider;
  }

  @SneakyThrows
  @Override
  public ActionRunner get(Object instance, String actionId, HttpRequest httpRequest) {
    if (instance == null) {
      throw new NoSuchMethodException("No method with name " + actionId + " on null");
    }
    if (instance instanceof ReactiveHandlesActions handlesActions) {
      if (handlesActions.supportsAction(actionId)) {
        return new ActionRunner() {
          @Override
          public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
            return false;
          }

          @Override
          public Mono<?> run(
              Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
            return handlesActions.handleAction(actionId, httpRequest);
          }
        };
      }
    }
    if (instance instanceof HandlesActions handlesActions) {
      if (handlesActions.supportsAction(actionId)) {
        return new ActionRunner() {
          @Override
          public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
            return false;
          }

          @Override
          public Mono<?> run(
              Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
            return Mono.just(handlesActions.handleAction(actionId, httpRequest));
          }
        };
      }
    }
    if ("search".equals(actionId)) {
      if (instance instanceof ReactiveCrudlBackend<?, ?> crudlBackend) {
        return new ActionRunner() {
          @Override
          public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
            return false;
          }

          @Override
          public Mono<?> run(
              Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
            String searchText = (String) data.getOrDefault("searchText", null);
            int page = (int) data.getOrDefault("page", 0);
            int size = (int) data.getOrDefault("size", 100);
            Sort sort = (Sort) data.getOrDefault("sort", null);
            return ((ReactiveCrudlBackend) crudlBackend)
                .search(searchText, instance, new Pageable(page, size, sort));
          }
        };
      }
      if (instance instanceof CrudlBackend<?, ?> crudlBackend) {
        return new ActionRunner() {
          @Override
          public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
            return false;
          }

          @Override
          public Mono<?> run(
              Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
            String searchText = (String) data.getOrDefault("searchText", null);
            int page = (int) data.getOrDefault("page", 0);
            int size = (int) data.getOrDefault("size", 100);
            Sort sort = (Sort) data.getOrDefault("sort", null);
            return Mono.just(
                ((CrudlBackend) crudlBackend)
                    .search(searchText, instance, new Pageable(page, size, sort)));
          }
        };
      }
    }
    if ("".equals(actionId)) {
      return new ActionRunner() {
        @Override
        public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
          return false;
        }

        @Override
        public Mono<?> run(
            Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
          return Mono.just(instance);
        }
      };
    }
    var runner =
        beanProvider.getBeans(ActionRunner.class).stream()
            .filter(factory -> factory.supports(instance, actionId, httpRequest))
            .min(Comparator.comparingInt(ActionRunner::priority));
    if (runner.isEmpty()) {
      throw new NoSuchMethodException(
          "No method with name " + actionId + " on " + instance.getClass().getName());
    }
    return runner.get();
  }
}
