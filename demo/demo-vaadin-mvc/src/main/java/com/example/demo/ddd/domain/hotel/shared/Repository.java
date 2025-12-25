package com.example.demo.ddd.domain.hotel.shared;

import java.util.List;
import java.util.Optional;

public interface Repository<EntityType, IdType> {

    void saveAll(List<EntityType> entities);

    List<EntityType> findAll();

    Optional<EntityType> findById(IdType id);

}
