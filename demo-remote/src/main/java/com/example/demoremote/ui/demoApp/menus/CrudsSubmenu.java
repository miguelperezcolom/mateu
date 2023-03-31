package com.example.demoremote.ui.demoApp.menus;

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
