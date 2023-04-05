package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.domains.cities.City;
import com.example.demoremote.domains.journeyStore.JourneyContainerCrud;
import com.example.demoremote.domains.nfl.entities.Player;
import com.example.demoremote.domains.nfl.entities.Team;
import com.example.demoremote.domains.programmingLanguages.ProgrammingLanguages;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class CrudsSubmenu {

    @MenuOption
    private JpaCrud<Team> teams = new JpaCrud<Team>() {
        @Override
        public boolean isReadOnly() {
            return true;
        }
    };

    @MenuOption
    private ProgrammingLanguages programmingLanguages;

    @MenuOption
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

    @MenuOption
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


    @MenuOption
    JourneyContainerCrud journeyContainers;

}
