package com.example.parity;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.application.runaction.ActionRegistry;
import io.mateu.core.application.runaction.FieldTypeRegistry;
import io.mateu.core.application.runaction.RestSourceRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.application.runaction.YamlUidlLoader;
import io.micronaut.context.ApplicationContext;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

/**
 * Micronaut only knows the core beans of the packages {@code MateuMicronautConfig} imports: a core
 * package with beans that is missing there boots fine and then fails the first YAML-backed request
 * ("No bean of type TranslationRegistry" — the starter smoke test timed out on it). Resolving the
 * YAML loaders and the catalogues they depend on catches it at test time.
 */
@MicronautTest
class MateuBeanGraphTest {

  @Inject ApplicationContext context;

  @Test
  void theYamlLoadersAndTheCataloguesTheyNeedAreBeans() {
    for (var type :
        new Class<?>[] {
          YamlUidlLoader.class,
          YamlAppLoader.class,
          TranslationRegistry.class,
          ActionRegistry.class,
          FieldTypeRegistry.class,
          RestSourceRegistry.class
        }) {
      assertNotNull(context.getBean(type), type.getName());
    }
  }
}
