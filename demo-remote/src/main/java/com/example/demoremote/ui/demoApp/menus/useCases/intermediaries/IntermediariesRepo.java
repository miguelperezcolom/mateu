package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries;


import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class IntermediariesRepo {

    List all = new ArrayList(List.of(
            new IntermediariesRow("1001", "North Sails")
                , new IntermediariesRow("1002", "Gun Sails")
                , new IntermediariesRow("1003", "Gaastra")
        ));

    public List<IntermediariesRow> findAll() {
        return all;
    }
}
