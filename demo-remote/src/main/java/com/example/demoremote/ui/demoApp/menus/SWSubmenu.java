package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.entities.*;
import com.example.demoremote.rpcCruds.ProgrammingLanguages;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class SWSubmenu {

    @MenuOption(icon = VaadinIcons.USERS)
    @Caption("Star Wars Characters")
    private JpaCrud<SWCharacter> characters = new JpaCrud<SWCharacter>() {

        @Override
        public List<String> getSearchFilterFields() {
            return List.of("name");
        }

        @Override
        public List<String> getColumnFields() {
            return List.of("name", "gender", "height");
        }

    };

    @MenuOption(icon = VaadinIcons.FILE_MOVIE)
    @Caption("Star Wars Films")
    private JpaCrud<SWFilm> films = new JpaCrud<SWFilm>() {

        @Override
        public List<String> getSearchFilterFields() {
            return List.of("title");
        }

        @Override
        public List<String> getColumnFields() {
            return List.of("title", "director", "release_date");
        }

    };

    @MenuOption(icon = VaadinIcons.ROCKET)
    @Caption("Star Wars Starships")
    private JpaCrud<SWStarship> starships;

    @MenuOption(icon = VaadinIcons.ROCKET)
    @Caption("Star Wars Species")
    private JpaCrud<SWSpecie> species;

}
