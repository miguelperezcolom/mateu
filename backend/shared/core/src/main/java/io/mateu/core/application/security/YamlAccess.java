package io.mateu.core.application.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.domain.Authorizer;
import io.mateu.uidl.data.Access;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

/**
 * The access keys of a YAML definition, applied for ONE request — the data twin of
 * {@code @EyesOnly} / {@code @ReadOnlyUnless} / {@code @DisabledUnless}, evaluated by the same
 * {@link Authorizer}.
 *
 * <p>The keys are an overlay every component accepts (like {@code note:}), so they are not record
 * components: this pass reads them off the parsed tree BEFORE it is mapped into records, rewrites
 * the tree for the caller's identity and strips them. What reaches the wire is what the caller may
 * see — a restriction is decided here, on the server, never shipped for the browser to honour.
 *
 * <ul>
 *   <li>{@code eyesOnly:} (or {@code access:}) on a component — removed;
 *   <li>{@code readOnlyUnless:} — {@code readOnly: true} on it and on every field under it;
 *   <li>{@code disabledUnless:} — {@code disabled: true} (a {@code FormField}, which has no
 *       disabled state, becomes read-only);
 *   <li>{@code access:} on an {@code actions:} entry — removed (not advertised), its id reported in
 *       {@link Applied#refusedActions()} so the server refuses it if called anyway, and any {@code
 *       Button} naming it disabled;
 *   <li>{@code access:} on a menu item — removed; a {@code RouteLink} with no {@code access:} of
 *       its own inherits the one of the route it points at, and a {@code Menu} group left empty
 *       goes too.
 * </ul>
 *
 * Fields that end up hidden or read-only are reported in {@link Applied#lockedFields()}: their
 * values must not be accepted from the client either (the {@code Hydrater} does the same for the
 * annotations), or a read-only field would be a suggestion.
 */
public final class YamlAccess {

  public static final String ACCESS = "access";
  public static final String EYES_ONLY = "eyesOnly";
  public static final String READ_ONLY_UNLESS = "readOnlyUnless";
  public static final String DISABLED_UNLESS = "disabledUnless";

  private static final List<String> KEYS =
      List.of(ACCESS, EYES_ONLY, READ_ONLY_UNLESS, DISABLED_UNLESS);

  private YamlAccess() {}

  /**
   * The tree for one request, plus what it took away.
   *
   * @param refusedActions ids of declared actions the caller may not run
   * @param lockedFields ids of the fields hidden or made read-only for the caller
   */
  public record Applied(JsonNode tree, Set<String> refusedActions, Set<String> lockedFields) {}

  /** An {@code access:}-shaped node as a restriction, or null when absent/empty. */
  public static Access accessOf(JsonNode node) {
    if (node == null || node.isNull()) {
      return null;
    }
    if (node.isTextual() || node.isArray()) {
      // `access: admin` / `access: [admin, hr]` — the roles shorthand
      return nonEmpty(new Access(strings(node), null, null, null));
    }
    if (!node.isObject()) {
      return null;
    }
    return nonEmpty(
        new Access(
            strings(node.get("roles")),
            strings(node.get("groups")),
            strings(node.get("scopes")),
            strings(node.get("permissions"))));
  }

  private static Access nonEmpty(Access access) {
    return access.restricts() ? access : null;
  }

  private static List<String> strings(JsonNode node) {
    var out = new ArrayList<String>();
    if (node == null || node.isNull()) {
      return out;
    }
    if (node.isArray()) {
      node.forEach(n -> out.add(n.asText()));
    } else {
      for (var part : node.asText().split(",")) {
        if (!part.isBlank()) {
          out.add(part.trim());
        }
      }
    }
    return out;
  }

  /** Whether the tree declares any access key anywhere — a tree that does not can be cached. */
  public static boolean declaresAccess(JsonNode node) {
    if (node == null) {
      return false;
    }
    if (node.isObject()) {
      for (var key : KEYS) {
        if (node.has(key)) {
          return true;
        }
      }
      for (var it = node.elements(); it.hasNext(); ) {
        if (declaresAccess(it.next())) {
          return true;
        }
      }
      return false;
    }
    if (node.isArray()) {
      for (var child : node) {
        if (declaresAccess(child)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Applies the access keys of {@code root} for {@code httpRequest}, on a COPY.
   *
   * @param routeReachable whether the caller may reach a route — consulted for a {@code RouteLink}
   *     that declares no {@code access:} of its own, so a link to a refused route is not offered
   *     (null = no inheritance)
   */
  public static Applied apply(
      JsonNode root, HttpRequest httpRequest, Predicate<String> routeReachable) {
    return apply(root, httpRequest, routeReachable, Set.of());
  }

  /**
   * As {@link #apply(JsonNode, HttpRequest, Predicate)}, with {@code alsoRefused}: ids of actions
   * declared ELSEWHERE (the action catalogue) that the caller may not run — buttons naming them are
   * disabled and they are reported as refused, exactly like a restricted page action.
   */
  public static Applied apply(
      JsonNode root,
      HttpRequest httpRequest,
      Predicate<String> routeReachable,
      Set<String> alsoRefused) {
    if (root == null) {
      return new Applied(null, Set.of(), Set.of());
    }
    var copy = root.deepCopy();
    var walker = new Walker(httpRequest, routeReachable);
    if (walker.removes(copy, null)) {
      return new Applied(null, walker.refused, walker.locked);
    }
    walker.walk(copy, null, false);
    if (alsoRefused != null) {
      walker.refused.addAll(alsoRefused);
    }
    if (!walker.refused.isEmpty()) {
      disableButtonsFor(copy, walker.refused);
    }
    return new Applied(copy, Set.copyOf(walker.refused), Set.copyOf(walker.locked));
  }

  private static final class Walker {

    private final HttpRequest httpRequest;
    private final Predicate<String> routeReachable;
    private final Set<String> refused = new LinkedHashSet<>();
    private final Set<String> locked = new LinkedHashSet<>();

    Walker(HttpRequest httpRequest, Predicate<String> routeReachable) {
      this.httpRequest = httpRequest;
      this.routeReachable = routeReachable;
    }

    private boolean granted(Access access) {
      return access == null || Authorizer.isAuthorized(access, httpRequest);
    }

    /** Whether this node must disappear for the caller (recording why, when it matters). */
    boolean removes(JsonNode node, String containerKey) {
      if (!(node instanceof ObjectNode object)) {
        return false;
      }
      var access = accessOf(object.get(ACCESS));
      var linkRefused =
          access == null
              && routeReachable != null
              && "RouteLink".equals(object.path("type").asText())
              && object.hasNonNull("route")
              && !routeReachable.test(object.get("route").asText());
      var eyesOnly = accessOf(object.get(EYES_ONLY));
      if (!linkRefused && granted(access) && granted(eyesOnly)) {
        return false;
      }
      if ("actions".equals(containerKey) && object.hasNonNull("id")) {
        refused.add(object.get("id").asText());
      }
      lockFieldsUnder(object);
      return true;
    }

    void walk(JsonNode node, String containerKey, boolean readOnly) {
      if (node instanceof ObjectNode object) {
        var isField = "FormField".equals(object.path("type").asText());
        if (!granted(accessOf(object.get(READ_ONLY_UNLESS)))) {
          readOnly = true;
        }
        if (!granted(accessOf(object.get(DISABLED_UNLESS)))) {
          if (isField) {
            object.put("readOnly", true);
            lock(object);
          } else {
            object.put("disabled", true);
          }
        }
        if (readOnly && isField) {
          object.put("readOnly", true);
          lock(object);
        } else if (readOnly && object.has("readOnly")) {
          object.put("readOnly", true);
        }
        KEYS.forEach(object::remove);
        var names = new ArrayList<String>();
        object.fieldNames().forEachRemaining(names::add);
        for (var name : names) {
          var child = object.get(name);
          if (child.isObject() && removes(child, name)) {
            object.remove(name);
          } else if (child.isContainerNode()) {
            var wasNonEmptyArray = child.isArray() && !child.isEmpty();
            walk(child, name, readOnly);
            // A menu group whose every entry was taken away is no group at all.
            if (wasNonEmptyArray
                && child.isEmpty()
                && "submenu".equals(name)
                && "Menu".equals(object.path("type").asText())) {
              object.put("__emptied", true);
            }
          }
        }
      } else if (node instanceof ArrayNode array) {
        for (Iterator<JsonNode> it = array.iterator(); it.hasNext(); ) {
          var child = it.next();
          if (removes(child, containerKey)) {
            it.remove();
            continue;
          }
          walk(child, containerKey, readOnly);
          if (child instanceof ObjectNode o && o.has("__emptied")) {
            it.remove();
          }
        }
      }
    }

    private void lock(ObjectNode field) {
      if (field.hasNonNull("id")) {
        locked.add(field.get("id").asText());
      }
    }

    private void lockFieldsUnder(JsonNode node) {
      if (node instanceof ObjectNode object && "FormField".equals(object.path("type").asText())) {
        lock(object);
      }
      if (node != null && node.isContainerNode()) {
        node.elements().forEachRemaining(this::lockFieldsUnder);
      }
    }
  }

  /** Disables every {@code Button} that names an action the caller may not run. */
  private static void disableButtonsFor(JsonNode node, Set<String> refused) {
    if (node instanceof ObjectNode object
        && "Button".equals(object.path("type").asText())
        && object.hasNonNull("actionId")
        && refused.contains(object.get("actionId").asText())) {
      object.put("disabled", true);
    }
    if (node != null && node.isContainerNode()) {
      node.elements().forEachRemaining(child -> disableButtonsFor(child, refused));
    }
  }
}
