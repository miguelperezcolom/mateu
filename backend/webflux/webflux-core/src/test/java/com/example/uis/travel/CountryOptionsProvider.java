package com.example.uis.travel;

import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.OptionsProvider;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

@Named
public class CountryOptionsProvider implements OptionsProvider {

  @Override
  public Mono<Page<Option>> fetchOptions(String listKey, String searchText, Pageable pageable)
      throws Throwable {
    return Mono.empty();
  }
}
