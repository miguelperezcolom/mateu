package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@UI("/auto-layout")
@Title("New customer")
@AutoLayout
@Getter
@Setter
public class AutoLayoutForm {

    public enum Segment { RETAIL, BUSINESS, ENTERPRISE }

    @NotNull
    String name;

    @NotEmpty
    String email;

    @NotNull
    String phone;

    @NotNull
    Segment segment = Segment.RETAIL;

    @Stereotype(FieldStereotype.textarea)
    String deliveryNotes;

    @Stereotype(FieldStereotype.textarea)
    String billingNotes;

    @Stereotype(FieldStereotype.textarea)
    String internalNotes;

    @Stereotype(FieldStereotype.textarea)
    String marketingPreferences;

    String website;

    String vatNumber;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
