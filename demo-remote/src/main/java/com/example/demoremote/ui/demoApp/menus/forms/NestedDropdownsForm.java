package com.example.demoremote.ui.demoApp.menus.forms;

import com.example.demoremote.domains.nfl.dtos.Conference;
import com.example.demoremote.domains.nfl.dtos.Division;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Value;
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

    @VisibleIf("country == 'France'")
    private CitiesInFrance frenchCity;

    @Section("Using @ValuesProviderMethod")
    @CallActionOnChange("none")
    private Country countryAgain;

    @Action(visible = false)
    public void none() {

    }

    @ValuesProviderMethod("getCitiesInCountry")
    private String city;

    public List<Value> getCitiesInCountry() {
        if (countryAgain == null) {
            return List.of();
        }
        if (countryAgain.equals(Country.Spain)) {
            return List.of(new Value("Madrid", "mad"), new Value("Palma de Mallorca", "pmi"));
        }
        if (countryAgain.equals(Country.France)) {
            return List.of(new Value("Paris", "par"), new Value("Marsella", "mrs"));
        }
        return List.of();
    }

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = ""
                + ", " + country
                + ", " + spanishCity
                + ", " + frenchCity
                + ", " + countryAgain
                + ", " + city
        ;
    }
}
