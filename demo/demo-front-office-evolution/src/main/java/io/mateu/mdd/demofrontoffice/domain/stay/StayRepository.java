package io.mateu.mdd.demofrontoffice.domain.stay;

import java.util.List;
import java.util.Optional;

/** Repository port of the {@link Stay} aggregate. */
public interface StayRepository {

  Optional<Stay> findById(String id);

  List<Stay> findAll();

  /** Today's check-in queue: arriving stays, earliest check-in first. */
  List<Stay> findArrivals();

  /** The check-out queue / "en casa" guests: in-house stays, earliest departure first. */
  List<Stay> findInHouse();

  Stay save(Stay stay);
}
