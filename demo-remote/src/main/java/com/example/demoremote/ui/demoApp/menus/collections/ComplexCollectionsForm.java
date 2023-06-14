package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.agnostic.pojos.Movie;
import com.example.demoremote.domains.agnostic.pojos.Profile;
import com.example.demoremote.domains.agnostic.records.Address;
import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Embed;
import io.mateu.mdd.shared.annotations.ItemsProvider;
import io.mateu.mdd.shared.annotations.Section;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Caption("Complex collections")
public class ComplexCollectionsForm {

    @Section("Complex maps")
    private List<Address> addresses;

    @ItemsProvider(TeamsProvider.class)
    private List<ExternalReference> externalRefs;

}
