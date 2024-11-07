package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ItemsProvider;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Section;
import io.mateu.uidl.core.data.ExternalReference;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

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
