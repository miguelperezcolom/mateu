package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.agnostic.pojos.Address;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.*;
import lombok.Data;

import java.util.List;

@Data
@Caption("Complex collections")
public class FilterableTableForm {

  @Table(filterable = true)
  private List<Address> preFilled =
      List.of(
          new Address("Arxiduc Lluís Salvador, 38", "Palma de Mallorca", "07004", "Spain"),
          new Address("Juan Crespí, 12A", "Palma de Mallorca", "07014", "Spain"),
          new Address("Gran vía, 1", "Madrid", "01001", "Spain"));

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + preFilled;
  }
}
