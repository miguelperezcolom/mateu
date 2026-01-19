package com.example.demo.ddd.infra.in.ui.callcenter.pages;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard.Dispo;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard.ChooseRooms;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard.CompleteBooking;
import io.mateu.core.infra.declarative.GenericWizard;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.di.MateuBeanProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Title("Create booking wizard")
@RequiredArgsConstructor
public class BookingCreationWizard extends GenericWizard {

    Dispo dispo;
    ChooseRooms chooseRooms;
    CompleteBooking completeBooking;

    @WizardCompletionAction
    Object complete() {
        return MateuBeanProvider.getBean(Files.class);
    }

}
