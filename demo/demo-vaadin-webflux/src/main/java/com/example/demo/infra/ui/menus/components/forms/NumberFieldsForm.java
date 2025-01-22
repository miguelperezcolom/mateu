package com.example.demo.infra.ui.menus.components.forms;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
@FormColumns(2)
public class NumberFieldsForm {

  @Section("Basic")
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

  @JsonProperty("aBigDecimal")
  private BigDecimal aBigDecimal;

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
                + aBigDecimal
            + ", "
            + anotherIntWithValidations;
  }

  public String toString() {
    return "Numbers";
  }
}
