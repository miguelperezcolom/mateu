package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * What survives when a screen escapes the framework and builds its own component tree.
 *
 * <p>Every model-driven framework dies at the last 20%: one screen out of forty needs to be
 * something the templates do not cover, and if the answer is "then this is not for you", the saving
 * on the other thirty-nine stops mattering. The criterion is not *can it be done* but **does it
 * hurt less than having written that screen by hand from the start** — and that depends entirely on
 * what you keep when you drop down.
 *
 * <p>These are the guarantees the escape ramp makes, pinned so they cannot quietly erode: a promise
 * nothing checks degrades, and this one only pays off if it holds for the screen you reach for it
 * on.
 */
class EscapeHatchGuaranteesTest {

  /** A screen that builds its own tree: no inference, no archetype, no template. */
  @SuppressWarnings("unused")
  @UI("/escaped")
  @Title("Escaped screen")
  public static class Escaped implements ComponentTreeSupplier {

    public String note = "kept";

    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(List.of(Text.builder().text("a tree this screen built itself").build()))
          .build();
    }

    @Action
    public Message doSomething() {
      return new Message("still dispatched");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Escaped.class, EscapedWithHeader.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static PageDto pageOf(String route) {
    var pages = new ArrayList<PageDto>();
    for (var fragment : mateu.sync(route).fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), PageDto.class, pages);
    }
    assertThat(pages).as("page metadata for " + route).isNotEmpty();
    return pages.get(0);
  }

  @Test
  void theScreenStillHasARouteOfItsOwn() {
    // Routing is the first thing you would have to rebuild by hand, and the most tedious.
    assertThat(mateu.sync("/escaped").fragments()).isNotEmpty();
  }

  /**
   * A screen that escapes AND wants to stay inside the shell's page grammar returns a {@code
   * PageView} rather than a bare layout. This is the difference the docs have to state: escaping is
   * not one thing, and the bare form silently drops the header.
   */
  @SuppressWarnings("unused")
  @UI("/escaped-with-header")
  @Title("Ignored — PageView carries its own")
  public static class EscapedWithHeader implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return io.mateu.uidl.fluent.PageView.builder()
          .title("Escaped screen")
          .contentItem(Text.builder().text("a tree this screen built itself").build())
          .build();
    }
  }

  @Test
  void aBareTreeDoesNotKeepTheCanonicalHeader() {
    // MEASURED, not assumed: returning a raw layout gives you exactly that — no page metadata, so
    // no title, badges, KPIs or peer nav. Worth pinning, because it is the surprise.
    var pages = new ArrayList<PageDto>();
    for (var fragment : mateu.sync("/escaped").fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), PageDto.class, pages);
    }
    assertThat(pages).as("a bare escaped tree carries no page metadata").isEmpty();
  }

  @Test
  void returningAPageViewKeepsTheCanonicalHeader() {
    // …and this is the way back in: the escape ramp has two forms, and only one stays in the
    // shell's
    // page grammar.
    assertThat(pageOf("/escaped-with-header").title()).isEqualTo("Escaped screen");
  }

  @Test
  void actionsAreStillDispatched() {
    // The screen draws itself, but its @Action methods keep being reachable through the same wire
    // every other screen uses. Losing this would mean rebuilding the request cycle too.
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/escaped")
                .serverSideType(Escaped.class.getName())
                .actionId("doSomething")
                .build());
    assertThat(increment.messages()).isNotEmpty();
  }

  @Test
  void theScreenItBuiltIsWhatGetsRendered() {
    // The point of escaping: what you drew is what ships, not something inference rearranged.
    var texts = new ArrayList<io.mateu.dtos.TextDto>();
    for (var fragment : mateu.sync("/escaped").fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), io.mateu.dtos.TextDto.class, texts);
    }
    assertThat(texts)
        .extracting(io.mateu.dtos.TextDto::text)
        .contains("a tree this screen built itself");
  }

  @Test
  void anEscapedScreenAdvertisesOnlyWhatItDrew() {
    // A bare escaped tree declares no buttons, so nothing is advertised — the action still fires
    // when invoked (see above), but discovery is the screen's own job once it draws itself. Pinned
    // so the difference between "still works" and "still discoverable" stays explicit.
    var actions = new ArrayList<ActionDto>();
    for (var fragment : mateu.sync("/escaped").fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), ActionDto.class, actions);
    }
    assertThat(actions).extracting(ActionDto::id).doesNotContain("doSomething");
  }
}
