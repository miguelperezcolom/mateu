package io.mateu.reflection;

import io.mateu.mdd.shared.reflection.FieldInterfaced;
import java.lang.annotation.Annotation;
import java.lang.reflect.Executable;
import java.lang.reflect.Field;
import java.lang.reflect.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FieldInterfacedFactory {

  public FieldInterfacedForCheckboxColumn getFieldInterfacedForCheckboxColumn(
      String name,
      FieldInterfaced collectionField,
      Object value,
      ReflectionHelper reflectionHelper) {
    return new FieldInterfacedForCheckboxColumn(name, collectionField, value, reflectionHelper);
  }

  public FieldInterfacedFromPath getFieldInterfacedFromPath(
      Class sourceType, String path, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromPath(sourceType, path, reflectionHelper);
  }

  public FieldInterfacedFromPath getFieldInterfacedFromPath(
      Class type, String path, Annotation a, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromPath(type, path, a, reflectionHelper);
  }

  public FieldInterfacedFromField getFieldInterfacedFromField(
      FieldInterfaced f, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromField(f, reflectionHelper);
  }

  public FieldInterfacedFromField getFieldInterfacedFromField(
      Field f, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromField(f, reflectionHelper);
  }

  public FieldInterfacedFromParameter getFieldInterfacedFromParameter(
      FieldInterfacedFromParameter f, Annotation a, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromParameter(f, a, reflectionHelper);
  }

  public FieldInterfacedFromParameter getFieldInterfacedFromParameter(
      FieldInterfacedFromParameter f, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromParameter(f, reflectionHelper);
  }

  public FieldInterfacedFromParameter getFieldInterfacedFromParameter(
      Executable m, Parameter f, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromParameter(m, f, reflectionHelper);
  }

  public FieldInterfacedFromRemoteField getFieldInterfacedFromRemoteField(
      io.mateu.remote.dtos.Field f, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromRemoteField(f, reflectionHelper);
  }

  public FieldInterfacedFromType getFieldInterfacedFromType(
      Class type, String name, ReflectionHelper reflectionHelper) {
    return new FieldInterfacedFromType(type, name, reflectionHelper);
  }
}
