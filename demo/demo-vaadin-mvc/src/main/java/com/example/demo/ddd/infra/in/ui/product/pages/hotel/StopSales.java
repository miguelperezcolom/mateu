package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory.InventoryLine;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory.InventoryLineRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLine;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLineRepository;
import io.mateu.core.infra.declarative.GenericCrud;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StopSales extends GenericCrud<StopSalesLine> {

    final StopSalesLineRepository stopSalesLineRepository;


    @Override
    public Repository<StopSalesLine, String> repository() {
        return stopSalesLineRepository;
    }
}
