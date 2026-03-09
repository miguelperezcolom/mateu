package com.example.demo.infra.in.ui.pages.countries;

import io.mateu.core.infra.declarative.SimpleCrudAdapter;
import io.mateu.core.infra.declarative.SimpleCrudOrchestrator;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class Countries extends SimpleCrudOrchestrator<Country> {

    final SimpleCrudAdapter<Country> adapter = new SimpleCrudAdapter<Country>() {
        @Override
        public CrudRepository<Country> repository() {
            return new CrudRepository<Country>() {
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
    };

    @Override
    public SimpleCrudAdapter<Country> simpleAdapter() {
        return adapter;
    }
}
