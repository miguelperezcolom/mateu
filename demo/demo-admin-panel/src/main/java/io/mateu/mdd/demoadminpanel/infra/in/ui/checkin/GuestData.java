package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuestData {
    @Label("First name") String firstName;
    @Label("Last name") String lastName;
    @Label("Doc. type") DocumentType documentType;
    @Label("Doc. number") String documentNumber;
    @Label("Doc. expiry") LocalDate documentExpiry;
    @Label("Nationality") String nationality;
    @Label("Date of birth") LocalDate dateOfBirth;
}
