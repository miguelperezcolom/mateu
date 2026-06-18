package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.interfaces.Identifiable;

import java.time.LocalDate;

public record CheckInRow(
    @Hidden String id,
    @Label("Localizador") String localizador,
    @Label("Guest") String titular,
    @Label("Agency") String agencia,
    @Label("Room type") String roomType,
    @Label("Room") String assignedRoom,
    @Label("Pax") int pax,
    @Label("Arrival") LocalDate arrivalDate,
    @Label("Departure") LocalDate departureDate,
    @Label("Status") Status status,
    ColumnAction action
) implements Identifiable {}
