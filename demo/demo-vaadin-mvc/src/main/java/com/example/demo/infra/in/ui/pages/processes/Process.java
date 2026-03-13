package com.example.demo.infra.in.ui.pages.processes;


import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.Named;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.concurrent.Callable;

@NoArgsConstructor
@Getter
public class Process implements Named {

    String id;

    String name;

    @Tab
    Callable<?> steps = () -> MateuBeanProvider.getBean(Steps.class).withProcessId(id);

    @Tab
    Callable<?> messages = () -> MateuBeanProvider.getBean(Messages.class).withProcessId(id);

    @Tab
    Callable<?> errors = () -> MateuBeanProvider.getBean(Errors.class).withProcessId(id);


    public Process(String id, String name) {
        this.id = id;
        this.name = name;
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
