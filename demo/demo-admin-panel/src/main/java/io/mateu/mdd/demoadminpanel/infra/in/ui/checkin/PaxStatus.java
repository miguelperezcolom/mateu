package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Check-in status of a guest (pax). Serialized/displayed using the human label so the grid shows
 * "Recepción" / "Pendiente" / "Checkin"; {@link JsonCreator} accepts either the label or the
 * constant name so the value round-trips (e.g. when a guest row is clicked).
 */
public enum PaxStatus {
    RECEPCION("Recepción"),
    PENDIENTE("Pendiente"),
    CHECKIN("Checkin");

    private final String label;

    PaxStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static PaxStatus fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (var s : values()) {
            if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) {
                return s;
            }
        }
        return null;
    }
}
