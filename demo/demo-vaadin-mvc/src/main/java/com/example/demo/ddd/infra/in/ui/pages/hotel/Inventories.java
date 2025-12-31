package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
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
