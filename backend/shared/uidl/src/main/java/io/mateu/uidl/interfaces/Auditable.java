package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

public interface Auditable {

    ListingData<AuditEntry> history(
            String searchText,
            AuditFilters filters,
            Pageable pageable,
            HttpRequest httpRequest);
}
