package com.example.demoremote.ui.demoApp.menus.useCases.leads;


import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Service
public class LeadsRepo {

    List all = new ArrayList(List.of(
            new LeadsRow("1001", "North Sails")
                , new LeadsRow("1002", "Gun Sails")
                , new LeadsRow("1003", "Gaastra")
        ));

    public Flux<LeadsRow> findAll() {
        return Flux.fromStream(all.stream());
    }
}
