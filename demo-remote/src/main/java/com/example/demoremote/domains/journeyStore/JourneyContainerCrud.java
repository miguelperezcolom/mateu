package com.example.demoremote.domains.journeyStore;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JourneyContainerCrud implements Crud<JourneyContainerSearchForm, JourneyContainer> {

    @Autowired
    private JourneyRepository repo;

    @Override
    public List<JourneyContainer> fetchRows(JourneyContainerSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return repo.findAll();
    }

    @Override
    public int fetchCount(JourneyContainerSearchForm filters) throws Throwable {
        return (int) repo.count();
    }
}