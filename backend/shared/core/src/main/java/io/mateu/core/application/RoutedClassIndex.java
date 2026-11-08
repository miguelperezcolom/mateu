package io.mateu.core.application;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Predicate;
import lombok.extern.slf4j.Slf4j;

/**
 * The routed classes of an app, indexed by the route they declare — built ONCE per {@link
 * DefaultRoutedClassResolver} (i.e. per container: the providers are the beans it was created
 * with), so a request no longer walks every {@code @UI} class asking each one whether it matches
 * (~8% of a request's CPU on the e2e SUT, ~200 routed classes, 2026-11).
 *
 * <p>A declared route with no {@code :param} segment matches exactly one string, so it is a map
 * key; the parameterised ones (a handful in any app) are still tried one by one, in declaration
 * order. Whatever the lookup, the candidates come back in the PROVIDERS' order, so "the first
 * provider that matches wins" is unchanged.
 */
@Slf4j
final class RoutedClassIndex {

  /** One routed class: its position among the providers, its class and its declared route. */
  record Entry(int order, Class<?> type, String pattern, boolean ui) {}

  private static final AtomicLong PROVIDERS_SCANNED = new AtomicLong();

  /**
   * Routed classes examined one by one, since the JVM started: every provider while the index is
   * built, then only the parameterised routes a lookup has to try. {@code RequestBudgetTest} pins
   * that a warm request of an app with no parameterised route adds nothing.
   */
  static long providersScanned() {
    return PROVIDERS_SCANNED.get();
  }

  private final Map<String, List<Entry>> byLiteral = new HashMap<>();
  private final Map<String, List<Entry>> byPattern = new HashMap<>();
  private final List<Entry> parameterised = new ArrayList<>();
  private final int size;

  RoutedClassIndex(List<RoutedClassProvider> providers) {
    int order = 0;
    for (var provider : providers) {
      PROVIDERS_SCANNED.incrementAndGet();
      Class<?> type;
      String pattern;
      try {
        type = provider.routedClass();
        pattern = RouteAnnotations.routeOf(type);
      } catch (Throwable t) {
        // a broken or stale generated provider (its class removed) must not break every route:
        // it is skipped, as it always was — now logged once instead of on every request
        log.warn(
            "skipping route provider {}: its routed class could not be resolved ({})",
            provider.getClass().getName(),
            t.toString());
        continue;
      }
      if (pattern == null) {
        order++;
        continue; // declares no route: it never matched anything
      }
      var entry = new Entry(order++, type, pattern, isUi(type));
      byPattern.computeIfAbsent(pattern, k -> new ArrayList<>()).add(entry);
      if (isParameterised(pattern)) {
        parameterised.add(entry);
      } else {
        byLiteral.computeIfAbsent(literalKey(pattern), k -> new ArrayList<>()).add(entry);
      }
    }
    size = order;
  }

  boolean isEmpty() {
    return size == 0;
  }

  /**
   * The routed classes whose declared route matches {@code route} (as {@link
   * RouteAnnotationMatcher#matches(String, String)} does) or whose declared route EQUALS {@code
   * equalTo} (may be null), in the providers' order.
   */
  List<Entry> matching(String route, String equalTo) {
    var found = new TreeMap<Integer, Entry>();
    addAll(found, byLiteral.get(route));
    if (equalTo != null) {
      addAll(found, byPattern.get(equalTo));
    }
    for (var entry : parameterised) {
      PROVIDERS_SCANNED.incrementAndGet();
      if (!found.containsKey(entry.order())
          && (RouteAnnotationMatcher.matches(route, entry.pattern())
              || entry.pattern().equals(equalTo))) {
        found.put(entry.order(), entry);
      }
    }
    return List.copyOf(found.values());
  }

  /** The first of {@link #matching} that also passes {@code test}, or null. */
  static Entry first(List<Entry> candidates, Predicate<Entry> test) {
    for (var entry : candidates) {
      try {
        if (test.test(entry)) {
          return entry;
        }
      } catch (Throwable t) {
        // one class failing a check is skipped, never the whole resolution
        log.warn("skipping routed class {}: {}", entry.type().getName(), t.toString());
      }
    }
    return null;
  }

  private static void addAll(Map<Integer, Entry> found, List<Entry> entries) {
    if (entries != null) {
      for (var entry : entries) {
        found.put(entry.order(), entry);
      }
    }
  }

  static boolean isParameterised(String pattern) {
    for (var token : pattern.split("/")) {
      if (token.startsWith(":")) {
        return true;
      }
    }
    return false;
  }

  /**
   * The ONE string a route without parameters matches: {@link RouteAnnotationMatcher#compile} joins
   * its literal segments with {@code /} the same way ({@code String.split} drops trailing empty
   * segments, so {@code /a/} matches {@code /a} and {@code /} matches {@code ""}).
   */
  static String literalKey(String pattern) {
    return String.join("/", pattern.split("/"));
  }

  private static boolean isUi(Class<?> type) {
    try {
      return type.isAnnotationPresent(UI.class);
    } catch (Throwable t) {
      return false;
    }
  }
}
