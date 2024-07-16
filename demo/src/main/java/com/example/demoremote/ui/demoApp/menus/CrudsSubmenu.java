package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.domains.cities.City;
import com.example.demoremote.domains.programmingLanguages.ProgrammingLanguages;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import io.mateu.mdd.shared.interfaces.JpaCrud;
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

}
