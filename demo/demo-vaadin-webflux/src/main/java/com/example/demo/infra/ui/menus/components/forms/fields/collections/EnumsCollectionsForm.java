package com.example.demo.infra.ui.menus.components.forms.fields.collections;

import com.example.demo.domain.nfl.dtos.Division;
import io.mateu.uidl.annotations.*;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
@Title("Arrays and collections")
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
