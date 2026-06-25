package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

/**
 * Check-in status of a guest (pax). The constant names are the human labels on purpose: Mateu's
 * reflective deserialization coerces enums with {@code Enum.valueOf(name)} (e.g. when a guest row is
 * selected and the row is rebuilt from the wire), so the wire value must equal the constant name.
 * Using the labels as names keeps the grid showing "Recepción / Pendiente / Checkin" while staying
 * round-trippable.
 */
public enum PaxStatus {
    Recepción,
    Pendiente,
    Checkin
}
