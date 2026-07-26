package io.mateu.mdd.demofrontoffice.domain.automation;

import java.util.List;
import java.util.Optional;

/** Repository port of the {@link Automation} aggregate. */
public interface AutomationRepository {

  Optional<Automation> findById(String id);

  List<Automation> findAll();

  Automation save(Automation automation);
}
