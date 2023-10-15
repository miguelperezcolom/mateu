package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.domains.nfl.entities.Player;
import com.example.demoremote.domains.nfl.entities.Team;
import com.example.demoremote.ui.demoApp.menus.nfl.NflTeamsCrud;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;
import java.util.List;

public class NFLSubmenu {

    @MenuOption
    NflTeamsCrud teamsCrud;

  @MenuOption
  private JpaCrud<Team> teams =
      new JpaCrud<Team>() {
        @Override
        public boolean isReadOnly() {
          return true;
        }
      };

  @MenuOption
  private JpaCrud<Player> players =
      new JpaCrud<Player>() {

        @Override
        public List<String> getSearchFilterFields() {
          return List.of("name", "position", "team");
        }

        @Override
        public List<String> getColumnFields() {
          return List.of("name", "position", "team.name", "age");
        }
      };
}
