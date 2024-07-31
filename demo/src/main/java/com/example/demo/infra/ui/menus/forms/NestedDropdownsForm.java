package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.dtos.Value;
import lombok.Data;

import java.util.List;

@Data
@Caption("Nested dropdowns")
public class NestedDropdownsForm {

  @Section("Using @VisibleIf")
  @UseRadioButtons
  private Country country;

  @VisibleIf("country == 'Spain'")
  private CitiesInSpain spanishCity;

  @SameLine
  @VisibleIf("country == 'France'")
  private CitiesInFrance frenchCity;

  @SameLine private String someValue;

  @Section("Using @ValuesProviderMethod")
  @CallActionOnChange("none")
  private Country countryAgain;

  @Action(visible = false)
  public void none() {}

  @ValuesProviderMethod("getCitiesInCountry")
  private String city;

  public List<Value> getCitiesInCountry() {
    if (countryAgain == null) {
      return List.of();
    }
    if (countryAgain.equals(Country.Spain)) {
      return List.of(
              Value.builder().key("Madrid").value("mad").build(),
              Value.builder().key("Palma de Mallorca").value("pmi").build()
      );
    }
    if (countryAgain.equals(Country.France)) {
      return List.of(
              Value.builder().key("Paris").value("par").build(),
              Value.builder().key("Marsella").value("mrs").build()
      );
    }
    return List.of();
  }

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment =
        ""
            + ", "
            + country
            + ", "
            + spanishCity
            + ", "
            + frenchCity
            + ", "
            + countryAgain
            + ", "
            + city;
  }
}
