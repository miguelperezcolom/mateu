package io.mateu.core.domain.act;

import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;

class AuditHistoryListing implements Listing<AuditEntry>, Searchable, Filterable<AuditFilters> {

  private final Auditable auditable;

  AuditHistoryListing(Auditable auditable) {
    this.auditable = auditable;
  }

  @Override
  public ListingData<AuditEntry> search(SearchRequest request, HttpRequest httpRequest) {
    return auditable.history(
        request.searchText(), filters(request), request.pageable(), httpRequest);
  }
}
