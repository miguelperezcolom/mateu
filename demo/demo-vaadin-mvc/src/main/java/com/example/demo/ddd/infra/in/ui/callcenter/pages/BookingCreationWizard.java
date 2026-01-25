package com.example.demo.ddd.infra.in.ui.callcenter.pages;

import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.ChooseRooms;
import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.CompleteBooking;
import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.Dispo;
import com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard.HotelFound;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Destination;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
import io.mateu.core.infra.declarative.GenericWizard;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StateSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Title("Create booking wizard")
@RequiredArgsConstructor
@Scope("prototype")
public class BookingCreationWizard extends GenericWizard implements DataSupplier, TriggersSupplier {

    final DestinationRepository destinationRepository;

    Dispo dispo = Dispo.builder()
            .build()
            .withDestinationCode("PMI")
            .withCheckin(LocalDate.now().plusDays(7))
            .withNights(7)
            .withCheckout(LocalDate.now().plusDays(14))
            .withRooms1(1)
            .withAdults1(2)
            ;

    ChooseRooms chooseRooms;
    CompleteBooking completeBooking;

    HotelFound selectedHotel;

    @WizardCompletionAction
    Object complete() {
        return MateuBeanProvider.getBean(Files.class);
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("results_selected".equals(actionId)) {
            var selection = httpRequest.getSelectedRows("results", HotelFound.class);
            selectedHotel = selection.get(0);
            chooseRooms = new ChooseRooms("a", "b", "c", selectedHotel.total());
            return super.handleAction("next", httpRequest);
        }
        if ("search".equals(actionId)) {
            dispo = dispo.withResults(List.of(
                    new HotelFound("xx", "ii", 100.2, "oo", "cc", false),
                    new HotelFound("xx", "ii", 200.4, "oo", "cc", false)
            ));
            return this;
        }
        return super.handleAction(actionId, httpRequest);
    }

    @Override
    public Object data(HttpRequest httpRequest) {
        if (dispo != null && dispo.destinationCode() != null) {
            return Map.of(
                    "destinationCode", Page.builder()
                                            .content(List.of(new Option(dispo.destinationCode(), destinationRepository.findById(dispo.destinationCode()).map(Destination::name).orElse("Unknown Destination"))))
                                            .searchSignature("xxxx")
                                            .pageNumber(0)
                                            .pageSize(1)
                                            .totalElements(1)
                                            .build(),
                    "destinationCode-label",  dispo.destinationCode() + "xxxx");
        }
        return null;
    }

    @Override
    public List<Trigger> triggers() {
        if (currentStepNumber() == 0) {
            return List.of(OnValueChangeTrigger.builder()
                            .actionId("search")
                    .build());
        }
        return List.of();
    }
}
