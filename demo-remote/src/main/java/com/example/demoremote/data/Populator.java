package com.example.demoremote.data;

import com.example.demoremote.entities.City;
import com.example.demoremote.cities.CityDto;
import com.example.demoremote.entities.CityRepository;
import com.example.demoremote.entities.*;
import com.example.demoremote.nfl.dtos.Reader;
import com.example.demoremote.nfl.dtos.TargetPlayerDto;
import com.example.demoremote.swapi.dtos.CharacterDto;
import com.example.demoremote.swapi.dtos.FilmDto;
import com.example.demoremote.swapi.dtos.FilmsDto;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.time.LocalDate;
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

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private SWCharacterRepository swCharacterRepository;

    @Autowired
    private SWFilmRepository swFilmRepository;


    @PostConstruct
    public void populate() throws IOException {

        new Thread(() -> {
            try {
                doPopulate();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();

    }

    public void doPopulate() throws IOException {
        String json = Helper.leerFichero(Reader.class, "/nfl.json");
        TargetPlayerDto[] players = Helper.fromJson(json, TargetPlayerDto[].class);
        for (TargetPlayerDto player : players) {
            Player p = new Player();
            p.setName(player.getName());
            p.setAge(player.getAge());
            p.setHeight(player.getHeight());
            p.setPosition(Position.getEnum(player.getPosition()));
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

        json = Helper.leerFichero(Reader.class, "/cities.json"); // 140k cities
        CityDto[] cities = Helper.fromJson(json, CityDto[].class);
        for (CityDto city : cities) {
            City p = new City();
            p.setName(city.getName());
            p.setPopulation(city.getPopulation());
            p.setCountry(city.getCou_name_en());
            p.setTimezone(city.getTimezone());
            p.setModificationDate(LocalDate.parse(city.getModification_date()));
            p.setId(city.getGeoname_id());
            cityRepository.save(p);
        }

        json = Helper.leerFichero(Reader.class, "/swapi_characters.json"); // 140k cities
        CharacterDto[] characters = Helper.fromJson(json, CharacterDto[].class);
        for (CharacterDto characterDto : characters) {
            SWCharacter p = new SWCharacter();
            p.setName(characterDto.getName());
            p.setGender(characterDto.getGender());
            p.setHair_color(characterDto.getHair_color());
            p.setHomeworld(characterDto.getHomeworld());
            if (!"unknown".equals(characterDto.getMass())) p.setMass(Helper.toDouble(characterDto.getMass().replaceAll(",", ".")));
            if (!"unknown".equals(characterDto.getMass())) p.setHeight(Helper.toInt(characterDto.getHeight()));
            p.setId(characterDto.getUrl());
            swCharacterRepository.save(p);
        }

        json = Helper.leerFichero(Reader.class, "/swapi_films.json"); // 140k cities
        FilmsDto films = Helper.fromJson(json, FilmsDto.class);
        for (FilmDto filmDto : films.getResults()) {
            SWFilm p = new SWFilm();
            p.setId(filmDto.getUrl());
            p.setDirector(filmDto.getDirector());
            p.setEpisode_id(filmDto.getEpisode_id());
            p.setProducer(filmDto.getProducer());
            p.setOpening_crawl(filmDto.getOpening_crawl());
            p.setTitle(filmDto.getTitle());
            p.setRelease_date(filmDto.getRelease_date());
            p.setUrl(filmDto.getUrl());
            swFilmRepository.save(p);
        }
    }

}
