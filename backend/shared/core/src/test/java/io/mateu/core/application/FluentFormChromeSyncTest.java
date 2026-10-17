package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonColorDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonSizeDto;
import io.mateu.dtos.FormDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A fluent {@link Form}'s chrome on the wire: header and footer components, a toolbar {@link
 * ButtonGroup} that becomes ONE dropdown button with its children, an explicit button size, and a
 * destructive action id ({@code delete…}) painted as an error button without being asked.
 */
class FluentFormChromeSyncTest {

  @UI("/fluent-form-chrome")
  public static class Screen implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return Form.builder()
          .title("Booking")
          .headerItem(new Text("header-text", "Arrives today"))
          .footerItem(new Text("footer-text", "Last change by Ada"))
          .toolbarItem(
              new ButtonGroup(
                  "more",
                  "More",
                  null,
                  null,
                  true,
                  List.of(new Button("Export", "export"), new Button("Print", "print"))))
          .toolbarItem(
              Button.builder().label("Small").actionId("small").size(ButtonSize.small).build())
          .button(new Button("Remove", "delete-booking"))
          .contentItem(new Text("body", "…"))
          .build();
    }
  }

  static TestMateu mateu;
  static FormDto form;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Screen.class);
    var forms =
        FieldKindsSyncTest.collect(
            mateu.sync("/fluent-form-chrome").fragments().get(0).component(), FormDto.class);
    assertThat(forms).isNotEmpty();
    form = forms.get(0);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void headerAndFooterComponentsTravelWithTheForm() {
    assertThat(form.header()).hasSize(1);
    assertThat(form.footer()).hasSize(1);
    assertThat(String.valueOf(form.header())).contains("Arrives today");
    assertThat(String.valueOf(form.footer())).contains("Last change by Ada");
  }

  @Test
  void aButtonGroupIsOneDropdownWithItsButtonsAsChildren() {
    ButtonDto more = form.toolbar().get(0);
    assertThat(more.label()).isEqualTo("More");
    assertThat(more.separatorBefore()).isTrue();
    assertThat(more.children()).extracting(ButtonDto::label).containsExactly("Export", "Print");
    assertThat(form.toolbar().get(1).size()).isEqualTo(ButtonSizeDto.small);
  }

  @Test
  void aDeleteActionIsAnErrorButtonByDefault() {
    assertThat(form.buttons().get(0).color()).isEqualTo(ButtonColorDto.error);
  }
}
