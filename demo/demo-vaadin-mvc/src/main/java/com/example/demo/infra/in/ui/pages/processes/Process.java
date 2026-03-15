package com.example.demo.infra.in.ui.pages.processes;


import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.Named;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.concurrent.Callable;

@NoArgsConstructor
@Getter
@ReadOnly
public class Process implements Named {

    String id;

    String name;

    Status status;

    @Tab
            @Label("")
    Callable<?> steps = () -> MateuBeanProvider.getBean(Steps.class).withProcessId(id);

    @Tab
    @Label("")
    Callable<?> messages = () -> MateuBeanProvider.getBean(Messages.class).withProcessId(id);

    @Tab
    @Label("")
    Callable<?> errors = () -> MateuBeanProvider.getBean(Errors.class).withProcessId(id);

    @Tab
    @Label("")
    Callable<?> resources = () -> MateuBeanProvider.getBean(Resources.class).withProcessId(id);

    public Process(String id, String name, Status status) {
        this.id = id;
        this.name = name;
        this.status = status;
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public String id() {
        return id;
    }
}
