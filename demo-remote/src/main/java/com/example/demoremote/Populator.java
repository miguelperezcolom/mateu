package com.example.demoremote;

import com.example.demoremote.nfl.downloader.Reader;
import com.example.demoremote.nfl.downloader.TargetPlayerDto;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Component
public class Populator {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @PostConstruct
    public void populate() throws IOException {

        String json = Helper.leerFichero(Reader.class, "/nfl.json");
        TargetPlayerDto[] players = Helper.fromJson(json, TargetPlayerDto[].class);
        for (TargetPlayerDto player : players) {
            Player p = new Player();
            p.setName(player.getName());
            p.setAge(player.getAge());
            p.setHeight(player.getHeight());
            p.setPosition(player.getPosition());
            p.setId(player.getId());
            p.setTeam(player.getTeam());
            p.setWeight(player.getWeight());
            playerRepository.save(p);
        }

        List<String> teams = Arrays.stream(players).map(p -> p.getTeam()).distinct().collect(Collectors.toList());

        AtomicInteger id = new AtomicInteger(1);
        teams.forEach(t -> teamRepository.save(new Team("" + id.getAndIncrement(), t)));

        List<String> positions = Arrays.stream(players).map(p -> p.getPosition()).distinct().collect(Collectors.toList());

        positions.forEach(t -> System.out.println(t));

        System.out.println(positions.size());
    }

}
