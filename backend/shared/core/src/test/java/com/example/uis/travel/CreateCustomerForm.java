package com.example.uis.travel;

import com.example.uis.travel.uidl.Destination;
import com.example.uis.travel.uidl.Form;
import com.example.uis.travel.uidl.Intent;
import com.example.uis.travel.uidl.MainAction;
import com.example.uis.travel.uidl.Option;
import com.example.uis.travel.uidl.Page;
import com.example.uis.travel.uidl.Pageable;
import com.example.uis.travel.uidl.UseRadioButtons;
import reactor.core.publisher.Mono;

@Intent
public class CreateCustomerForm implements Form, OptionsProvider {

    String name;

    Option country;

    @UseRadioButtons
    CustomerType type;

    @MainAction
    Mono<Destination> create() {
        return Mono.just(new Destination(""));
    }

    @Override
    public Mono<Page<Option>> fetchOptions(String listKey, String searchText, Pageable pageable) throws Throwable {
        return null;
    }

}
