package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.uidl.core.annotations.*;
import io.mateu.uidl.core.data.ExternalReference;
import lombok.Data;

import java.util.List;

@Data
@Caption("Complex collections")
public class RefsForm {

  @ItemsProvider(TeamsProvider.class)
  private List<ExternalReference> externalRefs;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + externalRefs;
  }
}
