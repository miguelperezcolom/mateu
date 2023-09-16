package io.mateu.mdd.shared.interfaces;

import io.mateu.mdd.shared.data.ComplexKey;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class ComplexKeyOption {

  private ComplexKey key;

  private Object value;

  public ComplexKey getKey() {
    return key;
  }

  public void setKey(ComplexKey key) {
    this.key = key;
  }

  public Object getValue() {
    return value;
  }

  public void setValue(Object value) {
    this.value = value;
  }
}
