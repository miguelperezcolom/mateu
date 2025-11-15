package com.example.demo.ddd.pages;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Toolbar;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectDetail {

    final BeanProvider beanProvider;
    final ProjectEditor editor;

    @Toolbar
    Object list() {
        return beanProvider.getBean(Projects.class);
    }

    @Toolbar
    Object edit() {
        return editor;
    }

    String name;

    public Object load(String id) {
        return this;
    }
}
