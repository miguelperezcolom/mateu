package io.mateu.core.domain.act;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
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
    // the app's own inbox (if it has one) and the entries Mateu keeps for the signed-in caller
    // (inbox messages — InboxStore): one list for the bell
    var inbox = new CallerInbox(findSupplier(instance, httpRequest), httpRequest);
    var parameters = httpRequest.runActionRq().parameters();
    // every id the panel sends back comes from the browser: the supplier is only handed ids of
    // the CALLER's own list (what it answers for this request) and only the actions an entry offers
    // — an app that looks entries up by id alone must not become a way into another user's inbox
    if (OPEN_ACTION.equals(command.actionId())) {
      // the entry's detail (a drawer, a dialog…) answered like any action's result
      var id = stringOf(parameters, "id");
      var entry = inbox.ownEntry(id);
      if (entry == null || !entry.hasDetail() || inbox.supplier == null || inbox.isStored(id)) {
        return Flux.empty();
      }
      var detail = inbox.supplier.notificationDetail(id, httpRequest);
      return detail != null ? Flux.just(detail) : Flux.empty();
    }
    Object result = null;
    if (READ_ACTION.equals(command.actionId())) {
      inbox.markRead(readIds(inbox, parameters));
    } else if (DISMISS_ACTION.equals(command.actionId())) {
      inbox.dismiss(inbox.ownIds(idsOf(parameters)));
    } else if (ACT_ACTION.equals(command.actionId())) {
      var id = stringOf(parameters, "id");
      var actionId = stringOf(parameters, "actionId");
      if (id == null || actionId == null) {
        throw new io.mateu.uidl.UserFacingException("Which notification, and which action?");
      }
      var entry = inbox.ownEntry(id);
      if (entry == null
          || inbox.supplier == null
          || inbox.isStored(id)
          || entry.actions().stream().noneMatch(a -> actionId.equals(a.actionId()))) {
        // one WARN, the reason server-side only: a 403 tells the caller nothing about the entry
        log.warn("Refused {}: the caller's inbox has no entry offering that action", ACT_ACTION);
        throw new io.mateu.core.application.security.MateuForbiddenException(
            ACT_ACTION + ": no such entry/action for the caller");
      }
      result = inbox.supplier.onNotificationAction(id, actionId, httpRequest);
    }
    var list = new Data(Map.of("_notifications", inbox.list()));
    return result != null ? Flux.just(result, list) : Flux.just(list);
  }

  /**
   * The caller's inbox for one request: the app supplier's entries first, then the ones Mateu
   * stored for the signed-in caller ({@code InboxStore}; an id the supplier already lists is
   * skipped). Each half is read once, and again for the list answered after a change.
   */
  private static final class CallerInbox {
    final NotificationsSupplier supplier;
    final HttpRequest httpRequest;
    final String principal;
    List<AppNotification> supplied;
    List<AppNotification> stored;

    CallerInbox(NotificationsSupplier supplier, HttpRequest httpRequest) {
      this.supplier = supplier;
      this.httpRequest = httpRequest;
      this.principal = io.mateu.core.application.notifications.Inbox.principalOf(httpRequest);
    }

    List<AppNotification> supplied() {
      if (supplied == null) {
        var list = supplier != null ? supplier.notifications(httpRequest) : null;
        supplied = list != null ? list.stream().filter(Objects::nonNull).toList() : List.of();
      }
      return supplied;
    }

    List<AppNotification> stored() {
      if (stored == null) {
        if (principal == null) {
          stored = List.of();
        } else {
          var own = supplied().stream().map(AppNotification::id).collect(Collectors.toSet());
          var list = io.mateu.core.application.notifications.Inbox.store().list(principal);
          stored =
              list == null
                  ? List.of()
                  : list.stream()
                      .filter(n -> n != null && n.id() != null && !own.contains(n.id()))
                      .toList();
        }
      }
      return stored;
    }

    /** The list the bell shows, read afresh. */
    List<AppNotification> list() {
      supplied = null;
      stored = null;
      var all = new ArrayList<>(supplied());
      all.addAll(stored());
      return all;
    }

    Stream<AppNotification> all() {
      return Stream.concat(supplied().stream(), stored().stream());
    }

    boolean isStored(String id) {
      return id != null && stored().stream().anyMatch(n -> id.equals(n.id()));
    }

    AppNotification ownEntry(String id) {
      return id == null ? null : all().filter(n -> id.equals(n.id())).findFirst().orElse(null);
    }

    List<String> ownIds(List<String> ids) {
      if (ids.isEmpty()) {
        return ids;
      }
      var own = all().map(AppNotification::id).collect(Collectors.toSet());
      return ids.stream().filter(own::contains).toList();
    }

    List<String> unreadIds() {
      return all().filter(AppNotification::unread).map(AppNotification::id).toList();
    }

    void markRead(List<String> ids) {
      var toStore = ids.stream().filter(this::isStored).toList();
      var toSupplier = ids.stream().filter(id -> !toStore.contains(id)).toList();
      if (!toStore.isEmpty()) {
        io.mateu.core.application.notifications.Inbox.store().markRead(principal, toStore);
      }
      if (supplier != null && (!toSupplier.isEmpty() || toStore.isEmpty())) {
        supplier.markNotificationsRead(toSupplier, httpRequest);
      }
    }

    void dismiss(List<String> ids) {
      var toStore = ids.stream().filter(this::isStored).toList();
      var toSupplier = ids.stream().filter(id -> !toStore.contains(id)).toList();
      if (!toStore.isEmpty()) {
        io.mateu.core.application.notifications.Inbox.store().dismiss(principal, toStore);
      }
      if (supplier != null && (!toSupplier.isEmpty() || toStore.isEmpty())) {
        supplier.dismissNotifications(toSupplier, httpRequest);
      }
    }
  }

  /** The ids parameter: an explicit list (of the caller's own entries), or "all" → every unread. */
  private static List<String> readIds(CallerInbox inbox, Map<String, Object> parameters) {
    var ids = parameters != null ? parameters.get("ids") : null;
    if (ids instanceof List<?> list) {
      return inbox.ownIds(list.stream().map(String::valueOf).toList());
    }
    if ("all".equals(ids)) {
      return inbox.unreadIds();
    }
    return ids != null ? inbox.ownIds(List.of(String.valueOf(ids))) : List.of();
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
