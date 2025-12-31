package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Tariffs extends GenericCrud<Tariff> {

    final TariffRepository tariffRepository;


    @Override
    public Repository<Tariff, String> repository() {
        return tariffRepository;
    }
}
