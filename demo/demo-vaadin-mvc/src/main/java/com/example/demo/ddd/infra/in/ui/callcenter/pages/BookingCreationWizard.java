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
import io.mateu.uidl.data.*;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;
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
public class BookingCreationWizard extends GenericWizard implements DataSupplier, RuleSupplier {

    final DestinationRepository destinationRepository;

    Dispo dispo = Dispo.builder()
            .build()
            .withDestinationCode("PMI")
            .withCheckin(LocalDate.now().plusDays(7))
            .withNights(7)
            .withCheckout(LocalDate.now().plusDays(14))
            .withRooms1(1)
            .withAdults1(2)
            .withUseCurrentTariffs(true)
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
            /*
            const precio = 123456.789;

// Formato para México (Pesos)
console.log(precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
// "$123,456.79"

// Formato para España (Euros)
console.log(precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }));
// "123.456,79 €"
             */
            chooseRooms = new ChooseRooms(null, null, null,
                    "${(state.prices[state.roomCode1] + state.prices[state.roomCode2] + state.prices[state.roomCode3])?.toLocaleString('es-es', { style: 'currency', currency: 'EUR' })??''}",
                    Map.of(
                            "DBL", 200.21,
                            "DBVM", 150.22,
                            "SUI", 250.23
                    ));
            return super.handleAction("next", httpRequest);
        }
        if ("search".equals(actionId)) {
            dispo = dispo.search();
            return this;
        }
        if ("select".equals(actionId)) {
            var hotelId = ((Map<String, Object>) httpRequest.runActionRq().parameters().get("_clickedRow")).get("id");
            chooseRooms = new ChooseRooms(null, null, null,
                    "${(state.roomCode1 || state.roomCode2 || state.roomCode3)?((state.prices[state.roomCode1]??0) + (state.prices[state.roomCode2]??0) + (state.prices[state.roomCode3]??0)).toLocaleString('es-es', { style: 'currency', currency: 'EUR' }):''}",
                    Map.of(
                            "DBL", 200.21,
                            "DBVM", 150.22,
                            "SUI", 250.23
                    ));
            return super.handleAction("next", httpRequest);
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
    public List<Rule> rules() {
        if (currentStepNumber() == 0) {
            return List.of(Rule.builder()
                    .action(RuleAction.SetAttributeValue)
                    .filter("true")
                    .fieldName("next")
                    .value("true")
                    .fieldAttribute(RuleFieldAttribute.disabled)
                    .result(RuleResult.Continue)
                    .build());
        }
        if (currentStepNumber() == 1) {
            return List.of(Rule.builder()
                            .action(RuleAction.SetAttributeValue)
                            .filter("true")
                            .fieldName("next")
                            .expression("!(state.roomCode1) || !(state.roomCode2) || !(state.roomCode3)")
                            .fieldAttribute(RuleFieldAttribute.disabled)
                            .result(RuleResult.Continue)
                    .build());
        }
        return List.of();
    }
}
