package com.example.demo.infra.in.ui.pages.countries;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class Countries extends AutoCrudOrchestrator<Country> {

    final AutoCrudAdapter<Country> adapter = new AutoCrudAdapter<Country>() {
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
    public AutoCrudAdapter<Country> simpleAdapter() {
        return adapter;
    }
}
