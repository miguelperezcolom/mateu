package com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory;


import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.Repository;

public interface InventoryLineRepository extends Repository<InventoryLine, String> {
}
