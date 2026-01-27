package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Offer;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.OfferRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import io.mateu.core.infra.declarative.GenericCrud;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Offers extends GenericCrud<Offer> {

    final OfferRepository offerRepository;


    @Override
    public Repository<Offer, String> repository() {
        return offerRepository;
    }
}
