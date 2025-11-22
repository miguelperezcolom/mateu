package com.example.demo.ddd.pages;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.VerticalLayout;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectDetail {

    final BeanProvider beanProvider;
    final ProjectEditor editor;
    final ProjectInfo info;
    final ProjectApp app;

    @Toolbar
    Object list() {
        return beanProvider.getBean(Projects.class);
    }

    @Toolbar
    Object edit() {
        return editor;
    }

    @Label("")
    VerticalLayout content;

    public Object load(String id) {
        content = VerticalLayout.of(
                info.load(id),
                app.load(id)
        );
        return this;
    }
}
