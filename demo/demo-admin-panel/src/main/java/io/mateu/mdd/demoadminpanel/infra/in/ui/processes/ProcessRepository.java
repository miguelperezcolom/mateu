package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.uidl.interfaces.CrudRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProcessRepository implements CrudRepository<ProcessRow> {

Map<String, ProcessRow> db = new HashMap<>();

@Override
public Optional<ProcessRow> findById(String id) {
    return Optional.ofNullable(db.get(id));
}

@Override
public String save(ProcessRow entity) {
    db.put(entity.id(), entity);
    return entity.id();
}

@Override
public List<ProcessRow> findAll() {
    return db.values().stream().toList();
}

@Override
public void deleteAllById(List<String> selectedIds) {
    selectedIds.forEach(db::remove);
}
}
