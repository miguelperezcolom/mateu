package com.example.demoremote.ui.demoApp.menus.forms;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.mateu.mdd.shared.annotations.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class NumberFieldsForm {

  @Section("Basic")
  @NotEmpty
  private int anInt = 3;

  @Placeholder("This should appear as the placeholder")
  @JsonProperty("aPrimitiveDouble")
  private double aPrimitiveDouble = 1.2;

  @JsonProperty("aPrimitiveFloat")
  private float aPrimitiveFloat = 2.3f;

  @Min(0)
  private Integer anInteger;

  @JsonProperty("aDouble")
  private Double aDouble;

  @JsonProperty("aFloat")
  private Float aFloat;

  @Min(10)
  @Max(20)
  @Placeholder("10<x<20")
  private int anotherIntWithValidations;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment =
        ""
            + ""
            + anInt
            + ", "
            + aPrimitiveDouble
            + ", "
            + aPrimitiveFloat
            + ", "
            + anInteger
            + ", "
            + aDouble
            + ", "
            + aFloat
            + ", "
            + anotherIntWithValidations;
  }

  public String toString() {
    return "Numbers";
  }
}
