package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import io.mateu.core.infra.declarative.Entity;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LocalInventoryRepository extends CompositionLocalRepository<Inventory, String, String> implements InventoryRepository {


    @Override
    public boolean belongsToParent(Inventory entity, String parentId) {
        return parentId.equals(entity.hotelId());
    }
}
