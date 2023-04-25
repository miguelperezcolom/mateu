package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class SalesAgentsRepo {

    List<SalesAgentsRow> all = new ArrayList(List.of(
            new SalesAgentsRow("1", "1001", "Michael Jordan")
                        , new SalesAgentsRow("2", "1001", "Magic Johnson")
            , new SalesAgentsRow("3", "1002", "Kareem Abdul Jabbar")
                ));

    public List<SalesAgentsRow> findAll() {
        return all;
    }
}
