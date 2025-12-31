package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.Booking;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.BookingRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import io.mateu.uidl.annotations.ListToolbarButton;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Bookings extends GenericCrud<Booking> {

    final BookingRepository bookingRepository;
    final BookingCreationWizard bookingCreationWizard;


    @Override
    public Repository<Booking, String> repository() {
        return bookingRepository;
    }

    @ListToolbarButton(rowsSelectedRequired = false, confirmationRequired = false)
    Object create() {
        return bookingCreationWizard;
    }

}
