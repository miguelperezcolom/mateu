package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.Ignored;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class RoomingForm {
    @Ignored
    private final RoomingListView.Row row;

    private String hotelName;

    private long bookings;

    public RoomingForm(RoomingListView.Row row) {
        this.row = row;
        this.hotelName = row.getName();
        this.bookings = row.getBookings();
    }
}
