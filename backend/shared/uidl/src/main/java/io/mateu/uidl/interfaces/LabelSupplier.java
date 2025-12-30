package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;

public interface LabelSupplier {

    String label(
            Object id,
            HttpRequest httpRequest);

}
