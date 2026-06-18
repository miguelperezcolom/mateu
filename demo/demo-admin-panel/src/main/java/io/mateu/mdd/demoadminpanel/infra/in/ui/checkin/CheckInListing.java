package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.*;
import io.mateu.uidl.di.MateuBeanProvider;
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
    public ListingData<CheckInRow> search(
            String searchText, CheckInFilters filters, Pageable pageable, HttpRequest httpRequest) {

        var rows = repository.findAll(searchText, filters.getArrivalDate(), filters.getStatus())
                .stream()
                .map(line -> new CheckInRow(
                        line.getId(),
                        line.getLocalizador(),
                        line.getTitular(),
                        line.getAgencia(),
                        line.getRoomType(),
                        line.getAssignedRoom() != null ? line.getAssignedRoom() : "—",
                        line.getPax(),
                        line.getArrivalDate(),
                        line.getDepartureDate(),
                        mapStatus(line.getStatus()),
                        new ColumnAction("checkin", "Check-in")
                ))
                .toList();

        return ListingData.of(rows);
    }

    public Object checkin(CheckInRow row) {
        var form = MateuBeanProvider.getBean(CheckInForm.class);
        form.id = row.id();
        return form;
    }

    private Status mapStatus(CheckInStatus status) {
        return switch (status) {
            case PENDING -> new Status(StatusType.WARNING, "Pending");
            case CHECKED_IN -> new Status(StatusType.SUCCESS, "Checked in");
            case CHECKED_OUT -> new Status(StatusType.NONE, "Checked out");
        };
    }
}
