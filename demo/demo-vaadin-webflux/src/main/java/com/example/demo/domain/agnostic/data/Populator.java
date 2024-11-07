package com.example.demo.domain.agnostic.data;

import com.example.demo.domain.cities.City;
import com.example.demo.domain.cities.CityDto;
import com.example.demo.domain.cities.CityRepository;
import com.example.demo.domain.nfl.dtos.TargetPlayerDto;
import com.example.demo.domain.nfl.entities.*;
import com.example.demo.domain.swapi.dtos.*;
import com.example.demo.domain.swapi.entities.*;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.util.InputStreamReader;
import io.mateu.core.domain.model.util.SerializerService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Component
public class Populator {

  @Autowired private TeamRepository teamRepository;

  @Autowired private PlayerRepository playerRepository;

  @Autowired private CityRepository cityRepository;

  @Autowired private SWCharacterRepository swCharacterRepository;

  @Autowired private SWFilmRepository swFilmRepository;

  @Autowired private SWSpecieRepository swSpecieRepository;

  @Autowired private SWStarshipRepository swStarshipRepository;

  @Autowired
  ReflectionService reflectionService;

  @Autowired
  SerializerService serializerService;

  @PostConstruct
  public void populate() {

    try {

      doPopulate();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public void doPopulate() throws Exception {
    String json = InputStreamReader.readFromClasspath(Populator.class, "/nfl.json");
    TargetPlayerDto[] players = serializerService.fromJson(json, TargetPlayerDto[].class);

    List<String> teams =
        Arrays.stream(players).map(p -> p.getTeam()).distinct().collect(Collectors.toList());
    Map<String, Team> teamsByName = new HashMap<>();
    AtomicInteger id = new AtomicInteger(1);
    teams.forEach(
        t -> {
          Team team = teamRepository.save(new Team("" + id.getAndIncrement(), t));
          teamsByName.put(t, team);
        });

    for (TargetPlayerDto player : players) {
      Player p = new Player();
      p.setName(player.getName());
      p.setAge(player.getAge());
      p.setHeight(player.getHeight());
      p.setPosition(Position.getEnum(player.getPosition()));
      p.setId(player.getId());
      p.setTeam(teamsByName.get(player.getTeam()));
      p.setWeight(player.getWeight());
      playerRepository.save(p);
    }

    if (false) {
      json = InputStreamReader.readFromClasspath(Populator.class, "/cities.json"); // 140k cities
      CityDto[] cities = serializerService.fromJson(json, CityDto[].class);
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
    }

    json = InputStreamReader.readFromClasspath(Populator.class, "/swapi_characters.json"); // 140k cities
    CharacterDto[] characters = serializerService.fromJson(json, CharacterDto[].class);
    for (CharacterDto characterDto : characters) {
      SWCharacter p = new SWCharacter();
      p.setName(characterDto.getName());
      p.setGender(characterDto.getGender());
      p.setHair_color(characterDto.getHair_color());
      p.setHomeworld(characterDto.getHomeworld());
      if (!"unknown".equals(characterDto.getMass()))
        p.setMass(toDouble(characterDto.getMass().replaceAll(",", ".")));
      if (!"unknown".equals(characterDto.getMass()))
        p.setHeight(toInt(characterDto.getHeight()));
      p.setId(characterDto.getUrl());
      swCharacterRepository.save(p);
    }

    json = InputStreamReader.readFromClasspath(Populator.class, "/swapi_films.json"); // 140k cities
    FilmsDto films = serializerService.fromJson(json, FilmsDto.class);
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

    json = InputStreamReader.readFromClasspath(Populator.class, "/swapi_species.json"); // 140k cities
    SpeciesDto species = serializerService.fromJson(json, SpeciesDto.class);
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

    json = InputStreamReader.readFromClasspath(Populator.class, "/swapi_starships.json"); // 140k cities
    StarshipsDto starships = serializerService.fromJson(json, StarshipsDto.class);
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

  private int toInt(String s) {
    int v = 0;
    try {
      v = Integer.parseInt(s);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return v;
  }

  private double toDouble(String s) {
    double v = 0;
    try {
      v = Double.parseDouble(s);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return v;
  }
}
