package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Loads an app shell from a {@code type: AppShell} DEFINITION file — the data-driven counterpart of
 * an {@code @App} class.
 *
 * <p>The app is a view like any other: its definition (a YAML file, discriminated by {@code type:
 * AppShell}) is bound to a route in the mount's route registry (typically the root {@code ""}), and
 * may also carry a {@code viewModel} on that route entry. This replaces the earlier {@code app:}
 * block inside {@code routes.yaml}, which mixed the routing table with the app view.
 *
 * <p>What is parsed maps onto {@link AppShell} directly. {@code menu:} is a list of {@link
 * Actionable} ({@code RouteLink}, {@code Menu}, {@code RemoteMenu}…) and {@code widgets:} a list of
 * {@link Component}; both deserialize through the same polymorphic {@code type:} discriminator as
 * page layouts (see {@link YamlUidlMapperFactory}). Scalars ({@code title}, {@code subtitle},
 * {@code logo}, {@code favicon}, {@code variant}, {@code layout}, {@code drawerClosed}, {@code
 * homeRoute}…) are read off the node. {@code homeRoute} defaults to the mount's {@code home:} (see
 * {@link #load(String, String)}), else to the first navigable menu item.
 *
 * <p>{@code actions:} declares the shell's flows (same shape as a page definition's), which a menu
 * {@code RuleLink} with a {@code RunAction} rule runs client-side. The header switches {@code
 * themeToggle}, {@code commandCenter}, {@code chromeless} and {@code accessKeys} are read too.
 *
 * <p><b>Not carried yet</b>: the flags {@code AppMapper} re-reads reflectively from the app class
 * (SSE/MCP/upload URLs, {@code @AppContext} selectors, notifications, global search, FABs). They
 * need a class and are a follow-up.
 */
@Slf4j
@Named
@Singleton
public class YamlAppLoader implements io.mateu.core.infra.dev.SpecsCache {

  private final ObjectMapper mapper = YamlUidlMapperFactory.create();

  // Definitions are static files: parse once per path. A miss (absent, unparseable, or not an
  // AppShell) is cached as NONE so a route pointing at a non-shell definition isn't re-read
  // forever.
  private static final AppShell NONE = AppShell.builder().clientSideComponentId("__none__").build();
  private final ConcurrentHashMap<String, AppShell> byPath = new ConcurrentHashMap<>();
  // Definitions that declare their own `homeRoute:` — a mount's `home:` never overrides those.
  private final java.util.Set<String> declaresHomeRoute = ConcurrentHashMap.newKeySet();

  public YamlAppLoader() {
    io.mateu.core.infra.dev.DevSpecs.register(this);
  }

  /** Dev mode: a spec changed — every app shell is read again on next use. */
  @Override
  public void invalidateSpecs() {
    byPath.clear();
    declaresHomeRoute.clear();
  }

  /**
   * The {@link AppShell} declared by the definition file at {@code definitionPath}, or {@code null}
   * when the file is absent, unparseable, or is not a {@code type: AppShell} definition (e.g. it is
   * a plain page). Never throws: a broken definition must not take the app down.
   */
  public AppShell load(String definitionPath) {
    if (definitionPath == null || definitionPath.isBlank()) {
      return null;
    }
    var shell = byPath.computeIfAbsent(definitionPath, this::loadUncached);
    return shell == NONE ? null : shell;
  }

  /**
   * As {@link #load(String)}, for a shell bound to the root of a mount whose descriptor declares
   * {@code home:}: when the shell itself declares no {@code homeRoute:}, it lands on {@code
   * mountHome} instead of its first navigable menu item. A shell's own {@code homeRoute:} wins.
   */
  public AppShell load(String definitionPath, String mountHome) {
    var shell = load(definitionPath);
    if (shell == null
        || mountHome == null
        || mountHome.isBlank()
        || declaresHomeRoute.contains(definitionPath)) {
      return shell;
    }
    return shell.withHomeRoute(mountHome);
  }

  /** Whether the definition at {@code definitionPath} is a {@code type: AppShell}. */
  public boolean isAppShell(String definitionPath) {
    return load(definitionPath) != null;
  }

  private AppShell loadUncached(String definitionPath) {
    try (InputStream is = resolve(definitionPath(definitionPath))) {
      if (is == null) {
        return NONE;
      }
      var root = mapper.readTree(is);
      var shell = parse(root);
      if (shell != null && root.hasNonNull("homeRoute")) {
        declaresHomeRoute.add(definitionPath);
      }
      return shell == null ? NONE : shell;
    } catch (Exception e) {
      log.warn("Failed to read app shell definition {}: {}", definitionPath, e.getMessage());
      return NONE;
    }
  }

  /**
   * Builds the {@link AppShell} from a parsed definition tree, or {@code null} when it is not a
   * {@code type: AppShell}. Package-visible so a test can feed a tree directly.
   */
  AppShell parse(JsonNode root) throws Exception {
    if (root == null || !root.isObject()) {
      return null;
    }
    var type = root.hasNonNull("type") ? root.get("type").asText() : null;
    if (!"AppShell".equals(type)) {
      return null; // a page/partial definition, not an app shell
    }
    var builder = AppShell.builder();

    text(root, "title", builder::title);
    text(root, "subtitle", builder::subtitle);
    text(root, "pageTitle", builder::pageTitle);
    text(root, "logo", builder::logo);
    text(root, "favicon", builder::favicon);
    text(root, "style", builder::style);
    text(root, "cssClasses", builder::cssClasses);
    text(root, "route", builder::route);
    text(root, "accentColor", builder::accentColor);
    if (root.hasNonNull("backLink")) {
      builder.backLink(
          enumValue(
              io.mateu.uidl.annotations.BackLink.class,
              root.get("backLink").asText(),
              io.mateu.uidl.annotations.BackLink.BREADCRUMBS));
    }

    if (root.hasNonNull("variant")) {
      builder.variant(enumValue(AppVariant.class, root.get("variant").asText(), AppVariant.AUTO));
    }
    if (root.hasNonNull("layout")) {
      builder.layout(
          enumValue(AppLayout.class, root.get("layout").asText(), AppLayout.SINGLE_SLOT));
    }
    bool(root, "themeToggle", builder::themeToggle);
    bool(root, "commandCenter", builder::commandCenter);
    bool(root, "chromeless", builder::chromeless);
    bool(root, "accessKeys", builder::accessKeys);
    if (root.hasNonNull("drawerClosed")) {
      builder.drawerClosed(root.get("drawerClosed").asBoolean());
    }

    var menuItems = new java.util.ArrayList<Actionable>();
    if (root.has("menu") && root.get("menu").isArray()) {
      for (var node : root.get("menu")) {
        menuItems.add(mapper.treeToValue(node, Actionable.class));
      }
    }
    menuItems.forEach(builder::menuItem);

    // A data-authored shell has no class carrying @HomeRoute, so its home defaults to the first
    // navigable menu item unless it declares `homeRoute:`. Without it the shell would load its own
    // root route "" (→ the shell again → a re-render loop the client's loop-guard has to stop).
    if (root.hasNonNull("homeRoute")) {
      builder.homeRoute(root.get("homeRoute").asText());
    } else {
      firstNavigableRoute(menuItems).ifPresent(builder::homeRoute);
    }

    // The shell's FLOWS: `actions:` with `steps:`, the very shape a page definition declares. A
    // menu leaf (`RuleLink` with a `RunAction` rule) naming one runs it in the browser.
    YamlUidlLoader.actionsOf(mapper, root).forEach(builder::action);

    if (root.has("widgets") && root.get("widgets").isArray()) {
      for (var node : root.get("widgets")) {
        builder.widget(mapper.treeToValue(node, Component.class));
      }
    }

    var shell = builder.build();
    log.info(
        "Loaded AppShell definition (title='{}', {} menu items, {} actions, {} widgets)",
        shell.title(),
        shell.menu().size(),
        shell.actions().size(),
        shell.widgets().size());
    return shell;
  }

  /**
   * Where a declared {@code definition} lives: relative to {@code specs/ui/}, or
   * classpath-absolute.
   */
  private static String definitionPath(String definition) {
    return definition.startsWith("/") ? definition.substring(1) : "specs/ui/" + definition;
  }

  private static java.util.Optional<String> firstNavigableRoute(java.util.List<Actionable> items) {
    for (var item : items) {
      if (item instanceof io.mateu.uidl.data.RouteLink link) {
        var route = link.route() != null && !link.route().isBlank() ? link.route() : link.path();
        if (route != null && !route.isBlank()) {
          return java.util.Optional.of(route);
        }
      } else if (item.path() != null && !item.path().isBlank()) {
        return java.util.Optional.of(item.path());
      }
    }
    return java.util.Optional.empty();
  }

  private static void text(
      JsonNode node, String field, java.util.function.Consumer<String> setter) {
    if (node.hasNonNull(field)) {
      setter.accept(node.get(field).asText());
    }
  }

  private static void bool(
      JsonNode node, String field, java.util.function.Consumer<Boolean> setter) {
    if (node.hasNonNull(field)) {
      setter.accept(node.get(field).asBoolean());
    }
  }

  private static <E extends Enum<E>> E enumValue(Class<E> type, String raw, E fallback) {
    try {
      return Enum.valueOf(type, raw.trim());
    } catch (IllegalArgumentException e) {
      log.warn("Unknown {} '{}'; using {}", type.getSimpleName(), raw, fallback);
      return fallback;
    }
  }

  private InputStream resolve(String path) {
    var context = Thread.currentThread().getContextClassLoader();
    var resource =
        context != null
            ? io.mateu.core.infra.dev.DevSpecs.classLoader(context).getResourceAsStream(path)
            : null;
    if (resource == null) {
      resource =
          io.mateu.core.infra.dev.DevSpecs.classLoader(YamlAppLoader.class.getClassLoader())
              .getResourceAsStream(path);
    }
    return resource;
  }
}
