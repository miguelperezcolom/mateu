package com.example.demo.infra.ui.menus;

import com.example.demo.domain.cities.City;
import com.example.demo.domain.programmingLanguages.ProgrammingLanguages;
import com.example.demo.infra.ui.menus.errors.rpcTimeouts.BrokenCrud;
import com.example.demo.infra.ui.menus.layouts.shared.crud.*;
import io.mateu.uidl.interfaces.Directory;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.Submenu;
import io.mateu.uidl.interfaces.JpaCrud;

import java.util.List;

public class CrudsSubmenu implements Directory {

    @MenuOption private ProgrammingLanguages programmingLanguages;

    @MenuOption private SimpleCrud simpleCrud;

    @MenuOption private SimpleCrudWithActionOnSelectedRows simpleCrudWithActionOnSelectedRows;

    @MenuOption private SimpleCrudWithSelectionListener simpleCrudWithSelectionListener;

    @MenuOption private SimpleCrudWithActionOnSelectedRow simpleCrudWithActionOnSelectedRow;

    @Submenu private CardCrudsSubmenu crudsUsingCards;

    @MenuOption
    private JpaCrud<City> cities =
            new JpaCrud<City>() {

                @Override
                public List<String> getSearchFilterFields() {
                    return List.of("name", "country", "population");
                }

                @Override
                public List<String> getColumnFields() {
                    return List.of("name", "country", "population");
                }
            };

    @Submenu("NFL")
    private NFLSubmenu nfl;

    @Submenu("Star Wars")
    private SWSubmenu sw;

    @MenuOption private BrokenCrud brokenCrud;

}
