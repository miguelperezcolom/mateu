package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents.passwordResets;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service@Scope("prototype")@Setter@Getter@Slf4j
public class PasswordResetsCrud implements Crud<SalesAgentsSearchForm, PasswordResetsRow> {

    String salesAgentId;

    public PasswordResetsCrud() {
    }

    @Override
    public List<PasswordResetsRow> fetchRows(SalesAgentsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return getFilteredList();
    }

    private List<PasswordResetsRow> getFilteredList() {
        log.info("sales agent id: " + salesAgentId);
        return List.of(
                        new PasswordResetsRow("1", "1", "2023-01-12")
                        , new PasswordResetsRow("2", "2", "2023-02-11")
                ).stream().filter(r -> r.getId().equals(salesAgentId))
                .collect(Collectors.toList());
    }

    @Override
    public int fetchCount(SalesAgentsSearchForm filters) throws Throwable {
        return getFilteredList().size();
    }

}
