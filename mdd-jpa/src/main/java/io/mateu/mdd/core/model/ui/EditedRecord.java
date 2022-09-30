package io.mateu.mdd.core.model.ui;

import io.mateu.mdd.core.model.authentication.User;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class EditedRecord {

    @Id
    @GeneratedValue
    private long id;

    private String icon;

    @ManyToOne
    private User user;

    private String name;

    @Column(name = "_when")
    private LocalDateTime when = LocalDateTime.now();

    private String uri;

}
