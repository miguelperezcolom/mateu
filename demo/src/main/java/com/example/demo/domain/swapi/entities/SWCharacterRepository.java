package com.example.demo.domain.swapi.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SWCharacterRepository extends JpaRepository<SWCharacter, String> {}
