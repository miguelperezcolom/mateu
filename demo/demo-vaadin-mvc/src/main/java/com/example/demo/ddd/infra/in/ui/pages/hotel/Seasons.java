package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.Season;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Seasons extends GenericCrud<Season> {

    final SeasonRepository seasonRepository;


    @Override
    public Repository<Season, String> repository() {
        return seasonRepository;
    }
}
