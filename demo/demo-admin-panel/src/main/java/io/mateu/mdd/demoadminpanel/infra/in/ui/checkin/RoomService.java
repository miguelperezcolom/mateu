package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application service for room operations used by the check-in screen.
 * Holds the two use cases involved in the "Preasignar" flow:
 * listing the rooms that are free and assigning one to a reservation.
 */
@Service
public class RoomService {

    private final ReservationLineRepository reservations;

    public RoomService(ReservationLineRepository reservations) {
        this.reservations = reservations;
    }

    /** Use case: rooms currently available to be pre-assigned. */
    public List<AvailableRoom> availableRooms() {
        return List.of(
                AvailableRoom.builder().number("305").type("DBL Doble estándar").state(RoomState.LIMPIA).build(),
                AvailableRoom.builder().number("312").type("DBL-V Doble vista mar").state(RoomState.LIMPIA).build(),
                AvailableRoom.builder().number("418").type("DBL-V Doble vista mar").state(RoomState.PENDIENTE).build(),
                AvailableRoom.builder().number("507").type("SUP Suite Junior").state(RoomState.LIMPIA).build(),
                AvailableRoom.builder().number("521").type("FAM Familiar superior").state(RoomState.PENDIENTE).build(),
                AvailableRoom.builder().number("604").type("SUP Suite Junior").state(RoomState.SUCIA).build()
        );
    }

    /**
     * Use case: assign {@code roomNumber} to the reservation identified by {@code reservationId}
     * and persist the change.
     */
    public void assignRoom(String reservationId, String roomNumber) {
        reservations.findById(reservationId).ifPresent(line -> {
            line.setAssignedRoom(roomNumber);
            reservations.save(line);
        });
    }
}
