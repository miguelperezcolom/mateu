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
import lombok.extern.slf4j.Slf4j;

/**
 * Loads a mount's app shell (title, menu, widgets, chrome) from the {@code app:} block of {@code
 * specs/ui/routes.yaml} — the data-driven counterpart of an {@code @App}-annotated class.
 *
 * <p>The app chrome lives with the routes it wraps because both are properties of the same mount: a
 * UI application served at a base path. {@code routes.yaml} already carries an envelope ({@code
 * routes:}); {@code app:} is the sibling key that describes the shell around them. A mount authored
 * entirely in YAML — no {@code @App} class — is what a fully static deployment needs.
 *
 * <p>What is parsed maps onto {@link AppShell} directly. {@code menu:} is a list of {@link
 * Actionable} ({@code RouteLink}, {@code Menu}, {@code RemoteMenu}…) and {@code widgets:} a list of
 * {@link Component}; both deserialize through the same polymorphic {@code type:} discriminator as
 * page layouts (see {@link YamlUidlMapperFactory}), so no new wiring is needed for them. Scalars
 * ({@code title}, {@code subtitle}, {@code logo}, {@code favicon}, {@code variant}, {@code layout},
 * {@code drawerClosed}, {@code style}, {@code cssClasses}) are read off the node.
 *
 * <p><b>Not carried yet</b>: the flags {@code AppMapper} re-reads reflectively from the app class
 * (theme toggle, command center, chromeless, SSE/MCP/upload URLs, {@code @AppContext} selectors,
 * notifications, global search, FABs). They need a class to exist and are a follow-up that promotes
 * them onto {@link AppShell}.
 */
@Slf4j
@Named
@Singleton
public class YamlAppLoader {

  /** The mount descriptor: the same file the {@link RouteRegistry} reads. */
  static final String ROUTES_YAML = "specs/ui/routes.yaml";

  private final ObjectMapper mapper = YamlUidlMapperFactory.create();

  // The descriptor is a static file: parse once. `loaded` distinguishes "no app block" (a valid,
  // cached null) from "not looked yet".
  private volatile boolean loaded;
  private volatile AppShell cached;

  /**
   * The mount's app shell as authored in {@code specs/ui/routes.yaml}, or {@code null} when the
   * file is absent, unparseable, or declares no {@code app:} block. Never throws: a broken
   * descriptor must not take the app down, exactly like {@link RouteRegistry}.
   */
  public AppShell app() {
    if (!loaded) {
      synchronized (this) {
        if (!loaded) {
          cached = load();
          loaded = true;
        }
      }
    }
    return cached;
  }

  private AppShell load() {
    try (InputStream is = resolve(ROUTES_YAML)) {
      if (is == null) {
        return null;
      }
      var root = mapper.readTree(is);
      return parse(root);
    } catch (Exception e) {
      log.warn("Failed to read app block of {}: {}", ROUTES_YAML, e.getMessage());
      return null;
    }
  }

  /**
   * Builds the {@link AppShell} from a parsed {@code routes.yaml} tree, or {@code null} when there
   * is no {@code app:} block. Package-visible so a test can feed a tree without a classpath
   * resource at the fixed {@link #ROUTES_YAML} path (which would collide with other fixtures).
   */
  AppShell parse(JsonNode root) throws Exception {
    if (root == null || !root.hasNonNull("app") || !root.get("app").isObject()) {
      return null;
    }
    var app = root.get("app");
    var builder = AppShell.builder();

    text(app, "title", builder::title);
    text(app, "subtitle", builder::subtitle);
    text(app, "pageTitle", builder::pageTitle);
    text(app, "logo", builder::logo);
    text(app, "favicon", builder::favicon);
    text(app, "style", builder::style);
    text(app, "cssClasses", builder::cssClasses);
    text(app, "route", builder::route);

    if (app.hasNonNull("variant")) {
      builder.variant(enumValue(AppVariant.class, app.get("variant").asText(), AppVariant.AUTO));
    }
    if (app.hasNonNull("layout")) {
      builder.layout(enumValue(AppLayout.class, app.get("layout").asText(), AppLayout.SINGLE_SLOT));
    }
    if (app.hasNonNull("drawerClosed")) {
      builder.drawerClosed(app.get("drawerClosed").asBoolean());
    }

    var menuItems = new java.util.ArrayList<Actionable>();
    if (app.has("menu") && app.get("menu").isArray()) {
      for (var node : app.get("menu")) {
        menuItems.add(mapper.treeToValue(node, Actionable.class));
      }
    }
    menuItems.forEach(builder::menuItem);

    // A YAML mount has no class carrying @HomeRoute, so its home defaults to the first navigable
    // menu item unless the block declares `homeRoute:`. Without it the shell would load its own
    // root
    // route "" (→ the shell again → a re-render loop the client's loop-guard has to stop).
    if (app.hasNonNull("homeRoute")) {
      builder.homeRoute(app.get("homeRoute").asText());
    } else {
      firstNavigableRoute(menuItems).ifPresent(builder::homeRoute);
    }

    if (app.has("widgets") && app.get("widgets").isArray()) {
      for (var node : app.get("widgets")) {
        builder.widget(mapper.treeToValue(node, Component.class));
      }
    }

    var shell = builder.build();
    log.info(
        "Loaded YAML app shell from {} (title='{}', {} menu items, {} widgets)",
        ROUTES_YAML,
        shell.title(),
        shell.menu().size(),
        shell.widgets().size());
    return shell;
  }

  /**
   * The route of the first menu entry that navigates somewhere — a {@code RouteLink} (its {@code
   * route}, else its {@code path}) or any actionable with a {@code path}. Used as the shell's home
   * when the block declares no explicit {@code homeRoute:}.
   */
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

  private static <E extends Enum<E>> E enumValue(Class<E> type, String raw, E fallback) {
    try {
      return Enum.valueOf(type, raw.trim());
    } catch (IllegalArgumentException e) {
      log.warn("Unknown {} '{}' in {}; using {}", type.getSimpleName(), raw, ROUTES_YAML, fallback);
      return fallback;
    }
  }

  private InputStream resolve(String path) {
    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl != null ? cl.getResourceAsStream(path) : null;
    if (resource == null) {
      resource = YamlAppLoader.class.getClassLoader().getResourceAsStream(path);
    }
    return resource;
  }
}
