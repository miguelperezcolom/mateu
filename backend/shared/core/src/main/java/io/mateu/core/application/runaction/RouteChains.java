package io.mateu.core.application.runaction;

import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;

import io.mateu.core.application.runaction.RouteRegistry.ChainLink;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.di.MateuBeanProvider;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * Route-chain helpers for the places that are not beans (mappers, static resolvers): the registry
 * is looked up lazily and every helper answers "nothing" rather than throwing, so a deployment with
 * no authored routes — or a unit test with no registry — behaves exactly as before.
 *
 * <p>The chain is what {@link RouteEntry#parent} means at runtime. A child route ({@code
 * customers/:customerId/orders}) is the content of its parent's slot, so a request for it renders
 * the outermost ancestor that is not on screen yet — an {@code @App}, typically {@code App(TABS)} —
 * and that ancestor renders the rest of the path as its own content.
 */
@Slf4j
public final class RouteChains {

  private RouteChains() {}

  static RouteRegistry registry() {
    try {
      return MateuBeanProvider.getBean(RouteRegistry.class);
    } catch (Throwable t) {
      return null;
    }
  }

  /**
   * The ancestor of {@code path} that has to render it: the outermost level of its chain beyond
   * {@code consumedRoute}, when that level is an ANCESTOR (not the route itself) backed by an app
   * class — an app has a slot to render the rest into. Empty otherwise, which leaves resolution to
   * the class answering the full path, as before.
   */
  public static Optional<ChainLink> pendingAppAncestor(String path, String consumedRoute) {
    var registry = registry();
    if (registry == null || path == null) {
      return Optional.empty();
    }
    try {
      var chain = registry.chain(path);
      if (chain.size() < 2) {
        return Optional.empty();
      }
      var pending = registry.outermostPending(path, consumedRoute).orElse(null);
      if (pending == null || pending.equals(chain.get(chain.size() - 1))) {
        return Optional.empty();
      }
      var viewModel = pending.entry().viewModel();
      if (viewModel == null || viewModel.isBlank()) {
        return Optional.empty();
      }
      var type = Class.forName(viewModel, false, Thread.currentThread().getContextClassLoader());
      if (!isApp(type, pending.path())) {
        log.debug(
            "route {}: parent {} is not an app, so it has no slot; resolving the child alone",
            path,
            viewModel);
        return Optional.empty();
      }
      return Optional.of(pending);
    } catch (Throwable t) {
      log.debug("route chain of {}: {}", path, t.toString());
      return Optional.empty();
    }
  }

  /**
   * The path parameters of the request route's chain that {@code type} has a field for — what a new
   * child record created under a master starts with ({@code customerId} under {@code
   * /customers/7/orders/new}). Empty when the route has no chain.
   */
  public static java.util.Map<String, Object> scopeValuesFor(
      Class<?> type, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    if (type == null || httpRequest == null || httpRequest.runActionRq() == null) {
      return java.util.Map.of();
    }
    var chain = chainOf(httpRequest.runActionRq().route());
    if (chain.size() < 2) {
      return java.util.Map.of();
    }
    var fields = new java.util.HashSet<String>();
    io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields(type)
        .forEach(field -> fields.add(field.getName()));
    var values = new java.util.LinkedHashMap<String, Object>();
    chain.forEach(
        link ->
            link.pathParams()
                .forEach(
                    (name, value) -> {
                      if (fields.contains(name)) {
                        values.put(name, value);
                      }
                    }));
    return values;
  }

  /** The chain answering {@code path} (outermost first), or empty — never throws. */
  public static List<ChainLink> chainOf(String path) {
    var registry = registry();
    if (registry == null || path == null) {
      return List.of();
    }
    try {
      return registry.chain(path);
    } catch (Throwable t) {
      return List.of();
    }
  }

  /**
   * The class that has to render {@code path} inside an app mounted at {@code consumedRoute}, read
   * off the chain: the outermost pending level when it is an app ancestor (it renders the rest in
   * its slot), or the leaf a longer path runs into (a record inside a tab's crud — {@code
   * /customers/7/orders/7-2} is the orders listing's to resolve). {@code null} when the chain has
   * no say: a route with no parent, or one answered exactly by its own entry.
   */
  public static String screenFor(String path, String consumedRoute) {
    var ancestor = pendingAppAncestor(path, consumedRoute);
    if (ancestor.isPresent()) {
      return ancestor.get().entry().viewModel();
    }
    var registry = registry();
    if (registry == null || path == null) {
      return null;
    }
    try {
      var chain = registry.chain(path);
      if (chain.size() < 2) {
        return null;
      }
      var leaf = chain.get(chain.size() - 1);
      var requested = "/" + io.mateu.core.infra.Slashes.trim(path.split("\\?")[0]);
      var pending = registry.outermostPending(path, consumedRoute).orElse(null);
      if (leaf.equals(pending) && !requested.equals(leaf.path())) {
        var viewModel = leaf.entry().viewModel();
        return viewModel == null || viewModel.isBlank() ? null : viewModel;
      }
      return null;
    } catch (Throwable t) {
      return null;
    }
  }

  /**
   * A title the screen should NOT repeat: {@code title} when the request is a routed tab's own page
   * (the route answered exactly by a child entry) and {@code title} equals that tab's label or the
   * enclosing master's {@code @Title} — composition draws the label once (the tab), not three times
   * (OCI's Policies page: page H1, tab and listing H2 all reading "Policies"). Otherwise {@code
   * title} unchanged.
   */
  public static String dedupeTitle(String title, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    if (title == null
        || title.isBlank()
        || httpRequest == null
        || httpRequest.runActionRq() == null) {
      return title;
    }
    try {
      var route = httpRequest.runActionRq().route();
      var chain = chainOf(route);
      if (chain.size() < 2) {
        return title;
      }
      var leaf = chain.get(chain.size() - 1);
      var requested =
          "/" + io.mateu.core.infra.Slashes.trim(route == null ? "" : route.split("\\?")[0]);
      if (!requested.equals(leaf.path())) {
        return title; // a record inside the tab: its own title
      }
      var parent = chain.get(chain.size() - 2);
      var relative = leaf.path().substring(Math.min(parent.path().length(), leaf.path().length()));
      var label = tabLabel(leaf.entry(), relative);
      if (title.trim().equalsIgnoreCase(label.trim())) {
        return null;
      }
      var parentTitle = staticTitleOf(parent.entry().viewModel());
      if (parentTitle != null && title.trim().equalsIgnoreCase(parentTitle.trim())) {
        return null;
      }
      return title;
    } catch (Throwable t) {
      return title;
    }
  }

  /**
   * The label of a child route offered as a tab: its view model's {@code @Title}, else its segment.
   */
  public static String tabLabel(RouteEntry child, String relative) {
    var title = staticTitleOf(child.viewModel());
    if (title != null) {
      return title;
    }
    var trimmed = io.mateu.core.infra.Slashes.trim(relative);
    var last = trimmed.contains("/") ? trimmed.substring(trimmed.lastIndexOf('/') + 1) : trimmed;
    return io.mateu.uidl.Humanizer.toUpperCaseFirst(last.replace('-', ' '));
  }

  private static String staticTitleOf(String viewModel) {
    if (viewModel == null || viewModel.isBlank()) {
      return null;
    }
    try {
      var type = Class.forName(viewModel, false, Thread.currentThread().getContextClassLoader());
      var title =
          io.mateu.core.infra.reflection.MetaAnnotations.find(
              type, io.mateu.uidl.annotations.Title.class);
      return title != null && !title.value().isBlank() ? title.value() : null;
    } catch (Throwable t) {
      return null;
    }
  }

  /**
   * Whether the request route runs through an app ancestor declared {@code @App(backLink =
   * PARENT)}: its pages show no breadcrumb trail (the app's "← Parent" link replaces it).
   */
  public static boolean insideBackLinkApp(io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    if (httpRequest == null || httpRequest.runActionRq() == null) {
      return false;
    }
    var chain = chainOf(httpRequest.runActionRq().route());
    for (int i = 0; i < chain.size() - 1; i++) {
      var viewModel = chain.get(i).entry().viewModel();
      if (viewModel == null || viewModel.isBlank()) {
        continue;
      }
      try {
        var type = Class.forName(viewModel, false, Thread.currentThread().getContextClassLoader());
        var app =
            io.mateu.core.infra.reflection.MetaAnnotations.find(
                type, io.mateu.uidl.annotations.App.class);
        if (app != null && app.backLink() == io.mateu.uidl.annotations.BackLink.PARENT) {
          return true;
        }
      } catch (Throwable ignored) {
        // not a class we can read: no say
      }
    }
    return false;
  }

  /**
   * The concrete path of the default child of the route answering {@code concretePath} ({@code
   * /customers/7/orders} for {@code /customers/7}), or {@code null} when it has no children.
   */
  public static String defaultChildPath(String concretePath) {
    return defaultChildPath(concretePath, null);
  }

  /**
   * The default child of the route answering {@code concretePath} among the children VISIBLE for
   * this request: the one its {@code defaultChild} names when that one shows, else the first that
   * does. {@code null} when it has no (visible) children.
   */
  public static String defaultChildPath(
      String concretePath, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var registry = registry();
    if (registry == null || concretePath == null) {
      return null;
    }
    try {
      var children = visibleChildrenOf(concretePath, httpRequest);
      if (children.isEmpty()) {
        return null;
      }
      var normalized = io.mateu.core.infra.Slashes.trim(concretePath);
      var match = registry.authored().match(normalized).orElse(null);
      var named = match == null ? null : match.entry().defaultChild();
      if (named != null && !named.isBlank()) {
        var wanted = "/" + io.mateu.core.infra.Slashes.trim(named);
        for (var child : children) {
          if (child.relative().equals(wanted)) {
            return child.path();
          }
        }
      }
      return children.get(0).path();
    } catch (Throwable t) {
      return null;
    }
  }

  /**
   * {@link #childrenOf} without the ones whose {@code show} flag is off, or whose {@code access:}
   * the caller does not satisfy, for this request.
   */
  public static List<ChildRoute> visibleChildrenOf(
      String concretePath, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    return childrenOf(concretePath).stream()
        .filter(
            child ->
                io.mateu.core.domain.FeatureFlagGate.shows(child.entry().show(), httpRequest)
                    && io.mateu.core.domain.Authorizer.isAuthorized(
                        child.entry().access(), httpRequest))
        .toList();
  }

  /**
   * The authored children of the route answering {@code concretePath}, each with its concrete path
   * — what an app with no menu of its own offers as its tabs.
   */
  public static List<ChildRoute> childrenOf(String concretePath) {
    var registry = registry();
    if (registry == null || concretePath == null) {
      return List.of();
    }
    try {
      var normalized = io.mateu.core.infra.Slashes.trim(concretePath);
      var match = registry.authored().match(normalized).orElse(null);
      if (match == null) {
        return List.of();
      }
      var parentRoute = io.mateu.core.infra.Slashes.trim(match.entry().route());
      return registry.childrenOf(parentRoute).stream()
          .map(
              child -> {
                var childRoute = io.mateu.core.infra.Slashes.trim(child.route());
                var suffix =
                    childRoute.substring(Math.min(parentRoute.length(), childRoute.length()));
                if (!suffix.startsWith("/")) {
                  suffix = "/" + suffix;
                }
                return new ChildRoute(child, suffix, "/" + normalized + suffix);
              })
          .toList();
    } catch (Throwable t) {
      return List.of();
    }
  }

  /**
   * A child route as seen from a concrete parent path.
   *
   * @param relative the child's path relative to the parent, with a leading slash ({@code /orders})
   * @param path the child's concrete absolute path ({@code /customers/7/orders})
   */
  public record ChildRoute(RouteEntry entry, String relative, String path) {}
}
