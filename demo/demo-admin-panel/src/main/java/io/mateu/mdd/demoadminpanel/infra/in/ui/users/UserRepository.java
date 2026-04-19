package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.uidl.interfaces.CrudRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserRepository implements CrudRepository<User> {

    private static final Map<String, User> db = new HashMap<>();

    static {
        db.put("1", new User("1", "Miguel", "miguel@example.com", List.of("1", "2")));
        db.put("2", new User("2", "Ana", "ana@example.com", List.of("2")));
    }

    @Override
    public Optional<User> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(User entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<User> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}