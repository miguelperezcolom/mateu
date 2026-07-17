package io.mateu.core.domain.act;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import jakarta.inject.Named;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

/**
 * The notification inbox's app-level actions (same rail as the {@code @AppContext} pickers' remote
 * search — dispatched with the app's serverSideType, exempt from menu resolution):
 *
 * <ul>
 *   <li>{@code _notifications-list} → {@code Data{_notifications: [...]}} — the current list from
 *       the app's {@link NotificationsSupplier} (per request, so per user).
 *   <li>{@code _notifications-read} with an {@code ids} parameter (list, or "all") → marks them
 *       read and answers the refreshed list.
 * </ul>
 */
@Named
public class NotificationsActionRunner implements ActionRunner {

  public static final String ACTION_PREFIX = "_notifications-";
  public static final String LIST_ACTION = ACTION_PREFIX + "list";
  public static final String READ_ACTION = ACTION_PREFIX + "read";

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return actionId != null && actionId.startsWith(ACTION_PREFIX);
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var supplier = findSupplier(instance, httpRequest);
    if (supplier == null) {
      throw new RuntimeException(
          "the app class does not implement NotificationsSupplier — no inbox to serve");
    }
    if (READ_ACTION.equals(command.actionId())) {
      supplier.markNotificationsRead(readIds(supplier, httpRequest), httpRequest);
    }
    var notifications = supplier.notifications(httpRequest);
    return Flux.just(
        new Data(Map.of("_notifications", notifications != null ? notifications : List.of())));
  }

  /** The ids parameter: an explicit list, or "all" → every unread id. */
  @SuppressWarnings("unchecked")
  private List<String> readIds(NotificationsSupplier supplier, HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var ids = parameters != null ? parameters.get("ids") : null;
    if (ids instanceof List<?> list) {
      return (List<String>) list.stream().map(String::valueOf).toList();
    }
    if ("all".equals(ids)) {
      var notifications = supplier.notifications(httpRequest);
      return notifications == null
          ? List.of()
          : notifications.stream()
              .filter(io.mateu.uidl.data.AppNotification::unread)
              .map(io.mateu.uidl.data.AppNotification::id)
              .toList();
    }
    return ids != null ? List.of(String.valueOf(ids)) : List.of();
  }

  /**
   * The resolved instance may be the app shell wrapper or the home content — walk to the app class
   * exactly like the app-context search does: the widget sends the app's serverSideType.
   */
  @SneakyThrows
  private NotificationsSupplier findSupplier(Object instance, HttpRequest httpRequest) {
    if (instance instanceof NotificationsSupplier supplier) {
      return supplier;
    }
    var serverSideType = httpRequest.runActionRq().serverSideType();
    if (serverSideType != null && !serverSideType.isBlank()) {
      var appClass = Class.forName(serverSideType);
      if (NotificationsSupplier.class.isAssignableFrom(appClass)) {
        return (NotificationsSupplier)
            io.mateu.uidl.di.MateuBeanProvider.getBean(
                    io.mateu.uidl.interfaces.InstanceFactory.class)
                .newInstance(appClass, Map.of(), httpRequest);
      }
    }
    return null;
  }
}
