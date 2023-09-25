package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import java.util.Arrays;
import java.util.List;
import lombok.Data;

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
