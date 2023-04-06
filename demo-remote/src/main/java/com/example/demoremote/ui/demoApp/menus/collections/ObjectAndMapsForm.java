package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.agnostic.pojos.Movie;
import com.example.demoremote.domains.agnostic.pojos.Profile;
import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import com.example.demoremote.domains.agnostic.records.Address;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Embed;
import io.mateu.mdd.shared.annotations.ItemsProvider;
import io.mateu.mdd.shared.annotations.Section;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.util.Map;

@Data
@Caption("Objects and maps")
public class ObjectAndMapsForm {

    @Section("Objects")
    private Profile profile = new Profile("Mateu", 14, Movie.JohnWick);

    private Profile emptyProfile;

    @Embed
    private Profile embeddedProfile;

    @Section("Simple maps")
    private Map<String, String> mapStringToString;

    private Map<String, Integer> mapStringToInt;

    private Map<String, Double> mapStringToDouble;


    @Section("Complex maps")
    private Map<String, Address> mapStringToObject;

    @ItemsProvider(TeamsProvider.class)
    private Map<String, ExternalReference> mapStringToExternalRef;

}
