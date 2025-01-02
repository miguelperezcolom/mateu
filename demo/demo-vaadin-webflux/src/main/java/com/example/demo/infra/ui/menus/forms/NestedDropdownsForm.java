package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.dtos.ValueDto;
import lombok.Data;

import java.util.List;

@Data
@Title("Nested dropdowns")
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
  @RequestFocus
  private Country countryAgain;

  @Action(visible = false)
  public void none() {}

  @ValuesProviderMethod("getCitiesInCountry")
  private String city;

  public List<ValueDto> getCitiesInCountry() {
    if (countryAgain == null) {
      return List.of();
    }
    if (countryAgain.equals(Country.Spain)) {
      return List.of(
              new ValueDto("Madrid", "mad"),
              new ValueDto("Palma de Mallorca", "pmi")
      );
    }
    if (countryAgain.equals(Country.France)) {
      return List.of(
              new ValueDto("Paris", "par"),
              new ValueDto("Marsella", "mrs")
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
