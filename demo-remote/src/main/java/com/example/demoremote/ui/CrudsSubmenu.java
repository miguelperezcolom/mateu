package com.example.demoremote.ui;

import com.example.demoremote.entities.*;
import com.example.demoremote.rpcCruds.ProgrammingLanguages;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class CrudsSubmenu {

    @MenuOption(icon = VaadinIcons.GROUP)
    private JpaCrud<Team> teams = new JpaCrud<Team>() {
        @Override
        public boolean isReadOnly() {
            return true;
        }
    };

    @MenuOption(icon = VaadinIcons.TAG)
    private ProgrammingLanguages programmingLanguages;

    @MenuOption(icon = VaadinIcons.USERS)
    private JpaCrud<Player> allPlayers = new JpaCrud<Player>() {

        @Override
        public List<String> getSearchFilterFields() {
            return List.of("name", "position", "team");
        }

        @Override
        public List<String> getColumnFields() {
            return List.of("name", "position", "team", "age");
        }

    };

    @MenuOption(icon = VaadinIcons.USERS)
    @Caption("Star Wars Characters")
    private JpaCrud<SWCharacter> swCharacters = new JpaCrud<SWCharacter>() {

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
    private JpaCrud<SWFilm> swFilms = new JpaCrud<SWFilm>() {

        @Override
        public List<String> getSearchFilterFields() {
            return List.of("title");
        }

        @Override
        public List<String> getColumnFields() {
            return List.of("title", "director", "release_date");
        }

    };

    @MenuOption(icon = VaadinIcons.BUILDING)
    private JpaCrud<City> cities = new JpaCrud<City>() {

        @Override
        public List<String> getSearchFilterFields() {
            return List.of("name", "country", "population");
        }

        @Override
        public List<String> getColumnFields() {
            return List.of("name", "country", "population");
        }

    };



}
