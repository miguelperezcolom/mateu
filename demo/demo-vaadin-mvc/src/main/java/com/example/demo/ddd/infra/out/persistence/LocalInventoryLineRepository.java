package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory.InventoryLine;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory.InventoryLineRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalInventoryLineRepository extends LocalRepository<InventoryLine, String> implements InventoryLineRepository {
}
