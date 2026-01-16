package com.example.demo.ddd.infra.out.persistence.hotel.world;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Hotel;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryLabelSupplier implements LabelSupplier {

    final InventoryRepository inventoryRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return inventoryRepository.findById((String) id)
                .map(Inventory::name)
                .orElse("No inventory with id " + id);
    }
}
