package com.example.demo.ddd.infra.out.persistence;

import io.mateu.core.infra.declarative.Entity;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

public abstract class CompositionLocalRepository<EntityType extends Entity<IdType>, ParentIdType, IdType> implements CompositionRepository<EntityType, ParentIdType, IdType> {

    private final Map<IdType, EntityType> repository = new ConcurrentHashMap<>();

    @Override
    public void saveAll(List<EntityType> entities) {
        entities.forEach(entity -> repository.put(entity.id(), entity));
    }

    @Override
    public List<EntityType> findAll() {
        return repository.values().stream().toList();
    }

    @Override
    public Optional<EntityType> findById(IdType id) {
        return Optional.ofNullable(repository.get(id));
    }

    @Override
    public ListingData<EntityType> search(String searchText, Pageable pageable) {
        if (searchText == null) {
            searchText = "";
        }
        var cleanSearchText = searchText.toLowerCase();
        var found = repository.values().stream()
                .filter(value -> value != null &&
                        ("".equals(cleanSearchText) ||
                                name(value).toLowerCase().contains(cleanSearchText)))
                .toList();
        return new ListingData<>(new Page<>(
                searchText,
                pageable.size(),
                pageable.page(),
                found.size(),
                found.stream()
                        .skip((long) pageable.page() * pageable.size())
                        .limit(pageable.size())
                        .toList()));
    }

    @Override
    public void deleteAllById(List<IdType> selectedIds) {
        selectedIds.forEach(repository::remove);
    }

    private String name(EntityType value) {
        var nameField = getFieldByName(value.getClass(), "name");
        if (nameField != null) {
            return (String) getValue(nameField, value);
        }
        return value.toString();
    }

    @Override
    public ListingData<EntityType> search(String searchText, ParentIdType parentId, Pageable pageable) {
        var found = search(searchText, new Pageable(0, Integer.MAX_VALUE, pageable.sort())).page().content()
                .stream()
                .filter(entity -> parentId == null || belongsToParent(entity, parentId))
                .toList();
        return new ListingData<>(new Page<>(
                searchText,
                pageable.size(),
                pageable.page(),
                found.size(),
                found.stream()
                        .skip((long) pageable.page() * pageable.size())
                        .limit(pageable.size())
                        .toList()));
    }

    public abstract boolean belongsToParent(EntityType entity, ParentIdType parentId);

}
