package io.mateu.core.domain.model.reflection;

import java.lang.reflect.Executable;
import java.lang.reflect.Field;
import java.lang.reflect.Parameter;

import io.mateu.core.domain.model.reflection.usecases.ValueProvider;
import io.mateu.core.domain.model.reflection.usecases.ValueWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FieldInterfacedFactory {

  public FieldInterfacedFromField getFieldInterfacedFromField(
          Field f) {
    return new FieldInterfacedFromField(f);
  }

  public FieldInterfacedFromParameter getFieldInterfacedFromParameter(
      Executable m, Parameter f) {
    return new FieldInterfacedFromParameter(m, f);
  }
}
