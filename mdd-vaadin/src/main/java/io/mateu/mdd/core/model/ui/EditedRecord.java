package io.mateu.mdd.core.model.ui;

import lombok.Getter;
import lombok.Setter;
import io.mateu.mdd.core.model.authentication.User;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class EditedRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String icon;

    @ManyToOne
    private User user;

    private String name;

    @Column(name = "_when")
    private LocalDateTime when = LocalDateTime.now();

    private String uri;

}
