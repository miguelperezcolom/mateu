package io.mateu.core.domain.store;

import jakarta.persistence.Id;
import java.io.Serializable;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class MenuToBeanMapping implements Serializable {

  @Id private String actionId;

  private Object bean;
}
