package com.example.demo.infra.ui.menus;

import com.example.demo.domain.cities.City;
import com.example.demo.domain.programmingLanguages.ProgrammingLanguages;
import com.example.demo.infra.ui.menus.errors.rpcTimeouts.BrokenCrud;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;

import java.util.List;

public class CrudsSubmenu {

    @MenuOption private ProgrammingLanguages programmingLanguages;

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
