package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.layouts.shared.crud.*;
import io.mateu.uidl.annotations.MenuOption;

public class CardCrudsSubmenu {

    @MenuOption
    private SimpleCardsCrud simpleCrud;

    @MenuOption private SimpleCardsCrudWithActionOnSelectedRows simpleCrudWithActionOnSelectedRows;

    @MenuOption private SimpleCardsCrudWithSelectionListener simpleCrudWithSelectionListener;

    @MenuOption private SimpleCrudWithActionOnSelectedRow simpleCrudWithActionOnSelectedRow;


}
