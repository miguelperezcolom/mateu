package com.example.demoremote.domains.agnostic.data;

import com.example.demoremote.domains.cities.City;
import com.example.demoremote.domains.cities.CityDto;
import com.example.demoremote.domains.cities.CityRepository;
import com.example.demoremote.domains.nfl.entities.*;
import com.example.demoremote.domains.swapi.dtos.*;
import com.example.demoremote.domains.swapi.entities.*;
import com.example.demoremote.domains.nfl.dtos.Reader;
import com.example.demoremote.domains.nfl.dtos.TargetPlayerDto;
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

    @Autowired
    private SWSpecieRepository swSpecieRepository;

    @Autowired
    private SWStarshipRepository swStarshipRepository;

    @PostConstruct
    public void populate() {

        new Thread(() -> {
            try {
                doPopulate();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

    }

    public void doPopulate() throws Exception {
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

        json = Helper.leerFichero(Reader.class, "/swapi_species.json"); // 140k cities
        SpeciesDto species = Helper.fromJson(json, SpeciesDto.class);
        for (SpecieDto specieDto : species.getResults()) {
            SWSpecie p = new SWSpecie();
            p.setId(specieDto.getUrl());
            p.setName(specieDto.getName());
            p.setAverage_height(specieDto.getAverage_height());
            p.setAverage_lifespan(specieDto.getAverage_lifespan());
            p.setClassification(specieDto.getClassification());
            p.setDesignation(specieDto.getDesignation());
            swSpecieRepository.save(p);
        }

        json = Helper.leerFichero(Reader.class, "/swapi_starships.json"); // 140k cities
        StarshipsDto starships = Helper.fromJson(json, StarshipsDto.class);
        for (StarshipDto starshipDto : starships.getResults()) {
            SWStarship p = new SWStarship();
            p.setId(starshipDto.getUrl());
            p.setName(starshipDto.getName());
            p.setCrew(starshipDto.getCrew());
            p.setCost_in_credits(starshipDto.getCost_in_credits());
            p.setLength(starshipDto.getLength());
            p.setManufacturer(starshipDto.getManufacturer());
            p.setMax_atmosphering_speed(starshipDto.getMax_atmosphering_speed());
            p.setPassengers(starshipDto.getPassengers());
            p.setModel(starshipDto.getModel());
            p.setStarship_class(starshipDto.getStartship_class());
            swStarshipRepository.save(p);
        }
    }

}
