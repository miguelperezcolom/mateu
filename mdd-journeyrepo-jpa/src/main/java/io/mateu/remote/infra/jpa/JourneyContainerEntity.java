package io.mateu.remote.infra.jpa;

import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.util.servlet.common.JsonConverter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter@Setter@AllArgsConstructor@NoArgsConstructor
@Table(name = "__MATEU_JOURNEY")
public class JourneyContainerEntity {

    @Id
    private String journeyId;

    @Convert(converter = JsonConverter.class)
    @Column(columnDefinition = "CLOB")
    private JourneyContainer journeyContainer;

    private LocalDateTime lastUsed;

}