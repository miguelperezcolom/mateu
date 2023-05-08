package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.data.ValuesListProvider;

import java.util.List;

public class QuestionsProvider implements ValuesListProvider {
    @Override
    public List<Object> getAll() {
        return List.of(
                new ExternalReference("1", "AVAD score")
                , new ExternalReference("2", "The intermediary has...")
                , new ExternalReference("3", "The intermediary has...")
        );
    }
}
