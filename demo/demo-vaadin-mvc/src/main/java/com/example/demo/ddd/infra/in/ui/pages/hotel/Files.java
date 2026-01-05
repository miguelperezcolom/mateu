package com.example.demo.ddd.infra.in.ui.pages.hotel;

import io.mateu.core.infra.declarative.GenericCrud;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.File;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileRepository;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        return bookingCreationWizard;
    }

}
