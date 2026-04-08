package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Routes;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

record Grupo(@NotEmpty String id, @NotEmpty String nombre) implements Identifiable {}

class Adapter extends AutoCrudAdapter<Grupo> implements CrudRepository<Grupo> {

    static Map<String, Grupo> db = new HashMap<>();

    @Override
    public CrudRepository<Grupo> repository() {
        return this;
    }

    @Override
    public Optional<Grupo> findById(String id) {
        return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Grupo entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Grupo> findAll() {
        return db.values().stream().toList();
    }
}

@Route(value = "/home/grupos", parentRoute = "/home")
public class GroupsCrud extends AutoCrudOrchestrator<Grupo> {
    @Override
    public AutoCrudAdapter<Grupo> simpleAdapter() {
        return new Adapter();
    }
}
