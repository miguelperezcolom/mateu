package io.mateu.mdd.demoadminpanel.infra.in.ui.typedfilters;

import java.time.LocalDate;

public record BookingRow(String locator, String guest, Channel channel, LocalDate created, double total) {
}
