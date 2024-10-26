package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ItemsProvider;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Section;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.ExternalReference;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
@Caption("Arrays and collections")
public class ExternalRefsCollectionsForm {

  @Section("With external refs")
  @ItemsProvider(TeamsProvider.class)
  private ExternalReference[] teams = {
    new ExternalReference("1", "Las Vegas Raiders"), new ExternalReference("5", "Seattle Seahawks")
  };

  @ItemsProvider(TeamsProvider.class)
  private List<ExternalReference> teamsCollection =
      List.of(
          new ExternalReference("1", "Las Vegas Raiders"),
          new ExternalReference("5", "Seattle Seahawks"));

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + ", " + Arrays.toString(teams) + ", " + teamsCollection.toString();
  }
}
