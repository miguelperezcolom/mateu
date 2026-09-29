package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OptionDto;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A {@code @Lookup} rendered as a widget that shows every option at once — checkboxes, radio
 * buttons, a select — gets its options from the lookup itself.
 *
 * <p>A lookup serves its options on demand, through the {@code search-<field>} action the combo box
 * calls as the user types. The other widgets never call it: they read the field's static {@code
 * options}, which only an {@code OptionsSupplier} on the view model filled. So {@code @Lookup} +
 * {@code @Stereotype(checkbox)} painted an empty group, with no error anywhere.
 */
class LookupStaticOptionsSyncTest {

  public static class Colours implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.of(new Option("red", "Red"), new Option("green", "Green"));
    }
  }

  @UI("/lookup-static-options")
  public static class Form {
    @Lookup(search = Colours.class)
    @Stereotype(FieldStereotype.checkbox)
    List<String> colours;

    @Lookup(search = Colours.class)
    @Stereotype(FieldStereotype.radio)
    String favourite;

    @Lookup(search = Colours.class)
    String searched; // the combo box: stays on-demand
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Form.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private FormFieldDto field(String id) {
    var found = new ArrayList<FormFieldDto>();
    mateu
        .sync("/lookup-static-options")
        .fragments()
        .forEach(f -> FieldKindsSyncTest.walk(f.component(), FormFieldDto.class, found));
    return found.stream().filter(f -> id.equals(f.fieldId())).findFirst().orElseThrow();
  }

  @Test
  void checkboxesShowTheLookupsOptions() {
    assertThat(field("colours").options())
        .extracting(OptionDto::value)
        .containsExactly("red", "green");
  }

  @Test
  void radioButtonsShowTheLookupsOptions() {
    assertThat(field("favourite").options())
        .extracting(OptionDto::label)
        .containsExactly("Red", "Green");
  }

  @Test
  void theComboBoxStillSearchesOnDemand() {
    var searched = field("searched");
    assertThat(searched.stereotype()).isEqualTo("combobox");
    assertThat(searched.options()).isNullOrEmpty();
    assertThat(searched.remoteCoordinates()).isNotNull();
  }
}
