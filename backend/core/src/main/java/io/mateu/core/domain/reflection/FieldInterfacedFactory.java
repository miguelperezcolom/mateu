package io.mateu.core.domain.reflection;

import java.lang.reflect.Executable;
import java.lang.reflect.Field;
import java.lang.reflect.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FieldInterfacedFactory {

  public FieldInterfacedFromField getFieldInterfacedFromField(
      Field f, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromField(f, reflectionHelper);
  }

  public FieldInterfacedFromParameter getFieldInterfacedFromParameter(
      Executable m, Parameter f, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromParameter(m, f, reflectionHelper);
  }
}
