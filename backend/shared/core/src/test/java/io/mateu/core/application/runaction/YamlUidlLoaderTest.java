package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class YamlUidlLoaderTest {

  private YamlUidlLoader loader;

  @BeforeEach
  void setUp() {
    loader = new YamlUidlLoader();
  }

  @Test
  void loadsVerticalLayoutFromYaml() {
    var command = command("demo/hello");

    Component component = loader.load(command).block();

    assertThat(component).isInstanceOf(VerticalLayout.class);
    VerticalLayout layout = (VerticalLayout) component;
    assertThat(layout.spacing()).isTrue();
    assertThat(layout.padding()).isTrue();
    assertThat(layout.content()).hasSize(4);
  }

  @Test
  void parsesNestedComponentsCorrectly() {
    var command = command("demo/hello");

    VerticalLayout layout = (VerticalLayout) loader.load(command).block();

    assertThat(layout.content().get(0)).isInstanceOf(Text.class);
    Text title = (Text) layout.content().get(0);
    assertThat(title.text()).isEqualTo("Hello from YAML!");
    assertThat(title.container()).isEqualTo(TextContainer.h1);

    assertThat(layout.content().get(2)).isInstanceOf(HorizontalLayout.class);
    HorizontalLayout buttons = (HorizontalLayout) layout.content().get(2);
    assertThat(buttons.content()).hasSize(2);
    Button save = (Button) buttons.content().get(0);
    assertThat(save.label()).isEqualTo("Save");
    assertThat(save.actionId()).isEqualTo("save");
    assertThat(save.buttonStyle()).isEqualTo(ButtonStyle.primary);
  }

  @Test
  void parsesFormFieldsCorrectly() {
    var command = command("demo/hello");

    VerticalLayout layout = (VerticalLayout) loader.load(command).block();

    FormLayout form = (FormLayout) layout.content().get(3);
    assertThat(form.content()).hasSize(3);

    FormField nameField = (FormField) form.content().get(0);
    assertThat(nameField.id()).isEqualTo("name");
    assertThat(nameField.label()).isEqualTo("Name");
    assertThat(nameField.dataType()).isEqualTo(FieldDataType.string);
    assertThat(nameField.required()).isTrue();

    FormField emailField = (FormField) form.content().get(1);
    assertThat(emailField.stereotype()).isEqualTo(FieldStereotype.email);

    FormField dateField = (FormField) form.content().get(2);
    assertThat(dateField.dataType()).isEqualTo(FieldDataType.date);
  }

  @Test
  void returnsEmptyWhenFileNotFound() {
    var command = command("nonexistent/page");

    Component component = loader.load(command).block();

    assertThat(component).isNull();
  }

  @Test
  void stripsLeadingSlashFromRoute() {
    var command = command("/demo/hello");

    Component component = loader.load(command).block();

    assertThat(component).isInstanceOf(VerticalLayout.class);
  }

  @Test
  void stripsQueryParamsFromRoute() {
    var command = command("demo/hello?foo=bar");

    Component component = loader.load(command).block();

    assertThat(component).isInstanceOf(VerticalLayout.class);
  }

  @Test
  void loadFromSpecLoadsVerticalLayout() {
    Component component = loader.loadFromSpec("specs/ui/demo/hello.yaml");

    assertThat(component).isInstanceOf(VerticalLayout.class);
  }

  @Test
  void loadFromSpecReturnsNullWhenNotFound() {
    Component component = loader.loadFromSpec("specs/ui/nonexistent.yaml");

    assertThat(component).isNull();
  }

  private RunActionCommand command(String route) {
    return new RunActionCommand(null, null, route, null, null, null, null, null, null, null, null);
  }
}
