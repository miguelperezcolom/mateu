package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
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
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
public class CheckInListing extends Listing<CheckInFilters, CheckInRow> {

    final ReservationLineRepository repository;

    @Override
    public GridLayout gridLayout() {
        return GridLayout.list;
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
                        .actions(new ColumnActionGroup(new ColumnAction[]{
                                new ColumnAction("checkin", "Check-in"),
                                new ColumnAction("checkinV2", "Check-in v2"),
                                new ColumnAction("checkinV3", "Check-in v3")
                        }))
                        .build())
                .toList();

        return ListingData.of(rows);
    }

    public Object checkin(CheckInRow row) {
        return io.mateu.uidl.data.UICommand.navigateTo("/checkin/" + row.id());
    }

    public Object checkinV2(CheckInRow row) {
        return io.mateu.uidl.data.UICommand.navigateTo("/checkin/" + row.id() + "/v2");
    }

    public Object checkinV3(CheckInRow row) {
        return io.mateu.uidl.data.UICommand.navigateTo("/checkin/" + row.id() + "/v3");
    }
}
