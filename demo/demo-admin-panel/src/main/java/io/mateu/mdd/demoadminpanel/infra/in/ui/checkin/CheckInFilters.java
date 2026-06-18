package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CheckInFilters {
    @Label("Arrival date")
    LocalDate arrivalDate = LocalDate.now();

    @Label("Status")
    CheckInStatus status;
}
