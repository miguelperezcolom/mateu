package io.mateu.remote.infra.jpa;

import io.mateu.core.domain.model.store.JourneyContainer;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "__MATEU_JOURNEY")
public class JourneyContainerEntity {

  @Id private String journeyId;

  @Convert(converter = JsonConverter.class)
  @Column(columnDefinition = "CLOB")
  private JourneyContainer journeyContainer;

  private LocalDateTime lastUsed;
}
