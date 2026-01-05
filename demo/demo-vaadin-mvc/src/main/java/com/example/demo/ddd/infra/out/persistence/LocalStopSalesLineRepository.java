package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.StopSalesLineRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLine;
import org.springframework.stereotype.Service;

@Service
public class LocalStopSalesLineRepository extends CompositionLocalRepository<StopSalesLine, String, String> implements StopSalesLineRepository {
    @Override
    public boolean belongsToParent(StopSalesLine entity, String parentId) {
        return parentId.equals(entity.hotelId());
    }
}
