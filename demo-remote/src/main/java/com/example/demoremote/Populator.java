package com.example.demoremote;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.UUID;

@Component
public class Populator {

    @Autowired
    private TeamRepository teamRepository;

    @PostConstruct
    public void populate() {
        teamRepository.save(new Team(UUID.randomUUID().toString(), "Kansas City Chiefs"));
        teamRepository.save(new Team(UUID.randomUUID().toString(), "Buffalo Bills"));
        teamRepository.save(new Team(UUID.randomUUID().toString(), "Green Bay Packers"));
        teamRepository.save(new Team(UUID.randomUUID().toString(), "San Francisco 49ers"));
    }

}
