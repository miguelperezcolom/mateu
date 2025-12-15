package com.example.demo.ddd.infra.in.ui.pages.project;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.annotations.Button;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectCreationForm {

    final BeanProvider beanProvider;

    String name;

    @Button
    Object save() {
        return beanProvider.getBean(Projects.class);
    }

}
