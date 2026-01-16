package com.example.demo.ddd.infra.out.persistence.hotel.world;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryIdOptionsSupplier implements ForeignKeyOptionsSupplier {

    final InventoryRepository inventoryRepository;

    @Override
    public ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest) {
        var found = inventoryRepository.search(searchText , pageable);
        return new ListingData<>(new Page<>(
                searchText,
                found.page().pageSize(),
                found.page().pageNumber(),
                found.page().totalElements(),
                found.page().content().stream().map(hotel ->
                        new Option(hotel.id(), hotel.name())).toList()));
    }
}
