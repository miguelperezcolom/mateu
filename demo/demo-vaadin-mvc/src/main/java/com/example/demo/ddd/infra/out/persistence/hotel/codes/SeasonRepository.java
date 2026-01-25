package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import io.mateu.uidl.interfaces.Repository;

public interface SeasonRepository extends Repository<Season, String> {
    void reset();
}
