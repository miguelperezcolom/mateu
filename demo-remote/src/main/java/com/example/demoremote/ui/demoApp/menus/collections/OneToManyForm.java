package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import java.util.Arrays;
import java.util.List;
import lombok.Data;

@Data
@Caption("One to many relationships")
public class OneToManyForm {

  @Section("External refs")
  @ItemsProvider(TeamsProvider.class)
  private ExternalReference[] array;

  @ItemsProvider(TeamsProvider.class)
  private List<ExternalReference> list;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + Arrays.toString(array) + ", " + list.toString();
  }
}
