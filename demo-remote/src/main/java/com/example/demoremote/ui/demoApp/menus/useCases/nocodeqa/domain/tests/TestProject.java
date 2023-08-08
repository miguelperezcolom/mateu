package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.Section;
import io.mateu.mdd.shared.annotations.TextArea;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter@Setter
public class TestProject {

    @Section("General")
    @Id
    String id = UUID.randomUUID().toString();

    String name;

    @io.mateu.mdd.shared.annotations.Status
    Status status;

    @TextArea
    String comments;

    @Section("Github")
    String githubRepository;

    String githubApiKey;



}
