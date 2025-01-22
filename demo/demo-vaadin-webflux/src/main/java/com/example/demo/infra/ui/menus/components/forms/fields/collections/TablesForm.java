package com.example.demo.infra.ui.menus.components.forms.fields.collections;

import com.example.demo.domain.agnostic.pojos.Address;
import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.ExternalReference;
import lombok.Data;

import java.util.List;

@Data
@Title("Complex collections")
public class TablesForm {

  @Section("Complex collections")
  private List<Address> addresses;

  private List<Address> preFilled =
      List.of(
          new Address("Arxiduc Lluís Salvador, 38", "Palma de Mallorca", "07004", "Spain"),
          new Address("Juan Crespí, 12A", "Palma de Mallorca", "07014", "Spain"),
          new Address("Gran vía, 1", "Madrid", "01001", "Spain"));

  @ItemsProvider(TeamsProvider.class)
  private List<ExternalReference> externalRefs;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + addresses + ", " + preFilled + ", " + externalRefs;
  }
}
