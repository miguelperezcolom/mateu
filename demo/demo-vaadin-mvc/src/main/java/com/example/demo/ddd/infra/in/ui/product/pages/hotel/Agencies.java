package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.Agency;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyRepository;
import io.mateu.uidl.interfaces.Repository;
import io.mateu.core.infra.declarative.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Agencies extends GenericCrud<Agency> {

    final AgencyRepository agencyRepository;


    @Override
    public Repository<Agency, String> repository() {
        return agencyRepository;
    }
}
