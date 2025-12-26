package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.hotel.Tariff;
import com.example.demo.ddd.domain.hotel.hotel.TariffRepository;
import com.example.demo.ddd.domain.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericListingBackend;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class Tariffs extends GenericListingBackend<Tariff> {

    final TariffRepository tariffRepository;


    @Override
    public Repository<Tariff, String> repository() {
        return tariffRepository;
    }
}
