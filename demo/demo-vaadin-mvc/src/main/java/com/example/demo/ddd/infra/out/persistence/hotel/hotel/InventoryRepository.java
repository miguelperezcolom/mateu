package com.example.demo.ddd.infra.out.persistence.hotel.hotel;


import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.Repository;

public interface InventoryRepository extends CompositionRepository<Inventory, String, String> {
}
