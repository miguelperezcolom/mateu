package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.Season;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalSeasonRepository extends LocalRepository<Season, String> implements SeasonRepository {
}
