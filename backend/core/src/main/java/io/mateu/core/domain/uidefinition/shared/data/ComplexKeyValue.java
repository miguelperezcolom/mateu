package io.mateu.core.domain.uidefinition.shared.data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ComplexKeyValue {

  private ComplexKey key;

  private Object value;
}
