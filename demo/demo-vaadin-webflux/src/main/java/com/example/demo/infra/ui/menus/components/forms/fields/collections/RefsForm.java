package com.example.demo.infra.ui.menus.components.forms.fields.collections;

import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.ExternalReference;
import lombok.Data;

import java.util.List;

@Data
@Title("Complex collections")
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
