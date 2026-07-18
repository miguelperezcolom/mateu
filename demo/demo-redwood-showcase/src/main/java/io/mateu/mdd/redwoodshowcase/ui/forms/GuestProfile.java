package io.mateu.mdd.redwoodshowcase.ui.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;

/**
 * A multi-zone form to review Redwood form fidelity: a wide "details" zone beside a narrow
 * "status" zone, several field types, help text, a header badge and a status field.
 */
@UI("/guest")
@Title("Guest profile")
@Zones({@Zone(name = "main", width = "64%"), @Zone(name = "side", width = "36%")})
public class GuestProfile {

    @Section(value = "Personal data", zone = "main", columns = 2)
    @NotEmpty
    String firstName;

    @NotEmpty
    String lastName;

    @Email
    String email;

    String phone;

    LocalDate birthDate;

    @Section(value = "Address", zone = "main", columns = 2)
    String street;

    String city;

    String zipCode;

    @Lookup
    String country;

    // NOTE: the section header must sit on a field that stays in the body. `vip` is a
    // @BadgeInHeader field (excluded from the body), so the @Section that opens the
    // "Preferences" zone lives on the first visible field of the group (`newsletter`).
    @BadgeInHeader(label = "VIP", color = "success")
    boolean vip = true;

    @Section(value = "Preferences", zone = "side")
    boolean newsletter;

    @Help("Used only for room assignment.")
    boolean smoker;

    @Stereotype(FieldStereotype.textarea)
    @Label("Notes")
    String notes;

    @Button
    public Message save() {
        return new Message("Guest profile saved");
    }
}
