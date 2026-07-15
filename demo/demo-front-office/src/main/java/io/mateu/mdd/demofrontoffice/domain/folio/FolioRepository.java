package io.mateu.mdd.demofrontoffice.domain.folio;

import java.util.Optional;

/** Repository port of the {@link Folio} aggregate. */
public interface FolioRepository {

  Optional<Folio> findById(String id);

  Optional<Folio> findByStayId(String stayId);

  Folio save(Folio folio);
}
