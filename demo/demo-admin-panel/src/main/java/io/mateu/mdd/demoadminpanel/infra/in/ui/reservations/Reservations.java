package io.mateu.mdd.demoadminpanel.infra.in.ui.reservations;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@UI("/reservations")
@Title("Reservations")
public class Reservations extends AutoCrud<Reservation> {

    final ReservationRepository repository;

    @Override
    public CrudRepository<Reservation> store() {
        return repository;
    }

    @Override
    public Class rowClass() {
        return ReservationRow.class;
    }

    @Override
    public GridLayout gridLayout() {
        return GridLayout.list;
    }

    @Override
    @SuppressWarnings("unchecked")
    public ListingData<Reservation> fetchRows(
            String searchText, Reservation filters, Pageable pageable, HttpRequest httpRequest) {
        var reservations = repository.findAll().stream()
                .filter(r -> searchText == null || searchText.isEmpty()
                        || r.getLocalizador().toLowerCase().contains(searchText.toLowerCase())
                        || r.getHotel().toLowerCase().contains(searchText.toLowerCase())
                        || r.getTitular().toLowerCase().contains(searchText.toLowerCase()))
                .toList();
        int pageSize = pageable != null && pageable.size() > 0 ? pageable.size() : reservations.size();
        int pageNumber = pageable != null ? pageable.page() : 0;
        int from = Math.min(pageNumber * pageSize, reservations.size());
        int to = Math.min(from + pageSize, reservations.size());
        List<ReservationRow> rows = reservations.subList(from, to).stream()
                .map(r -> ReservationRow.builder()
                        .id(r.getId())
                        .localizador(r.getLocalizador())
                        .hotel(r.getHotel())
                        .titular(r.getTitular())
                        .arrivalDate(r.getArrivalDate())
                        .status(r.getStatus())
                        .build())
                .toList();
        return (ListingData<Reservation>) (Object) new ListingData<>(
                new Page<>("", pageSize, pageNumber, reservations.size(), rows));
    }
}
