package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.collections.ArraysAndCollectionsForm;
import com.example.demoremote.ui.demoApp.menus.collections.CustomComponentForm;
import com.example.demoremote.ui.demoApp.menus.collections.ObjectAndMapsForm;
import io.mateu.mdd.shared.annotations.MenuOption;

public class CollectionsSubmenu {

    @MenuOption
    private ArraysAndCollectionsForm arraysAndCollections;

    @MenuOption
    private CustomComponentForm customComponents;

    @MenuOption
    private ObjectAndMapsForm objectsAndMaps;

}
