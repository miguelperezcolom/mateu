package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.domain.hotel.agency.AgencyRepository;
import org.junit.jupiter.api.AutoClose;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PopulatorTest {

    @Autowired
    Populator populator;
    @Autowired
    AgencyRepository agencyRepository;

    @Test
    void works() {

        //populator.populate();

        assertFalse(agencyRepository.findAll().isEmpty());

    }

}