package com.example.demo.infra.ui.menus.collections;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Section;
import lombok.Data;

import java.util.Arrays;

@Data
@Caption("Arrays and collections")
public class ArraysForm {

  @Section("Arrays")
  private boolean[] booleans = {false, false, true, false};

  private int[] ints = {1, 2, 3, 5};

  private double[] doubles = {1.2, 3.4, 5.1};

  private String[] strings = {"Mateu", "Antònia", "Miguel"};

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment =
        ""
            + Arrays.toString(booleans)
            + ","
            + Arrays.toString(ints)
            + ","
            + Arrays.toString(doubles)
            + ","
            + Arrays.toString(strings);
  }
}
