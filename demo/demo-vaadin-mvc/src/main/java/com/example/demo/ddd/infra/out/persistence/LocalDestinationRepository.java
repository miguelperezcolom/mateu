package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.world.Destination;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalDestinationRepository extends LocalRepository<Destination, String> implements DestinationRepository {
}
