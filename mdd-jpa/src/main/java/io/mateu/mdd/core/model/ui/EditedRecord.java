package io.mateu.mdd.core.model.ui;

import io.mateu.mdd.core.model.authentication.User;
import lombok.MateuMDDEntity;

import javax.persistence.Column;
import javax.persistence.ManyToOne;
import java.time.LocalDateTime;

@MateuMDDEntity
public class EditedRecord {

    private String icon;

    @ManyToOne
    private User user;

    private String name;

    @Column(name = "_when")
    private LocalDateTime when = LocalDateTime.now();

    private String uri;

}
