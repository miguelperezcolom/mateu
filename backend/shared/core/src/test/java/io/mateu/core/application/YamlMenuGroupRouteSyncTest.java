package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The route of a menu GROUP of a data-authored shell ({@code type: Menu} with a {@code submenu} in
 * a {@code type: AppShell}). The wire gives every group a route derived from its label ({@code
 * Quick access} → {@code /quickAccess}), so it can be typed, bookmarked or opened from the menu;
 * under a Java shell it already answered a section index of the group's entries, under a YAML shell
 * it answered "Page not found" (crawl of the live demos: /hardware, /solarSystem, /explore,
 * /operations).
 *
 * <p>Fixture {@code mount-home/card-menus/specs/ui}.
 */
class YamlMenuGroupRouteSyncTest {

  private static UIIncrementDto contentOf(String route) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "card-menus", YamlMenuGroupRouteSyncTest.class.getClassLoader()));
    try (var mateu = TestMateu.withUis()) {
      return mateu.run(
          RunActionRqDto.builder().route(route).consumedRoute("").actionId("").build());
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  /** Every record of a type anywhere in the increment (fragments, metadata, children). */
  private static List<Object> all(Object node, Class<?> type) {
    var found = new ArrayList<>();
    walk(node, type, found, java.util.Collections.newSetFromMap(new java.util.IdentityHashMap<>()));
    return found;
  }

  private static void walk(
      Object node, Class<?> type, List<Object> found, java.util.Set<Object> seen) {
    if (node == null || !seen.add(node)) return;
    if (type.isInstance(node)) found.add(node);
    if (node instanceof Iterable<?> items) {
      items.forEach(item -> walk(item, type, found, seen));
    } else if (node instanceof java.util.Map<?, ?> map) {
      map.values().forEach(value -> walk(value, type, found, seen));
    } else if (node.getClass().isRecord()) {
      for (var component : node.getClass().getRecordComponents()) {
        try {
          walk(component.getAccessor().invoke(node), type, found, seen);
        } catch (ReflectiveOperationException ignored) {
          // not readable: nothing below it
        }
      }
    }
  }

  @Test
  void aGroupRouteAnswersAnIndexOfItsEntriesNotPageNotFound() {
    var increment = contentOf("/quickAccess");
    assertThat(all(increment, io.mateu.dtos.NotFoundDto.class)).isEmpty();
    var pages = all(increment, io.mateu.dtos.PageDto.class);
    assertThat(pages)
        .singleElement()
        .extracting(p -> ((io.mateu.dtos.PageDto) p).title())
        .isEqualTo("Quick access");
    // a YAML entry's route is mount-relative already: it is linked as it is, never under the group
    assertThat(all(increment, io.mateu.dtos.AnchorDto.class))
        .extracting(
            a -> ((io.mateu.dtos.AnchorDto) a).text(), a -> ((io.mateu.dtos.AnchorDto) a).url())
        .contains(
            org.assertj.core.groups.Tuple.tuple("Check-in", "/check-in"),
            org.assertj.core.groups.Tuple.tuple("Floor plan", "/floor-plan"),
            // a nested group is linked at its own (derived) route, itself an index
            org.assertj.core.groups.Tuple.tuple("Billing", "/quickAccess/billing"));
    assertThat(all(contentOf("/quickAccess/billing"), io.mateu.dtos.AnchorDto.class))
        .extracting(a -> ((io.mateu.dtos.AnchorDto) a).url())
        .containsExactly("/billing", "/bookings/new");
    // and it names the window after the group
    assertThat(increment.commands())
        .anySatisfy(
            c -> {
              assertThat(c.type()).isEqualTo(UICommandTypeDto.SetWindowTitle);
              assertThat(c.data()).isEqualTo("Quick access");
            });
  }

  @Test
  void aRouteNoEntryClaimsIsStillNotFound() {
    assertThat(all(contentOf("/nowhere-at-all"), io.mateu.dtos.NotFoundDto.class)).isNotEmpty();
  }
}
