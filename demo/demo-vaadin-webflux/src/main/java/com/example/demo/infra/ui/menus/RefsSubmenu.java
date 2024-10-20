package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.collections.OneToManyForm;
import com.example.demo.infra.ui.menus.refs.ExternalRefs;
import com.example.demo.infra.ui.menus.refs.FilesForm;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;

public class RefsSubmenu {

  @MenuOption private ExternalRefs externalRefs;

  @MenuOption private FilesForm files;

  @MenuOption private OneToManyForm oneToManyRelationships;
}
