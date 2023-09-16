package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.nfl.dtos.Division;
import io.mateu.mdd.shared.annotations.*;
import java.util.Arrays;
import java.util.List;
import lombok.Data;

@Data
@Caption("Arrays and collections")
public class EnumsCollectionsForm {

  @Section("With enums")
  private Division[] enums = {Division.East, Division.South};

  private List<Division> enumsCollection = List.of(Division.South, Division.West);

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + ", " + Arrays.toString(enums) + ", " + enumsCollection.toString();
  }
}
