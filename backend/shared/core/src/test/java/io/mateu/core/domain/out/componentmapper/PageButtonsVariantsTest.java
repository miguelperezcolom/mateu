package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.interfaces.DisabledSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * What a page's toolbar and buttons carry from their annotations: the appearance (style, colour,
 * size, separator), a FIELD action (a {@code Runnable} annotated like a method) as well as a
 * method, groups; and what hides or disables them at runtime — a {@link VisibilitySupplier}, a
 * static {@code @Hidden}, a {@link DisabledSupplier}, {@code @DisabledUnless} — FABs included.
 */
class PageButtonsVariantsTest {

  public static class Page implements VisibilitySupplier, DisabledSupplier {
    @Toolbar(
        buttonStyle = ButtonStyle.secondary,
        buttonColor = ButtonColor.error,
        buttonSize = ButtonSize.small,
        separatorBefore = true,
        order = 2)
    @Label("Purge all")
    public Runnable purge = () -> {};

    @io.mateu.uidl.annotations.Button(
        buttonStyle = ButtonStyle.primary,
        buttonColor = ButtonColor.success,
        buttonSize = ButtonSize.large,
        group = "export",
        order = 1)
    public Runnable exportCsv = () -> {};

    @io.mateu.uidl.annotations.Button(group = "export", order = 2)
    public void exportPdf() {}

    @io.mateu.uidl.annotations.Button(
        buttonStyle = ButtonStyle.tertiary,
        buttonColor = ButtonColor.contrast,
        buttonSize = ButtonSize.normal)
    public void help() {}

    @Toolbar(buttonStyle = ButtonStyle.primary, order = 0)
    public void save() {}

    @Toolbar(order = 1)
    public void archive() {}

    @Toolbar
    @Hidden
    public void neverShown() {}

    @Toolbar
    @Hidden("${state.locked}")
    public void conditionallyHidden() {}

    @Toolbar
    public void hiddenBySupplier() {}

    @Toolbar
    @DisabledUnless(roles = "manager")
    public void approve() {}

    @Fab(icon = "vaadin:plus", label = "Add", order = 2)
    public void add() {}

    @Fab(buttonStyle = ButtonStyle.none, order = 1)
    public void quick() {}

    @Fab
    public void hiddenFab() {}

    @Override
    public boolean isHidden(String memberName, HttpRequest httpRequest) {
      return memberName.equals("hiddenBySupplier") || memberName.equals("hiddenFab");
    }

    @Override
    public boolean isDisabled(String memberName, HttpRequest httpRequest) {
      return memberName.equals("archive");
    }
  }

  private static HttpRequest request(String... roles) {
    return new FakeHttpRequest(RunActionRqDto.builder().build())
        .withPrincipal(TestIdentities.principalWithRoles(roles));
  }

  private static Button button(List<?> triggers, String actionId) {
    return triggers.stream()
        .filter(Button.class::isInstance)
        .map(Button.class::cast)
        .filter(b -> actionId.equals(b.actionId()))
        .findFirst()
        .orElseThrow(() -> new AssertionError(actionId + " not in " + triggers));
  }

  @Test
  void theToolbarCarriesAppearanceOrderAndRuntimeStateOfFieldAndMethodActions() {
    var toolbar = List.copyOf(PageButtonsBuilder.getToolbar(new Page(), request("clerk")));

    assertThat(toolbar)
        .map(t -> ((Button) t).actionId())
        .containsExactlyInAnyOrder("save", "conditionallyHidden", "approve", "archive", "purge");
    // order 2 last; a @Hidden("${…}") is a client rule, not a static hide
    assertThat(((Button) toolbar.get(toolbar.size() - 1)).actionId()).isEqualTo("purge");

    var purge = button(toolbar, "purge");
    assertThat(purge.label()).isEqualTo("Purge all");
    assertThat(purge.buttonStyle()).isEqualTo(ButtonStyle.secondary);
    assertThat(purge.color()).isEqualTo(ButtonColor.error);
    assertThat(purge.size()).isEqualTo(ButtonSize.small);
    assertThat(purge.separatorBefore()).isTrue();

    assertThat(button(toolbar, "save").buttonStyle()).isEqualTo(ButtonStyle.primary);
    assertThat(button(toolbar, "save").color()).isEqualTo(ButtonColor.normal);
    assertThat(button(toolbar, "archive").disabled()).as("DisabledSupplier").isTrue();
    assertThat(button(toolbar, "approve").disabled()).as("@DisabledUnless, clerk").isTrue();
    assertThat(button(toolbar, "save").disabled()).isFalse();

    var asManager = List.copyOf(PageButtonsBuilder.getToolbar(new Page(), request("manager")));
    assertThat(button(asManager, "approve").disabled()).isFalse();
  }

  @Test
  void buttonsFromFieldsAndMethodsShareAGroup() {
    var buttons = List.copyOf(PageButtonsBuilder.getButtons(new Page(), request()));

    var help = button(buttons, "help");
    assertThat(help.buttonStyle()).isEqualTo(ButtonStyle.tertiary);
    assertThat(help.color()).isEqualTo(ButtonColor.contrast);
    assertThat(help.size()).isEqualTo(ButtonSize.normal);

    var group =
        buttons.stream()
            .filter(ButtonGroup.class::isInstance)
            .map(ButtonGroup.class::cast)
            .findFirst()
            .orElseThrow();
    assertThat(group.id()).isEqualTo("export");
    assertThat(group.label()).isEqualTo("Export");
    assertThat(group.buttons())
        .extracting(Button::actionId)
        .containsExactly("exportCsv", "exportPdf");
    var csv = group.buttons().get(0);
    assertThat(csv.buttonStyle()).isEqualTo(ButtonStyle.primary);
    assertThat(csv.color()).isEqualTo(ButtonColor.success);
    assertThat(csv.size()).isEqualTo(ButtonSize.large);
  }

  @Test
  void fabsAreOrderedPrimaryByDefaultAndHiddenBySupplier() {
    var fabs = PageButtonsBuilder.getFabs(new Page(), request());
    assertThat(fabs).map(t -> ((Button) t).actionId()).containsExactly("quick", "add");
    assertThat(((Button) fabs.get(0)).buttonStyle()).isEqualTo(ButtonStyle.primary);
    assertThat(((Button) fabs.get(1)).iconOnLeft()).isEqualTo("vaadin:plus");
    assertThat(((Button) fabs.get(1)).label()).isEqualTo("Add");
  }
}
