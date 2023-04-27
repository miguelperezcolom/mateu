package com.example.demoremote.ui.demoApp.menus.errors.rpcTimeouts;


import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BrokenRepo {

    List all = new ArrayList(List.of(
            new BrokenRow("1001", "North Sails")
                , new BrokenRow("1002", "Gun Sails")
                , new BrokenRow("1003", "Gaastra")
        ));

    public List<BrokenRow> findAll() throws InterruptedException {
        Thread.sleep(50000);
        return all;
    }
}
