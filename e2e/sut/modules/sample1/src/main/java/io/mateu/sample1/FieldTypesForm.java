package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@UI("/field-types")
@Title("Field Types Form")
@Getter
@Setter
public class FieldTypesForm {

    String textField;

    int intField;

    long longField;

    double doubleField;

    boolean boolField;

    LocalDate dateField;

    LocalDateTime dateTimeField;

    LocalTime timeField;

}
