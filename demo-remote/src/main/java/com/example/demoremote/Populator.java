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
        int id = 1;
        teamRepository.save(new Team("" + id++, "Arizona Cardinals"));
        teamRepository.save(new Team("" + id++, "Baltimore Ravens"));
        teamRepository.save(new Team("" + id++, "Atlanta Falcons"));
        teamRepository.save(new Team("" + id++, "Buffalo Bills"));
        teamRepository.save(new Team("" + id++, "Carolina Panthers"));
        teamRepository.save(new Team("" + id++, "Cincinnati Bengals"));
        teamRepository.save(new Team("" + id++, "Chicago Bears"));
        teamRepository.save(new Team("" + id++, "Cleveland Browns"));
        teamRepository.save(new Team("" + id++, "Dallas Cowboys"));
        teamRepository.save(new Team("" + id++, "Denver Broncos"));
        teamRepository.save(new Team("" + id++, "Detroit Lions"));
        teamRepository.save(new Team("" + id++, "Houston Texas"));
        teamRepository.save(new Team("" + id++, "Green Bay Packers"));
        teamRepository.save(new Team("" + id++, "Indianapolis Colts"));
        teamRepository.save(new Team("" + id++, "Los Angeles Rams"));
        teamRepository.save(new Team("" + id++, "Jacksonville Jaguars"));
        teamRepository.save(new Team("" + id++, "Minnesota Vikings"));
        teamRepository.save(new Team("" + id++, "Kansas City Chiefs"));
        teamRepository.save(new Team("" + id++, "New Orleans Saints"));
        teamRepository.save(new Team("" + id++, "Las Vegas Raiders"));
        teamRepository.save(new Team("" + id++, "New York Giants"));
        teamRepository.save(new Team("" + id++, "Los Angeles Chargers"));
        teamRepository.save(new Team("" + id++, "Philadelphia Eagles"));
        teamRepository.save(new Team("" + id++, "Miami Dolphins"));
        teamRepository.save(new Team("" + id++, "San Francisco 49ers"));
        teamRepository.save(new Team("" + id++, "New England Patriots"));
        teamRepository.save(new Team("" + id++, "Seattle Seahawks"));
        teamRepository.save(new Team("" + id++, "New York Jets"));
        teamRepository.save(new Team("" + id++, "Tampa Bay Buccaneers"));
        teamRepository.save(new Team("" + id++, "Pittsburgh Steelers"));
        teamRepository.save(new Team("" + id++, "Washington Commanders"));
        teamRepository.save(new Team("" + id++, "Tennessee Titans"));
    }

}
