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
public class Resources extends AutoCrud<Resource> {

    private String processId;

    public Resources withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoCrudAdapter<Resource> adapter;

    @Override
    public AutoCrudAdapter<Resource> simpleAdapter() {
        return adapter;
    }
}
