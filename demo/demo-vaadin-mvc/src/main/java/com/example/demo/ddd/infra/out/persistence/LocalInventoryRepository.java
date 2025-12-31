package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalInventoryRepository extends LocalRepository<Inventory, String> implements InventoryRepository {
}
