package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import io.mateu.uidl.interfaces.Repository;
import io.mateu.core.infra.declarative.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Inventories extends GenericCrud<Inventory> {

    final InventoryRepository inventoryRepository;


    @Override
    public Repository<Inventory, String> repository() {
        return inventoryRepository;
    }
}
