package com.example.demo.ddd.infra.out.persistence.hotel.hotel;


import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLine;
import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.Repository;

public interface StopSalesLineRepository extends CompositionRepository<StopSalesLine, String, String> {
}
