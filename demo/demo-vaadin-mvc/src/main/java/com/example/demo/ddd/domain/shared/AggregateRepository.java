package com.example.demo.ddd.domain.shared;

import java.util.List;

public interface AggregateRepository<AggregateType, IdType> {

    AggregateType findById(IdType id);

    AggregateType save(AggregateType aggregateRoot);

    AggregateType delete(AggregateType aggregateRoot);

    List<AggregateType> findAll();


}
