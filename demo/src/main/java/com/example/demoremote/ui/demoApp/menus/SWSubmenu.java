package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.domains.swapi.entities.SWCharacter;
import com.example.demoremote.domains.swapi.entities.SWFilm;
import com.example.demoremote.domains.swapi.entities.SWSpecie;
import com.example.demoremote.domains.swapi.entities.SWStarship;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;
import java.util.List;

public class SWSubmenu {

  @MenuOption
  @Caption("Star Wars Characters")
  private JpaCrud<SWCharacter> characters =
      new JpaCrud<SWCharacter>() {

        @Override
        public List<String> getSearchFilterFields() {
          return List.of("name");
        }

        @Override
        public List<String> getColumnFields() {
          return List.of("name", "gender", "height");
        }
      };

  @MenuOption
  @Caption("Star Wars Films")
  private JpaCrud<SWFilm> films =
      new JpaCrud<SWFilm>() {

        @Override
        public List<String> getSearchFilterFields() {
          return List.of("title");
        }

        @Override
        public List<String> getColumnFields() {
          return List.of("title", "director", "release_date");
        }
      };

  @MenuOption
  @Caption("Star Wars Starships")
  private JpaCrud<SWStarship> starships;

  @MenuOption
  @Caption("Star Wars Species")
  private JpaCrud<SWSpecie> species;
}