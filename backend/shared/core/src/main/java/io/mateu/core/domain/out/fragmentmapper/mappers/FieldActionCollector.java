package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.dtos.ActionDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Toolbar;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

final class FieldActionCollector {

  static List<ActionDto> collect(Object serverSideObject) {
    List<ActionDto> fieldActions = new ArrayList<>();

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            field ->
                ActionDtoMapper.mapToAction(
                        field.getAnnotation(io.mateu.uidl.annotations.Action.class))
                    .withId(field.getName()))
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            method ->
                ActionDtoMapper.mapToAction(
                        method.getAnnotation(io.mateu.uidl.annotations.Action.class))
                    .withId(method.getName()))
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> List.class.isAssignableFrom(field.getType()))
        .map(Field::getName)
        .map(
            fieldName ->
                Stream.of(
                        "_create",
                        "_create-and-stay",
                        "_add",
                        "_select",
                        "_selected",
                        "_prev",
                        "_next",
                        "_save",
                        "_remove",
                        "_move-up",
                        "_move-down",
                        "_cancel")
                    .map(action -> fieldName + action)
                    .toList())
        .flatMap(List::stream)
        .map(actionId -> ActionDto.builder().id(actionId).build())
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Lookup.class))
        .filter(field -> !field.getAnnotation(Lookup.class).bubble())
        .map(field -> ActionDto.builder().id("search-" + field.getName()).build())
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(
            field ->
                !field.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)
                    && (field.isAnnotationPresent(Button.class)
                        || field.isAnnotationPresent(Toolbar.class)))
        .map(field -> ActionDto.builder().id(field.getName()).validationRequired(true).build())
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(
            method ->
                !method.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)
                    && (method.isAnnotationPresent(Button.class)
                        || method.isAnnotationPresent(Toolbar.class)))
        .map(method -> ActionDto.builder().id(method.getName()).validationRequired(true).build())
        .forEach(fieldActions::add);

    return fieldActions;
  }

  private FieldActionCollector() {}
}
