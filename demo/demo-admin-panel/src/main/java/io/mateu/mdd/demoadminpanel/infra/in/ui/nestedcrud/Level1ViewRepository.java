package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import io.mateu.uidl.interfaces.CrudRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class Level1ViewRepository implements CrudRepository<Level1View> {

    final Map<String, Level1View> db = new HashMap<>();

    @Override
    public Optional<Level1View> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(Level1View entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Level1View> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}
