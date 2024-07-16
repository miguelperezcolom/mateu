package com.example.demo.infra.ui.menus.refs;

import com.example.demo.domain.nfl.providers.PlayersProvider;
import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ItemsProvider;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import lombok.Data;

@Data
@Caption("External refs and files")
public class ExternalRefs {

  @Section("External refs")
  @ItemsProvider(PlayersProvider.class)
  private ExternalReference yourFavouritePlayer;

  @ItemsProvider(TeamsProvider.class)
  private ExternalReference teamAtSanFrancisco = new ExternalReference("25", "San Francisco 49ers");

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + yourFavouritePlayer + ", " + teamAtSanFrancisco;
  }
}
