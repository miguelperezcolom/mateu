package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import java.util.Optional;
import org.springframework.data.repository.ListCrudRepository;

/** Spring Data JDBC repository backing {@link H2FolioRepository}. */
interface FolioCrud extends ListCrudRepository<Folio, String> {

  Optional<Folio> findByStayId(String stayId);
}
