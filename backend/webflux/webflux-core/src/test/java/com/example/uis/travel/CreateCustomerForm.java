package com.example.uis.travel;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UseRadioButtons;
import io.mateu.uidl.data.Destination;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.OptionsProvider;
import io.mateu.uidl.interfaces.Page;
import reactor.core.publisher.Mono;

public class CreateCustomerForm implements Page, OptionsProvider {

  String name;

  Option country;

  @UseRadioButtons CustomerType type;

  @Button
  Mono<Destination> create() {
    return Mono.just(new Destination(""));
  }

  @Override
  public Mono<io.mateu.uidl.data.Page<Option>> fetchOptions(
      String listKey, String searchText, Pageable pageable) throws Throwable {
    return null;
  }
}
