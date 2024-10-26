package com.example.demo.infra.ui.menus;

import com.example.demo.domain.nfl.entities.Player;
import com.example.demo.domain.nfl.entities.Team;
import com.example.demo.infra.ui.menus.nfl.NflTeamsCrud;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.JpaCrud;

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
