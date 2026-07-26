package io.mateu.mdd.demofrontoffice.domain.guest;

import java.util.List;
import java.util.Optional;

/** Repository port of the {@link Guest} aggregate. */
public interface GuestRepository {

  Optional<Guest> findById(String id);

  List<Guest> findAll();

  Guest save(Guest guest);
}
