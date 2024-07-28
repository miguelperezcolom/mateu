package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.agnostic.pojos.Address;
import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ItemsProvider;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import lombok.Data;

import java.util.List;

@Data
@Caption("Complex collections")
public class ComplexCollectionsForm {

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
