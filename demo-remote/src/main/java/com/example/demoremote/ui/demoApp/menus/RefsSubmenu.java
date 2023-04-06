package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.collections.ArraysAndCollectionsForm;
import com.example.demoremote.ui.demoApp.menus.collections.CustomComponentForm;
import com.example.demoremote.ui.demoApp.menus.collections.ObjectAndMapsForm;
import com.example.demoremote.ui.demoApp.menus.collections.OneToManyForm;
import com.example.demoremote.ui.demoApp.menus.refs.ExternalRefsAndFilesForm;
import io.mateu.mdd.shared.annotations.MenuOption;

public class RefsSubmenu {

    @MenuOption
    private ExternalRefsAndFilesForm externalRefsAndFiles;

    @MenuOption
    private OneToManyForm oneToManyRelationships;

}
