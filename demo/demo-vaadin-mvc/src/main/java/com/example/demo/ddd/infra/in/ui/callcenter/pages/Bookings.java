package com.example.demo.ddd.infra.in.ui.callcenter.pages;

import io.mateu.core.infra.declarative.GenericCrud;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.Booking;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.BookingRepository;
import io.mateu.uidl.interfaces.Repository;
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
