package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

/**
 * Implemented by a CRUD entity or view that exposes an audit trail. Mateu adds a History action and
 * calls {@link #history(String, AuditFilters, Pageable, HttpRequest)} to fetch the searchable,
 * filterable, paginated list of {@link AuditEntry} records to display.
 */
public interface Auditable {

  ListingData<AuditEntry> history(
      String searchText, AuditFilters filters, Pageable pageable, HttpRequest httpRequest);
}
