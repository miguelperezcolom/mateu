package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard.Step1;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard.Step2;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard.Step3;
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

    Step1 step1;
    Step2 step2;
    Step3 step3;

    @WizardCompletionAction
    Object complete() {
        return MateuBeanProvider.getBean(Files.class);
    }

}
