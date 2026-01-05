package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.booking.File;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Datasheet;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.DatasheetRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalDatasheetRepository extends CompositionLocalRepository<Datasheet, String, String> implements DatasheetRepository {
    @Override
    public boolean belongsToParent(Datasheet entity, String parentId) {
        return parentId.equals(entity.id());
    }
}
