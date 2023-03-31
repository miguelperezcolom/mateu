package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.explorer.*;
import io.mateu.mdd.shared.annotations.MenuOption;

public class ExplorerSubmenu {

    @MenuOption
    private ExternalRefsAndFilesForm externalRefsAndFiles;

    @MenuOption
    private ArraysAndCollectionsForm arraysAndCollections;

    @MenuOption
    private CustomComponentForm customComponents;

    @MenuOption
    private OneToManyForm oneToManyRelationships;

    @MenuOption
    private ObjectAndMapsForm objectsAndMaps;

}
