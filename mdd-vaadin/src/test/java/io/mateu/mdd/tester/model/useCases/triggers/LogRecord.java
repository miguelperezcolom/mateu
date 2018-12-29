package io.mateu.mdd.tester.model.useCases.triggers;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity@Getter@Setter
public class LogRecord {

    @Id@GeneratedValue
    private long id;

    @Column(name = "_when")
    private LocalDateTime when = LocalDateTime.now();

    @NotNull
    private String text;

}
