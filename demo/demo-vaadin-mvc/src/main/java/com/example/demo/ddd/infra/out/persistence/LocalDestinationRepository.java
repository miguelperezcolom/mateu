package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.world.Destination;
import com.example.demo.ddd.domain.hotel.world.DestinationRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalDestinationRepository extends LocalRepository<Destination, String> implements DestinationRepository {
}
