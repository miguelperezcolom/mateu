package com.example.demo.infra.out.persistence;

import com.example.demo.infra.in.ui.pages.processes.Process;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Named;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class AbstractAutoRepository<T extends Identifiable> implements CrudRepository<T> {

    Map<String, T> db = new HashMap<>();

    @Override
    public Optional<T> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(T entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<T> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(id -> db.remove(id));
    }
}
