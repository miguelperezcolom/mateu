package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.codes.BoardTypeCode;
import com.example.demo.ddd.domain.hotel.codes.BoardTypeCodeRepository;
import com.example.demo.ddd.domain.hotel.codes.Season;
import com.example.demo.ddd.domain.hotel.codes.SeasonRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalSeasonRepository extends LocalRepository<Season, String> implements SeasonRepository {
}
