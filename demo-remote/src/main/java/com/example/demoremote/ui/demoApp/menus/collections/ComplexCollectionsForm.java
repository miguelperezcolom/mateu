package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.agnostic.pojos.Address;
import com.example.demoremote.domains.agnostic.records.AddressRecord;
import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.util.List;

@Data
@Caption("Complex collections")
public class ComplexCollectionsForm {

    @Section("Complex collections")
    private List<Address> addresses;

    private List<Address> preFilled = List.of(
            new Address("Arxiduc Lluís Salvador, 38", "Palma de Mallorca", "07004", "Spain")
            , new Address("Juan Crespí, 12A", "Palma de Mallorca", "07014", "Spain")
            , new Address("Gran vía, 1", "Madrid", "01001", "Spain")
    );

    @ItemsProvider(TeamsProvider.class)
    private List<ExternalReference> externalRefs;


    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = "" + addresses
        + ", " + preFilled
        + ", " + externalRefs
        ;
    }

}
