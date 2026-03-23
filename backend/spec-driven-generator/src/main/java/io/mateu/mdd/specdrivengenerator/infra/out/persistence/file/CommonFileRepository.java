package io.mateu.mdd.specdrivengenerator.infra.out.persistence.file;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateRow;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.annotation.PostConstruct;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static io.mateu.core.infra.JsonSerializer.pojoFromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;

@Service
public class CommonFileRepository {

    private final Map<String, Object> store = new HashMap<>();

    public <T> Optional<T> findById(String id, Class<T> type) {
        return Optional.ofNullable((T) store.get(id));
    }
    public void save(Identifiable o) {
        store.put(o.id(), o);
        persist();
    }

    public <T> ListingData<T> findAll(String searchText, Object filters, Pageable pageable, Class<T> entityClass) {
        var data = (List<T>) store.values().stream().filter(v -> v.getClass().equals(entityClass)).toList();
        return new ListingData<T>(new Page<T>(searchText, pageable.size(), pageable.page(), data.size(),
                data.stream().skip(pageable.page() * pageable.size()).limit(pageable.size()).toList()));
    }

    public void deleteAllById(List<String> list) {
        list.forEach(store::remove);
        persist();
    }

    @SneakyThrows
    @PostConstruct
    public void init() {
        String json = Files.readString(Path.of(".dev/data/spec-driven-store.json"));
        AllData data = pojoFromJson(json, AllData.class);
        store.clear();
        data.projects().forEach(p -> store.put(p.id(), p));
        data.modules().forEach(p -> store.put(p.id(), p));
        data.aggregates().forEach(p -> store.put(p.id(), p));
        data.entities().forEach(p -> store.put(p.id(), p));
        data.valueObjects().forEach(p -> store.put(p.id(), p));
        data.invariants().forEach(p -> store.put(p.id(), p));
    }

    @SneakyThrows
    private void persist() {
        List<ProjectEntity> projects = store.values().stream().filter(v -> v instanceof ProjectEntity).map(v -> (ProjectEntity) v).toList();
        List<ModuleEntity> modules = store.values().stream().filter(v -> v instanceof ModuleEntity).map(v -> (ModuleEntity) v).toList();
        List<AggregateEntity> aggregates = store.values().stream().filter(v -> v instanceof AggregateEntity).map(v -> (AggregateEntity) v).toList();
        List<EntityEntity> entities = store.values().stream().filter(v -> v instanceof EntityEntity).map(v -> (EntityEntity) v).toList();
        List<ValueObjectEntity> valueObjects = store.values().stream().filter(v -> v instanceof ValueObjectEntity).map(v -> (ValueObjectEntity) v).toList();
        List<InvariantEntity> ivariants = store.values().stream().filter(v -> v instanceof InvariantEntity).map(v -> (InvariantEntity) v).toList();
        AllData data = new AllData(
                projects,
                modules,
                aggregates,
                entities,
                valueObjects,
                ivariants
        );
        Files.writeString(Path.of(".dev/data/spec-driven-store.json"), toJson(data));
    }

}
