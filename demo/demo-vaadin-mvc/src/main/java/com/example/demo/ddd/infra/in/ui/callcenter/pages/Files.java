package com.example.demo.ddd.infra.in.ui.callcenter.pages;

import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.Dispo;
import io.mateu.core.infra.declarative.GenericCrud;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.File;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileRepository;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class Files extends GenericCrud<File> {

    final FileRepository fileRepository;
    final BookingCreationWizard bookingCreationWizard;


    @Override
    public Repository<File, String> repository() {
        return fileRepository;
    }

    @ListToolbarButton(rowsSelectedRequired = false, confirmationRequired = false)
    Object create() {

        bookingCreationWizard.dispo = Dispo.builder()
                .build()
                .withDestinationCode("PMI")
                .withCheckin(LocalDate.now().plusDays(7))
                .withNights(7)
                .withCheckout(LocalDate.now().plusDays(14))
                .withRooms1(1)
                .withAdults1(2)
                .withUseCurrentTariffs(true);
        return bookingCreationWizard;
    }

}
