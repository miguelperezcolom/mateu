package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.automation.Automation;
import org.springframework.data.repository.ListCrudRepository;

/** Spring Data JDBC repository backing {@link H2AutomationRepository}. */
interface AutomationCrud extends ListCrudRepository<Automation, String> {}
