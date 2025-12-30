package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.shared.Repository;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public class LocalRepository<EntityType extends Entity<IdType>, IdType> implements Repository<EntityType, IdType> {

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
                                value.toString().toLowerCase().contains(cleanSearchText)))
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
}
