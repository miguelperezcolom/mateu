package io.mateu.core.domain.act;

import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;

class AuditHistoryListing implements ListingBackend<AuditFilters, AuditEntry> {

  private final Auditable auditable;

  AuditHistoryListing(Auditable auditable) {
    this.auditable = auditable;
  }

  @Override
  public ListingData<AuditEntry> search(
      String searchText, AuditFilters filters, Pageable pageable, HttpRequest httpRequest) {
    return auditable.history(searchText, filters, pageable, httpRequest);
  }
}
