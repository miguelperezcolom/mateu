package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.Agency;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalAgencyRepository extends LocalRepository<Agency, String> implements AgencyRepository {
}
