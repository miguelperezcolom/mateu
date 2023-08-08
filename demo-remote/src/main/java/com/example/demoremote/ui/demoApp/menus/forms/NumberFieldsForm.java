package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class NumberFieldsForm {

    @Section("Basic")
    @NotEmpty
    private int anInt;

    @Placeholder("This should appear as the placeholder")
    private double aPrimitiveDouble;

    private float aPrimitiveFloat;

    private Integer anInteger;

    private Double aDouble;

    private Float aFloat;

    @Min(10)@Max(20)
    @Placeholder("10<x<20")
    private int anotherIntWithValidations;

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = ""
                + "" + anInt
                + ", " + aPrimitiveDouble
                + ", " + aPrimitiveFloat
                + ", " + anInteger
                + ", " + aDouble
                + ", " + aFloat
                + ", " + anotherIntWithValidations
        ;
    }

    public String toString() {
        return "Numbers";
    }

}
