package io.mateu.showcase.tester.model.useCases.triggers;

import lombok.MateuMDDEntity;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@MateuMDDEntity
public class LogRecord {

    @Id@GeneratedValue
    private long id;

    @Column(name = "_when")
    private LocalDateTime when = LocalDateTime.now();

    @NotNull
    private String text;

}
