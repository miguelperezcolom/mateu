package com.example.demo.ddd.infra.in.ui.project.pages.project;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.Form;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ReadOnly
public class ProjectInfo implements Form {

    String name;

    public Object load(String id) {
        return this;
    }
}
