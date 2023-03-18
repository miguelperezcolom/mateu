package com.example.demoremote;

import com.example.demoremote.cities.City;
import com.example.demoremote.nfl.PlayersCrud;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class ExplorerSubmenu {

    @MenuOption
    private ExternalRefsAndFilesForm externalRefsAndFiles;

    @MenuOption
    private ArraysAndCollectionsForm arraysAndCollections;

    @MenuOption
    private OneToManyForm oneToManyRelationships;

    @MenuOption
    private ObjectAndMapsForm objectsAndMaps;

}
