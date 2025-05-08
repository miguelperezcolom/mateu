package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import reactor.core.publisher.Mono;

public interface OptionsProvider {

    Mono<Page<Option>> fetchOptions(String listKey, String searchText, Pageable pageable)
            throws Throwable;

}
