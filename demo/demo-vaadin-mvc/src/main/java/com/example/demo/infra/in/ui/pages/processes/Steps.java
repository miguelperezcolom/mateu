package com.example.demo.infra.in.ui.pages.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ReadOnly
@Style("width: 100%;")
public class Steps extends AutoCrud<Step> {

    private String processId;

    public Steps withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoCrudAdapter<Step> adapter;

    @Override
    public AutoCrudAdapter<Step> simpleAdapter() {
        return adapter;
    }
}
