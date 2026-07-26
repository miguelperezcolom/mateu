package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.guest.Guest;
import org.springframework.data.repository.ListCrudRepository;

/** Spring Data JDBC repository backing {@link H2GuestRepository}. */
interface GuestCrud extends ListCrudRepository<Guest, String> {}
