package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import io.mateu.uidl.interfaces.Repository;
import io.mateu.core.infra.declarative.GenericCrud;
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
