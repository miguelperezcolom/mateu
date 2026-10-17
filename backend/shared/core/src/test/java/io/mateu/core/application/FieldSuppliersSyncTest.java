package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OptionDto;
import io.mateu.dtos.PairDto;
import io.mateu.uidl.annotations.DivStyle;
import io.mateu.uidl.annotations.FileUpload;
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.annotations.OptionsLayout;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UseRadioButtons;
import io.mateu.uidl.interfaces.DescriptionSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.RequiredSupplier;
import io.mateu.uidl.interfaces.StyleSupplier;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A view can decide a field's label, style, description and requiredness per request through the
 * supplier interfaces — a blank answer falls back to the declaration — and the declarative knobs
 * ({@code @Style}, {@code @DivStyle}, {@code @FileUpload(accept)}, {@code @OptionsLayout}, an
 * {@code @Icon} on an enum constant) reach the field on the wire.
 */
class FieldSuppliersSyncTest {

  public enum Channel {
    @Icon(IconKey.Phone)
    PHONE,
    EMAIL
  }

  @UI("/field-suppliers")
  public static class Contact
      implements LabelSupplier, StyleSupplier, DescriptionSupplier, RequiredSupplier {
    public String name;

    @Style("width: 12rem;")
    public String nickname;

    @DivStyle("padding: 4px;")
    public String code;

    @FileUpload(accept = ".csv")
    public String upload;

    @UseRadioButtons
    @OptionsLayout(columns = 2)
    public Channel channel;

    @Override
    public String label(String memberName, HttpRequest httpRequest) {
      return "name".equals(memberName) ? "Full name" : "";
    }

    @Override
    public String style(String memberName, HttpRequest httpRequest) {
      return "name".equals(memberName) ? "color: red;" : null;
    }

    @Override
    public String description(String memberName, HttpRequest httpRequest) {
      return "name".equals(memberName) ? "As in the passport" : "";
    }

    @Override
    public boolean isRequired(String memberName, HttpRequest httpRequest) {
      return "nickname".equals(memberName);
    }
  }

  static TestMateu mateu;
  static Map<String, FormFieldDto> fields;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Contact.class);
    var root = mateu.sync("/field-suppliers").fragments().get(0).component();
    fields = new LinkedHashMap<>();
    FieldKindsSyncTest.collect(root, FormFieldDto.class).forEach(f -> fields.put(f.fieldId(), f));
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theViewSuppliesLabelStyleDescriptionPerFieldAndBlankFallsBack() {
    var name = fields.get("name");
    assertThat(name.label()).isEqualTo("Full name");
    assertThat(name.style()).isEqualTo("color: red;");
    assertThat(name.description()).isEqualTo("As in the passport");
    assertThat(name.required()).isFalse();

    var nickname = fields.get("nickname");
    assertThat(nickname.label()).isEqualTo("Nickname");
    assertThat(nickname.style()).isEqualTo("width: 12rem;");
    assertThat(nickname.required()).isTrue();
  }

  @Test
  void declarativeKnobsReachTheField() {
    assertThat(fields.get("code").attributes()).contains(new PairDto("divStyle", "padding: 4px;"));
    assertThat(fields.get("upload").attributes()).contains(new PairDto("accept", ".csv"));
    var channel = fields.get("channel");
    assertThat(channel.optionsColumns()).isEqualTo(2);
    assertThat(channel.options())
        .extracting(OptionDto::value, OptionDto::icon)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("PHONE", "vaadin:phone"),
            org.assertj.core.groups.Tuple.tuple("EMAIL", null));
  }
}
