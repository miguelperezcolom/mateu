package io.mateu.core.infra.declarative;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The toolbar and the button row of a nested (inline) form: one button per {@code @Toolbar} /
 * {@code @Button} method, carrying its label, prefixed action id, shortcut and look; a method that
 * is {@code @Hidden} outright, or that the view's {@link VisibilitySupplier} hides for this
 * request, gets no button — a conditional {@code @Hidden("…")} is left to the client rule.
 */
class FormViewToolbarBuilderTest {

  public static class Address implements VisibilitySupplier {
    @Toolbar(
        buttonStyle = ButtonStyle.primary,
        buttonColor = ButtonColor.success,
        buttonSize = ButtonSize.small)
    @Label("Validate address")
    @Action(shortcut = "ctrl+alt+v")
    public void validate() {}

    @Toolbar
    @Hidden
    public void neverShown() {}

    @Toolbar
    @Hidden("${state.street == ''}")
    public void conditionallyShown() {}

    @Toolbar
    public void hiddenByTheSupplier() {}

    @Button(
        buttonStyle = ButtonStyle.tertiary,
        buttonColor = ButtonColor.error,
        buttonSize = ButtonSize.normal)
    @Action
    public void clear() {}

    @Button
    @Hidden
    public void neverAButton() {}

    @Button
    public void hiddenButton() {}

    public void notAnAction() {}

    @Override
    public boolean isHidden(String memberName, HttpRequest httpRequest) {
      return memberName.startsWith("hidden");
    }
  }

  public static class Plain {
    @Toolbar
    public void go() {}

    @Button
    public void stop() {}
  }

  private static io.mateu.uidl.data.Button only(List<UserTrigger> triggers, String actionId) {
    return triggers.stream()
        .map(io.mateu.uidl.data.Button.class::cast)
        .filter(b -> b.actionId().equals(actionId))
        .findFirst()
        .orElseThrow(() -> new AssertionError(actionId + " not in " + triggers));
  }

  @Test
  void theToolbarCarriesLabelPrefixedIdShortcutAndLookAndSkipsHiddenMethods() {
    var toolbar =
        FormViewToolbarBuilder.createToolbar("nested-form-action-address-", new Address(), null);
    assertThat(toolbar)
        .map(t -> ((io.mateu.uidl.data.Button) t).actionId())
        .containsExactlyInAnyOrder(
            "nested-form-action-address-validate", "nested-form-action-address-conditionallyShown");
    var validate = only(toolbar, "nested-form-action-address-validate");
    assertThat(validate.label()).isEqualTo("Validate address");
    assertThat(validate.shortcut()).isEqualTo("ctrl+alt+v");
    assertThat(validate.buttonStyle()).isEqualTo(ButtonStyle.primary);
    assertThat(validate.color()).isEqualTo(ButtonColor.success);
    assertThat(validate.size()).isEqualTo(ButtonSize.small);
    var conditional = only(toolbar, "nested-form-action-address-conditionallyShown");
    assertThat(conditional.shortcut()).isNull();
    assertThat(conditional.buttonStyle()).isNull();
  }

  @Test
  void theButtonRowFollowsTheSameRules() {
    var buttons = FormViewToolbarBuilder.createButtons(new Address(), null);
    assertThat(buttons)
        .map(t -> ((io.mateu.uidl.data.Button) t).actionId())
        .containsExactly("clear");
    var clear = only(buttons, "clear");
    assertThat(clear.shortcut()).isNull();
    assertThat(clear.buttonStyle()).isEqualTo(ButtonStyle.tertiary);
    assertThat(clear.color()).isEqualTo(ButtonColor.error);
    assertThat(clear.size()).isEqualTo(ButtonSize.normal);
  }

  @Test
  void aViewWithoutAVisibilitySupplierShowsEveryAnnotatedMethod() {
    assertThat(FormViewToolbarBuilder.createToolbar(new Plain(), null))
        .map(t -> ((io.mateu.uidl.data.Button) t).actionId())
        .containsExactly("go");
    assertThat(FormViewToolbarBuilder.createButtons(new Plain(), null))
        .map(t -> ((io.mateu.uidl.data.Button) t).actionId())
        .containsExactly("stop");
  }
}
