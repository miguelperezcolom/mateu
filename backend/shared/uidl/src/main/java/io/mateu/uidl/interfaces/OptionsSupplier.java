package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;

public interface OptionsSupplier {

    boolean supports(Class<?> fieldType, String fieldName, Class<?> formType);

    ListingData<Option> search(
            String fieldName,
            String searchText,
            Pageable pageable,
            HttpRequest httpRequest);

}
