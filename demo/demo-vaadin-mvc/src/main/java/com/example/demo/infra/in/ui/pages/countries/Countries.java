package com.example.demo.infra.in.ui.pages.countries;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.interfaces.CrudRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Countries extends AutoCrud<Country> {

    @Override
    public CrudRepository<Country> store() {
        return new CrudRepository<>() {
            @Override
            public Optional<Country> findById(String id) {
                return Optional.of(new Country("ES", "Spain"));
            }

            @Override
            public String save(Country entity) {
                return "ES";
            }

            @Override
            public List<Country> findAll() {
                return List.of(new Country("ES", "Spain"));
            }

            @Override
            public void deleteAllById(List<String> selectedIds) {
            }
        };
    }
}
