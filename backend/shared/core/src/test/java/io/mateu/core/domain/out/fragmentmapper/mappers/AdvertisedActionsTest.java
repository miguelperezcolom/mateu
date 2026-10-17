package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.AppShortcut;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

/** What a view advertises besides its marked methods — the ids strict mode accepts (M-S1). */
class AdvertisedActionsTest {

  static final AtomicInteger HANDLER_CALLS = new AtomicInteger();

  @AutoSave(action = "persist")
  @AppShortcut(key = "F2", actionId = "quickSearch")
  @SuppressWarnings("unused")
  static class View implements ToolbarSupplier, AppActionsSupplier {
    @Section(value = "Guests", addAction = "addGuest", viewMoreAction = "allGuests")
    String lead = "Ada";

    Callable<Component> island = () -> Button.builder().label("Go").actionId("go").build();

    // a button's handler: an action, never called just to look for ids
    Callable<Object> handler =
        () -> {
          HANDLER_CALLS.incrementAndGet();
          return null;
        };

    @Menu Rule refresh = Rule.builder().actionId("refreshAll").build();

    @Menu Group more;

    @Override
    public Collection<UserTrigger> toolbar() {
      return List.of(Button.builder().label("Export").actionId("export").build());
    }

    @Override
    public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
      return List.of(
          AppHeaderAction.menu("Ops", null, List.of(new AppHeaderAction("deploy", "Deploy"))));
    }
  }

  public static class Group {
    @Menu Rule archive = Rule.builder().actionId("archiveAll").build();
  }

  @Test
  void theViewsDeclarationsAndComponentsAreAdvertised() {
    var ids =
        AdvertisedActions.of(
            new View(), new FakeHttpRequest(RunActionRqDto.builder().route("/v").build()));

    assertThat(ids)
        .contains(
            "persist",
            "quickSearch",
            "addGuest",
            "allGuests",
            "go",
            "refreshAll",
            "archiveAll",
            "export",
            "deploy")
        .doesNotContain("");
    assertThat(HANDLER_CALLS).hasValue(0);
  }

  @Test
  void nothingIsAdvertisedForNothing() {
    assertThat(AdvertisedActions.of(null, null)).isEmpty();
  }
}
