package com.example.demoremote.domains.swapi.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SWFilmRepository extends JpaRepository<SWFilm, String> {}
