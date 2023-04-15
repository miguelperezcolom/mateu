package com.example.demoremote.ui.manual;

import io.mateu.mdd.shared.interfaces.SortCriteria;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SimpleCrudService {

    public List<Row> fetchRows(SearchForm filters, List<SortCriteria> sortOrders,
                               int offset, int limit) throws Throwable {
        return List.of(
                new Row(UUID.randomUUID().toString(), "Mateu", 14)
                , new Row(UUID.randomUUID().toString(), "Antonia", 47)
        );
    }

    public int fetchCount(SearchForm filters) throws Throwable {
        return 2;
    }
}
