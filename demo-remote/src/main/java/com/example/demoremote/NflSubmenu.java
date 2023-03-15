package com.example.demoremote;

import com.example.demoremote.nfl.PlayersCrud;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class NflSubmenu {

    @MenuOption(icon = VaadinIcons.GROUP)
    private JpaCrud<Team> teams = new JpaCrud<Team>() {
        @Override
        public boolean isReadOnly() {
            return true;
        }
    };

    @MenuOption(icon = VaadinIcons.USER)
    private PlayersCrud players;

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

}
