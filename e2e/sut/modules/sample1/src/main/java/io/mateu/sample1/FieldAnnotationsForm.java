package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@UI("/field-annotations")
@Title("Field Annotations Form")
@Getter
@Setter
public class FieldAnnotationsForm {

    @Label("Full Name")
    String name;

    @Help("Enter a valid email address")
    @Stereotype(FieldStereotype.email)
    String email;

    @Stereotype(FieldStereotype.password)
    String password;

    @Stereotype(FieldStereotype.textarea)
    String bio;

    @Colspan(2)
    String address;

    @ReadOnly
    String readOnlyField = "fixed-value";

    @Button
    public Message submit() {
        return new Message("Submitted!");
    }

}
