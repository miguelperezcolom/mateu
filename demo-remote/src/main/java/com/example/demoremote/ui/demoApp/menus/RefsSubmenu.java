package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.collections.OneToManyForm;
import com.example.demoremote.ui.demoApp.menus.refs.ExternalRefs;
import com.example.demoremote.ui.demoApp.menus.refs.FilesForm;
import io.mateu.mdd.shared.annotations.MenuOption;

public class RefsSubmenu {

  @MenuOption private ExternalRefs externalRefs;

  @MenuOption private FilesForm files;

  @MenuOption private OneToManyForm oneToManyRelationships;
}
