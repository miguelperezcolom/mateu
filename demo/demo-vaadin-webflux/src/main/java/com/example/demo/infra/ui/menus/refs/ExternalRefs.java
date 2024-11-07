package com.example.demo.infra.ui.menus.refs;

import com.example.demo.domain.nfl.providers.PlayersProvider;
import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ItemsProvider;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Section;
import io.mateu.uidl.core.data.ExternalReference;
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
