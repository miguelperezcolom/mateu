package io.mateu.mdd.demoadminpanel.infra.in.ui.reservations;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@UI("/reservations")
@Title("Reservations")
public class Reservations extends AutoCrud<Reservation> {

    final ReservationRepository repository;

    @Override
    public CrudRepository<Reservation> repository() {
        return repository;
    }
}
