package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.fluent.UserTrigger;
import java.util.Collection;
import org.junit.jupiter.api.Test;

/**
 * getToolbar/getButtons collect the annotated actions and group them: consecutive buttons sharing a
 * {@code group} become a {@link ButtonGroup}, ungrouped ones stay standalone {@link Button}s, and
 * {@code order} drives the sequence. Locks in the shared-collection refactor.
 */
class PageButtonsBuilderTest {

  static class WithToolbar {
    @Toolbar(order = 1)
    void cancel() {}

    @Toolbar(order = 0)
    void save() {}
  }

  static class Grouped {
    @Toolbar(group = "more", order = 1)
    void a() {}

    @Toolbar(group = "more", order = 2)
    void b() {}

    @Toolbar(order = 0)
    void solo() {}
  }

  private static FakeHttpRequest httpRequest() {
    return new FakeHttpRequest(RunActionRqDto.builder().build());
  }

  @Test
  void collectsToolbarActionsOrderedByOrder() {
    Collection<? extends UserTrigger> triggers =
        PageButtonsBuilder.getToolbar(new WithToolbar(), httpRequest());

    assertThat(triggers).hasSize(2).allMatch(t -> t instanceof Button);
    assertThat(triggers.stream().map(t -> ((Button) t).actionId()))
        .containsExactly("save", "cancel"); // save has order 0, cancel order 1
  }

  @Test
  void foldsSharedGroupIntoAButtonGroupAndKeepsSoloButtonsStandalone() {
    Collection<? extends UserTrigger> triggers =
        PageButtonsBuilder.getToolbar(new Grouped(), httpRequest());

    // "solo" (order 0) as a standalone Button, then the "more" group (orders 1,2)
    assertThat(triggers).hasSize(2);
    var list = triggers.stream().toList();
    assertThat(list.get(0)).isInstanceOf(Button.class);
    assertThat(((Button) list.get(0)).actionId()).isEqualTo("solo");
    assertThat(list.get(1)).isInstanceOf(ButtonGroup.class);
    var group = (ButtonGroup) list.get(1);
    assertThat(group.id()).isEqualTo("more");
    assertThat(group.buttons()).extracting(Button::actionId).containsExactly("a", "b");
  }

  @Test
  void noAnnotatedActionsYieldsNoButtons() {
    assertThat(PageButtonsBuilder.getToolbar(new Object(), httpRequest())).isEmpty();
  }
}
