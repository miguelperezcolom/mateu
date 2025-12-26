package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.hotel.Inventory;
import com.example.demo.ddd.domain.hotel.hotel.InventoryRepository;
import com.example.demo.ddd.domain.hotel.hotel.Tariff;
import com.example.demo.ddd.domain.hotel.hotel.TariffRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalInventoryRepository extends LocalRepository<Inventory, String> implements InventoryRepository {
}
