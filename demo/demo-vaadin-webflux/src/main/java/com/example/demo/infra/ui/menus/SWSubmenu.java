package com.example.demo.infra.ui.menus;

import com.example.demo.domain.swapi.entities.SWCharacter;
import com.example.demo.domain.swapi.entities.SWFilm;
import com.example.demo.domain.swapi.entities.SWSpecie;
import com.example.demo.domain.swapi.entities.SWStarship;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.JpaCrud;

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
