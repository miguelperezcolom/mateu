package com.example.demoremote.ui.demoApp.menus.errors.rpcTimeouts;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Scope("prototype")
public class BrokenCrud implements Crud<BrokenSearchForm, BrokenRow> {

    @Autowired@JsonIgnore
    BrokenDetail detail;

    @Autowired@JsonIgnore
    BrokenRepo repo;

    public BrokenCrud() {
    }

    @Override
    public List<BrokenRow> fetchRows(BrokenSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return repo.findAll();
    }

    @Override
    public int fetchCount(BrokenSearchForm filters) throws Throwable {
        return repo.findAll().size();
    }

    @Override
    public Object getDetail(BrokenRow intermediariesRow) throws Throwable {
        detail.load(intermediariesRow.getId());
        return detail;
    }

    public void block(BrokenRow row) {
        System.out.println("blocking row " + row);
    }

    public void activate(BrokenRow row) {
        System.out.println("activating row " + row);
    }

}
