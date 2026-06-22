package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/stereotypes")
@Title("Stereotypes Form")
@Getter
@Setter
public class StereotypesForm {

    @Stereotype(FieldStereotype.email)
    String email;

    @Stereotype(FieldStereotype.password)
    String password;

    @Stereotype(FieldStereotype.textarea)
    String description;

    @Stereotype(FieldStereotype.toggle)
    boolean toggleField;

    @Stereotype(FieldStereotype.radio)
    Status radioStatus = Status.ACTIVE;

    @Stereotype(FieldStereotype.slider)
    @SliderMin(0)
    @SliderMax(100)
    int sliderValue = 50;

    @Button
    public Message save() {
        return new Message("Saved with email=" + email);
    }

    enum Status { ACTIVE, INACTIVE, PENDING }

}
