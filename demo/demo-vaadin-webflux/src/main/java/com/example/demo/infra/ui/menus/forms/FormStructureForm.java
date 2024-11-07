package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.FieldGroup;
import io.mateu.uidl.core.annotations.FormColumns;
import io.mateu.uidl.core.annotations.Section;

@FormColumns(3)
public class FormStructureForm {

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
    @Section(value = "Section 2", columns = 2)
    @FieldGroup(value = "Group 3")
    String field11;
    String field12;
    String field13;
    String field14;
    @Section("Section 3")
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
