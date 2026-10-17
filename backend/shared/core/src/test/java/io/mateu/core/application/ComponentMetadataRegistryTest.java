package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import io.mateu.dtos.ComponentMetadataDto;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;
import org.junit.jupiter.api.Test;

/**
 * Every wire type registered as a component ({@code ComponentMetadataDto}'s subtypes and schema) IS
 * a component metadata: a record that is not — {@code BreadcrumbDto}, an item of {@code
 * BreadcrumbsDto} — advertised a "Breadcrumb" component type the servers never send and that
 * nothing can deserialise as a component.
 */
class ComponentMetadataRegistryTest {

  @Test
  void everyRegisteredSubtypeIsAComponentMetadata() {
    var notComponents =
        Arrays.stream(ComponentMetadataDto.class.getAnnotation(JsonSubTypes.class).value())
            .map(JsonSubTypes.Type::value)
            .filter(type -> !ComponentMetadataDto.class.isAssignableFrom(type))
            .map(Class::getSimpleName)
            .toList();
    assertThat(notComponents).isEmpty();
  }

  @Test
  void everySchemaAlternativeIsAComponentMetadata() {
    var notComponents =
        Arrays.stream(ComponentMetadataDto.class.getAnnotation(Schema.class).oneOf())
            .filter(type -> !ComponentMetadataDto.class.isAssignableFrom(type))
            .map(Class::getSimpleName)
            .toList();
    assertThat(notComponents).isEmpty();
  }
}
