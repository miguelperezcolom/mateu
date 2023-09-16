package com.example.demoremote.ui.demoApp.menus.collections;

import io.mateu.mdd.shared.annotations.*;
import java.util.List;
import lombok.Data;

@Data
@Caption("Arrays and collections")
public class CollectionsForm {
  @Section("Collections")
  private List<Boolean> booleansCollection = List.of(false, false, true, false);

  private List<Integer> intsCollection = List.of(1, 2, 3, 6);

  private List<Double> doublesCollection = List.of(10.2, 3.1, 8.21);

  private List<String> stringsCollection = List.of("Mateu", "Antonia", "Miguel");

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment =
        ""
            + booleansCollection
            + ","
            + intsCollection
            + ","
            + doublesCollection
            + ","
            + stringsCollection;
  }
}
