package com.example.demo.ddd.infra.in.ui.callcenter.pages;

import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.ChooseRooms;
import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.CompleteBooking;
import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.Dispo;
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
