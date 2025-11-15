package com.example.demo.ddd.pages;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.annotations.Button;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectEditor {

    final BeanProvider beanProvider;

    String name;

    @Button
    Object save() {
        return beanProvider.getBean(ProjectDetail.class);
    }

}
