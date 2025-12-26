package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.hotel.Inventory;
import com.example.demo.ddd.domain.hotel.hotel.InventoryRepository;
import com.example.demo.ddd.domain.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericListingBackend;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class Inventories extends GenericListingBackend<Inventory> {

    final InventoryRepository inventoryRepository;


    @Override
    public Repository<Inventory, String> repository() {
        return inventoryRepository;
    }
}
