package io.mateu.core.domain.act;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Map;
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
@lombok.extern.slf4j.Slf4j
@Named
@Singleton
public class NotificationsActionRunner implements ActionRunner {

  public static final String ACTION_PREFIX = "_notifications-";
  public static final String LIST_ACTION = ACTION_PREFIX + "list";
  public static final String READ_ACTION = ACTION_PREFIX + "read";
  public static final String ACT_ACTION = ACTION_PREFIX + "act";
  public static final String DISMISS_ACTION = ACTION_PREFIX + "dismiss";
  public static final String OPEN_ACTION = ACTION_PREFIX + "open";

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return actionId != null && actionId.startsWith(ACTION_PREFIX);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var supplier = findSupplier(instance, httpRequest);
    if (supplier == null) {
      throw new RuntimeException(
          "the app class does not implement NotificationsSupplier — no inbox to serve");
    }
    var parameters = httpRequest.runActionRq().parameters();
    // every id the panel sends back comes from the browser: the supplier is only handed ids of
    // the CALLER's own list (what it answers for this request) and only the actions an entry offers
    // — an app that looks entries up by id alone must not become a way into another user's inbox
    if (OPEN_ACTION.equals(command.actionId())) {
      // the entry's detail (a drawer, a dialog…) answered like any action's result
      var id = stringOf(parameters, "id");
      var entry = ownEntry(supplier, id, httpRequest);
      if (entry == null || !entry.hasDetail()) {
        return Flux.empty();
      }
      var detail = supplier.notificationDetail(id, httpRequest);
      return detail != null ? Flux.just(detail) : Flux.empty();
    }
    Object result = null;
    if (READ_ACTION.equals(command.actionId())) {
      supplier.markNotificationsRead(readIds(supplier, httpRequest), httpRequest);
    } else if (DISMISS_ACTION.equals(command.actionId())) {
      supplier.dismissNotifications(ownIds(supplier, idsOf(parameters), httpRequest), httpRequest);
    } else if (ACT_ACTION.equals(command.actionId())) {
      var id = stringOf(parameters, "id");
      var actionId = stringOf(parameters, "actionId");
      if (id == null || actionId == null) {
        throw new io.mateu.uidl.UserFacingException("Which notification, and which action?");
      }
      var entry = ownEntry(supplier, id, httpRequest);
      if (entry == null || entry.actions().stream().noneMatch(a -> actionId.equals(a.actionId()))) {
        // one WARN, the reason server-side only: a 403 tells the caller nothing about the entry
        log.warn("Refused {}: the caller's inbox has no entry offering that action", ACT_ACTION);
        throw new io.mateu.core.application.security.MateuForbiddenException(
            ACT_ACTION + ": no such entry/action for the caller");
      }
      result = supplier.onNotificationAction(id, actionId, httpRequest);
    }
    var notifications = supplier.notifications(httpRequest);
    var list =
        new Data(Map.of("_notifications", notifications != null ? notifications : List.of()));
    return result != null ? Flux.just(result, list) : Flux.just(list);
  }

  private static String stringOf(Map<String, Object> parameters, String key) {
    var value = parameters != null ? parameters.get(key) : null;
    return value != null ? String.valueOf(value) : null;
  }

  private static List<String> idsOf(Map<String, Object> parameters) {
    var ids = parameters != null ? parameters.get("ids") : null;
    if (ids instanceof List<?> list) {
      return list.stream().map(String::valueOf).toList();
    }
    return ids != null ? List.of(String.valueOf(ids)) : List.of();
  }

  /** An inbox entry on the wire (the {@code NotificationsChanged} push). */
  public static io.mateu.dtos.AppNotificationDto toDto(io.mateu.uidl.data.AppNotification n) {
    return new io.mateu.dtos.AppNotificationDto(
        n.id(),
        n.title(),
        n.text(),
        n.route(),
        n.unread(),
        n.when(),
        n.category(),
        n.variant() != null
            ? io.mateu.dtos.NotificationVariantDto.valueOf(n.variant().name())
            : null,
        n.resolved(),
        n.actions().stream().map(io.mateu.uidl.data.LongTask::toDto).toList(),
        n.hasDetail());
  }

  /** The caller's own entry {@code id} (in the list the supplier answers for this request). */
  private static io.mateu.uidl.data.AppNotification ownEntry(
      NotificationsSupplier supplier, String id, HttpRequest httpRequest) {
    if (id == null) {
      return null;
    }
    var notifications = supplier.notifications(httpRequest);
    return notifications == null
        ? null
        : notifications.stream()
            .filter(n -> n != null && id.equals(n.id()))
            .findFirst()
            .orElse(null);
  }

  /** {@code ids} kept only when they are the caller's own entries. */
  private static List<String> ownIds(
      NotificationsSupplier supplier, List<String> ids, HttpRequest httpRequest) {
    if (ids.isEmpty()) {
      return ids;
    }
    var notifications = supplier.notifications(httpRequest);
    if (notifications == null) {
      return List.of();
    }
    var own =
        notifications.stream()
            .filter(java.util.Objects::nonNull)
            .map(io.mateu.uidl.data.AppNotification::id)
            .collect(java.util.stream.Collectors.toSet());
    return ids.stream().filter(own::contains).toList();
  }

  /**
   * The ids parameter: an explicit list (of the caller's own entries), or "all" → every unread id.
   */
  private List<String> readIds(NotificationsSupplier supplier, HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var ids = parameters != null ? parameters.get("ids") : null;
    if (ids instanceof List<?> list) {
      return ownIds(supplier, list.stream().map(String::valueOf).toList(), httpRequest);
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
    return ids != null ? ownIds(supplier, List.of(String.valueOf(ids)), httpRequest) : List.of();
  }

  /**
   * The resolved instance may be the app shell wrapper or the home content — walk to the app class
   * exactly like the app-context search does: the widget sends the app's serverSideType.
   */
  private NotificationsSupplier findSupplier(Object instance, HttpRequest httpRequest) {
    if (instance instanceof NotificationsSupplier supplier) {
      return supplier;
    }
    var serverSideType = httpRequest.runActionRq().serverSideType();
    if (serverSideType != null && !serverSideType.isBlank()) {
      var appClass = forName(serverSideType);
      if (NotificationsSupplier.class.isAssignableFrom(appClass)) {
        return (NotificationsSupplier)
            io.mateu.uidl.di.MateuBeanProvider.getSingletonBean(
                    io.mateu.uidl.interfaces.InstanceFactory.class)
                .newInstance(appClass, Map.of(), httpRequest);
      }
    }
    return null;
  }
}
