package com.example.demo.ddd.infra.in.ui.pages.project;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.annotations.Button;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ProjectEditor {

    final BeanProvider beanProvider;

    String name;

    ProjectType type;

    Framework framework;

    int version;

    LocalDate expectedDelivery;

    boolean hlaReady;

    @Button
    Object save() {
        return beanProvider.getBean(ProjectDetail.class);
    }

}
