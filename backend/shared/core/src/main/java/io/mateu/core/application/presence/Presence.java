package io.mateu.core.application.presence;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.dtos.PresenceDto;
import io.mateu.dtos.PresenceEntryDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.data.PresenceMember;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PresenceStore;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * RECORD PRESENCE ({@code @App(presence = true)}): who else has a record page open, and who is
 * editing it.
 *
 * <ul>
 *   <li>A record is its ROUTE (mount-relative, normalised: no query, no surrounding slashes, a
 *       trailing {@code /edit} or {@code /view} dropped — viewing {@code orders/7} and editing
 *       {@code orders/7/edit} are the same record) plus the view class; a create page ({@code
 *       …/new}) is no record yet and takes no part. No new id concept.
 *   <li>A SCOPE is one app: the base url the request arrived at plus the app class — presence of
 *       one app never reaches another.
 *   <li>Only a signed-in caller takes part, under the name the host framework authenticated ({@code
 *       IdentityResolver}); an anonymous caller neither shows nor sees anyone.
 *   <li>A tab reports itself every {@value #HEARTBEAT_SECONDS} s (the {@value #ACTION_ID} app-level
 *       action); a copy not seen for {@value #TTL_SECONDS} s is gone — a closed tab disappears even
 *       when its "leave" never arrived.
 * </ul>
 *
 * The answer, and every change pushed on the app event stream, lists the OTHER people (one entry
 * per person, editing if any of their tabs edits): the recipient is never in it.
 */
public final class Presence {

  public static final String ACTION_ID = "_presence";
  public static final int HEARTBEAT_SECONDS = 10;
  public static final int TTL_SECONDS = 30;
  static final Duration TTL = Duration.ofSeconds(TTL_SECONDS);
  static final int MAX_TAB_LENGTH = 64;
  static final int MAX_ROUTE_LENGTH = 512;
  static final int MAX_NAME_LENGTH = 80;

  private static final InMemoryPresenceStore DEFAULT = new InMemoryPresenceStore();
  private static final long SWEEP_EVERY_MILLIS = 5_000;
  private static final AtomicLong LAST_SWEEP = new AtomicLong();

  /** The clock — replaceable by the package's tests. */
  static volatile Clock clock = Clock.systemUTC();

  private Presence() {}

  /** The store in use: the app's {@code PresenceStore} bean, else Mateu's in-memory one. */
  public static PresenceStore store() {
    try {
      var beans = io.mateu.uidl.di.MateuBeanProvider.getSingletonBeans(PresenceStore.class);
      if (!beans.isEmpty()) {
        return beans.iterator().next();
      }
    } catch (RuntimeException noContainer) {
      // no bean provider (a plain unit test): the default store
    }
    return DEFAULT;
  }

  static Instant now() {
    return clock.instant();
  }

  /** The signed-in caller's name, or null for an anonymous caller (who takes no part). */
  public static String principalOf(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    var name = io.mateu.core.infra.security.IdentityResolver.resolve(httpRequest).name();
    return name == null || name.isBlank() ? null : name;
  }

  /** The app a request belongs to: the base url it arrived at + the app class. */
  public static String scopeOf(Object instance, RunActionCommand command) {
    var type = command.serverSideType();
    if (type == null || type.isBlank()) {
      type = instance != null ? instance.getClass().getName() : "";
    }
    return (command.baseUrl() != null ? command.baseUrl() : "") + "|" + type;
  }

  /**
   * Whether presence is on for the app of the request: a class carrying {@code @App} must say
   * {@code presence = true}; a data-authored shell (no class to read) decides on the client.
   */
  public static boolean enabledFor(Object instance, RunActionCommand command) {
    Class<?> appClass = null;
    var type = command.serverSideType();
    if (type != null && !type.isBlank()) {
      try {
        appClass = forName(type);
      } catch (RuntimeException unknown) {
        appClass = null;
      }
    }
    if (appClass == null && instance != null) {
      appClass = instance.getClass();
    }
    if (appClass == null) {
      return true;
    }
    var app = io.mateu.core.infra.reflection.MetaAnnotations.find(appClass, App.class);
    return app == null || app.presence();
  }

  /**
   * The record a page is: its normalised route + "|" + its view class; null when it is no record
   * (blank, a create page).
   */
  public static String recordOf(String route, String view) {
    if (route == null) {
      return null;
    }
    var path = route;
    var cut = path.indexOf('?');
    if (cut >= 0) path = path.substring(0, cut);
    cut = path.indexOf('#');
    if (cut >= 0) path = path.substring(0, cut);
    path = path.replaceAll("/{2,}", "/").replaceAll("^/+", "").replaceAll("/+$", "");
    if (path.endsWith("/edit")) path = path.substring(0, path.length() - "/edit".length());
    else if (path.endsWith("/view")) path = path.substring(0, path.length() - "/view".length());
    if (path.isEmpty()
        || path.equals("new")
        || path.endsWith("/new")
        || path.length() > MAX_ROUTE_LENGTH) {
      return null;
    }
    var viewClass = view == null ? "" : view.trim();
    if (viewClass.length() > MAX_ROUTE_LENGTH) return null;
    return path + "|" + viewClass;
  }

  /** {@code record}'s people for {@code principal}: everyone else, one entry per person. */
  public static PresenceDto snapshot(String scope, String record, String principal) {
    var members = store().members(scope, record, now().minus(TTL));
    var byPerson = new LinkedHashMap<String, PresenceEntryDto>();
    for (var member : members) {
      if (member.principal() == null || member.principal().equals(principal)) continue;
      var since = member.since() != null ? member.since().toString() : null;
      byPerson.merge(
          member.principal(),
          new PresenceEntryDto(member.name(), member.editing(), since),
          (a, b) -> new PresenceEntryDto(a.name(), a.editing() || b.editing(), a.since()));
    }
    return new PresenceDto(record, new ArrayList<>(byPerson.values()));
  }

  /** Whether {@code principal} has {@code record} open (any tab): who a pushed change is for. */
  public static boolean isOn(String scope, String record, String principal) {
    if (principal == null) return false;
    for (var member : store().members(scope, record, now().minus(TTL))) {
      if (principal.equals(member.principal())) return true;
    }
    return false;
  }

  /** Records (or refreshes) a tab on a record; false when the store refused it (a bound). */
  public static boolean touch(
      String scope, String record, String principal, String name, String tab, boolean editing) {
    var now = now();
    return store()
        .touch(
            scope,
            record,
            PresenceMember.builder()
                .principal(principal)
                .name(clip(name != null && !name.isBlank() ? name : principal, MAX_NAME_LENGTH))
                .tab(clip(tab, MAX_TAB_LENGTH))
                .editing(editing)
                .since(now)
                .lastSeen(now)
                .build());
  }

  public static void leave(String scope, String record, String principal, String tab) {
    store().leave(scope, record, principal, clip(tab, MAX_TAB_LENGTH));
  }

  /** Forgets the copies whose tab went silent — at most every few seconds, whoever calls. */
  public static void sweep() {
    var nowMillis = now().toEpochMilli();
    var last = LAST_SWEEP.get();
    if (nowMillis - last < SWEEP_EVERY_MILLIS && nowMillis >= last) return;
    if (!LAST_SWEEP.compareAndSet(last, nowMillis)) return;
    store().expire(now().minus(TTL));
  }

  /** Lets the next {@link #sweep()} run at once (tests). */
  static void resetSweep() {
    LAST_SWEEP.set(0);
  }

  public static UICommandDto command(PresenceDto presence) {
    return new UICommandDto(null, UICommandTypeDto.PresenceChanged, presence);
  }

  private static String clip(String value, int max) {
    if (value == null) return null;
    return value.length() > max ? value.substring(0, max) : value;
  }
}
