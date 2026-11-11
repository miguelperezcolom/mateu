package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A {@link ButtonGroup} with a {@code primary} is a SPLIT button: on the wire it is the primary
 * button itself (label, action, look) with {@code split} set and the other buttons as {@code
 * children}. A dropdown (no primary) keeps its old shape: no action of its own, {@code split}
 * false. Declared with {@code @Toolbar(group, groupPrimary)}, fluently with {@link
 * ButtonGroup#split}, in content and in a page toolbar; every id is advertised and runs.
 */
class SplitButtonSyncTest {

  @UI("/split-button-content")
  public static class ContentPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          ButtonGroup.builder()
              .id("save-split")
              .primary(
                  Button.builder()
                      .label("Save")
                      .actionId("save")
                      .buttonStyle(ButtonStyle.primary)
                      .callable(() -> Message.success("saved"))
                      .build())
              .buttons(
                  List.of(
                      Button.builder()
                          .label("Save as draft")
                          .actionId("saveDraft")
                          .callable(() -> Message.success("draft"))
                          .build()))
              .build(),
          ButtonGroup.of("Export", new Button("CSV", "csv"), new Button("PDF", "pdf")));
    }
  }

  @UI("/split-button-toolbar")
  public static class ToolbarPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return Form.builder()
          .title("Toolbar")
          .toolbar(
              List.of(
                  ButtonGroup.split(
                      new Button("Publish", "publish"), new Button("Schedule", "schedule"))))
          .build();
    }
  }

  @UI("/split-button-declared")
  @Title("Declared")
  public static class DeclaredPage {
    public String name = "Ada";

    @Toolbar(group = "save", groupPrimary = true, buttonStyle = ButtonStyle.primary, order = 1)
    public void save() {}

    @Toolbar(group = "save", order = 2)
    @Label("Save as draft")
    public void saveDraft() {}

    @Toolbar(group = "export", order = 3)
    public void csv() {}

    @Toolbar(group = "export", order = 4)
    public void pdf() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ContentPage.class, ToolbarPage.class, DeclaredPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ButtonDto contentButton(Object increment, String id) {
    return (ButtonDto)
        WireWalk.all(increment, ClientSideComponentDto.class).stream()
            .filter(c -> id.equals(c.id()))
            .findFirst()
            .orElseThrow()
            .metadata();
  }

  @Test
  void aSplitButtonInContentIsThePrimaryWithTheOthersAsChildren() {
    var increment = mateu.sync("/split-button-content");
    var split = contentButton(increment, "save-split");
    assertThat(split.split()).isTrue();
    assertThat(split.label()).isEqualTo("Save");
    assertThat(split.actionId()).isEqualTo("save");
    assertThat(split.buttonStyle().name()).isEqualTo("primary");
    assertThat(split.children()).extracting(ButtonDto::actionId).containsExactly("saveDraft");
  }

  @Test
  void aDropdownKeepsItsShape() {
    var increment = mateu.sync("/split-button-content");
    var dropdown =
        WireWalk.all(increment, ClientSideComponentDto.class).stream()
            .map(ClientSideComponentDto::metadata)
            .filter(m -> m instanceof ButtonDto b && "Export".equals(b.label()))
            .map(ButtonDto.class::cast)
            .findFirst()
            .orElseThrow();
    assertThat(dropdown.split()).isFalse();
    assertThat(dropdown.actionId()).isNull();
    assertThat(dropdown.children()).extracting(ButtonDto::actionId).containsExactly("csv", "pdf");
  }

  @Test
  void theHandlersOfBothPartsAreAdvertisedAndRun() {
    var increment = mateu.sync("/split-button-content");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.actions().stream().map(ActionDto::id)).contains("save", "saveDraft");
    for (var id : List.of("save", "saveDraft")) {
      var result =
          mateu.run(
              RunActionRqDto.builder()
                  .route("/split-button-content")
                  .actionId(id)
                  .serverSideType(component.serverSideType())
                  .build());
      assertThat(result.messages()).isNotEmpty();
    }
  }

  @Test
  void aFluentToolbarCarriesTheSplitButton() {
    var increment = mateu.sync("/split-button-toolbar");
    var toolbar =
        WireWalk.all(increment, io.mateu.dtos.FormDto.class).stream()
            .findFirst()
            .orElseThrow()
            .toolbar();
    assertThat(toolbar).hasSize(1);
    assertThat(toolbar.get(0).split()).isTrue();
    assertThat(toolbar.get(0).actionId()).isEqualTo("publish");
    assertThat(toolbar.get(0).children())
        .extracting(ButtonDto::actionId)
        .containsExactly("schedule");
  }

  @Test
  void aGroupWithAGroupPrimaryMemberIsASplitButton() {
    var increment = mateu.sync("/split-button-declared");
    var toolbar =
        WireWalk.all(increment, PageDto.class).stream().findFirst().orElseThrow().toolbar();
    assertThat(toolbar).hasSize(2);
    var save = toolbar.get(0);
    assertThat(save.split()).isTrue();
    assertThat(save.actionId()).isEqualTo("save");
    assertThat(save.label()).isEqualTo("Save");
    assertThat(save.buttonStyle().name()).isEqualTo("primary");
    assertThat(save.children()).extracting(ButtonDto::label).containsExactly("Save as draft");
    var export = toolbar.get(1);
    assertThat(export.split()).isFalse();
    assertThat(export.label()).isEqualTo("Export");
    assertThat(export.children()).extracting(ButtonDto::actionId).containsExactly("csv", "pdf");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.actions().stream().map(ActionDto::id))
        .contains("save", "saveDraft", "csv", "pdf");
  }
}
