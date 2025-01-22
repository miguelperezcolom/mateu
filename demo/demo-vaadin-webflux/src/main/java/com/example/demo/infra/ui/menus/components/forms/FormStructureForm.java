package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.VGap;

import java.util.concurrent.Callable;

@FormColumns(3)
public class FormStructureForm {

    @Section(value = "Section 1", columns = 2, sidePositionedLabel = true, itemLabelWidth = "160px")
    String field01;
    @ReadOnly
    String field02;
    @Money
            @Output
    double field03 = 123001;
    String field04;
    @Output
            @RightAligned
            @Bold
    String total = "2.000,23 EUR";
    String field05;
    @Colspan(2)
    VGap vgap = new VGap("60px");
    @Button
            @Width("100%")
            @Colspan(2)
    Callable<String> myButton;
    @Section(value = "Section 2")
    @FieldGroup(value = "Group 1", columns = 2)
    String field1;
    String field2;
    String field3;
    String field4;
    String field5;
    @FieldGroup(value = "Group 2", columns = 1)
    String field6;
    String field7;
    String field8;
    String field9;
    String field10;
    @Section(value = "Section 3", columns = 2)
    @FieldGroup(value = "Group 3")
    String field11;
    String field12;
    String field13;
    String field14;
    @Section("Section 4")
    String field15;
    String field16;
    String field17;
    String field18;
    String field19;
    String field20;
    String field21;
    String field22;
    String field23;
    String field24;
}
