package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;

/**
 * Check-in status of a guest (pax). Maps to a compact one-letter coloured badge ({@link Status})
 * shown in the "Estado" column of the guests grid: R = en recepción, P = pendiente, C = checkin,
 * N = no show.
 */
public enum PaxStatus {
    RECEPCION(StatusType.WARNING, "R"),
    PENDIENTE(StatusType.NONE, "P"),
    CHECKIN(StatusType.SUCCESS, "C"),
    NOSHOW(StatusType.DANGER, "N");

    private final StatusType type;
    private final String code;

    PaxStatus(StatusType type, String code) {
        this.type = type;
        this.code = code;
    }

    /** The one-letter coloured badge shown in the grid. */
    public Status toBadge() {
        return new Status(type, code);
    }
}
