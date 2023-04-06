package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import com.example.demoremote.domains.agnostic.records.Address;
import io.mateu.mdd.shared.annotations.Embed;
import io.mateu.mdd.shared.annotations.ItemsProvider;
import io.mateu.mdd.shared.annotations.Section;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.util.Map;

@Data
public class ObjectAndMapsForm {

    @Section("Objects")
    private Address address;

    @Embed
    private Address embedded;

    @Section("Simple maps")
    private Map<String, String> mapStringToString;

    private Map<String, Integer> mapStringToInt;

    private Map<String, Double> mapStringToDouble;


    @Section("Complex maps")
    private Map<String, Address> mapStringToObject;

    @ItemsProvider(TeamsProvider.class)
    private Map<String, ExternalReference> mapStringToExternalRef;

}
