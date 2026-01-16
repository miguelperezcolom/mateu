package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory.InventoryLine;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory.InventoryLineRepository;
import io.mateu.core.infra.declarative.GenericCrud;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryLines extends GenericCrud<InventoryLine> {

    final InventoryLineRepository inventoryLineRepository;


    @Override
    public Repository<InventoryLine, String> repository() {
        return inventoryLineRepository;
    }
}
