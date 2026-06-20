package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Title("Arrivals")
@Service
@Scope("prototype")
@RequiredArgsConstructor
@UI("/checkin")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class CheckInListing extends Listing<CheckInFilters, CheckInRow> {

    final ReservationLineRepository repository;

    @Override
    public GridLayout gridLayout() {
        return GridLayout.table;
    }

    @Override
    public ListingData<CheckInRow> search(
            String searchText, CheckInFilters filters, Pageable pageable, HttpRequest httpRequest) {

        var rows = repository.findAll(searchText, filters.getArrivalDate(), filters.getStatus())
                .stream()
                .map(line -> CheckInRow.builder()
                        .id(line.getId())
                        .titular(line.getTitular())
                        .localizador(line.getLocalizador())
                        .agencia(line.getAgencia())
                        .roomType(line.getRoomType())
                        .assignedRoom(line.getAssignedRoom() != null && !line.getAssignedRoom().isBlank()
                                ? line.getAssignedRoom() : "—")
                        .pax(line.getPax())
                        .arrivalDate(line.getArrivalDate())
                        .departureDate(line.getDepartureDate())
                        .status(line.getStatus())
                        .actions(new ColumnAction("checkin", "Check-in"))
                        .build())
                .toList();

        return ListingData.of(rows);
    }

    public Object checkin(CheckInRow row) {
        var form = MateuBeanProvider.getBean(CheckInForm.class);
        form.id = row.id();
        form.populate();
        return form;
    }
}
