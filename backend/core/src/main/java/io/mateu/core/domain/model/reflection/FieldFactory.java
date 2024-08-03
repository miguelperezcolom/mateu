package io.mateu.core.domain.model.reflection;

import java.lang.reflect.Executable;
import java.lang.reflect.Field;
import java.lang.reflect.Parameter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FieldFactory {

  public FieldFromReflectionField getFieldInterfacedFromField(
          Field f) {
    return new FieldFromReflectionField(f);
  }

  public FieldFromParameter getFieldInterfacedFromParameter(
      Executable m, Parameter f) {
    return new FieldFromParameter(m, f);
  }
}
