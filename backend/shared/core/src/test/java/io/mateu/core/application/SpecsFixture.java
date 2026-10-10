package io.mateu.core.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;
import java.util.function.Supplier;

/**
 * Runs a body with {@code specs/ui/**} served ONLY from a test-resources fixture directory (like
 * {@link MountHomeSyncTest}), so a suite can author its own routes/types/sources without leaking
 * into — or being disturbed by — the shared test {@code specs/ui}.
 */
final class SpecsFixture {

  static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  private SpecsFixture() {}

  static final class Overlay extends ClassLoader {
    private final URLClassLoader specs;

    Overlay(String fixtureDir, ClassLoader parent) {
      super(parent);
      URL root = SpecsFixture.class.getResource("/" + fixtureDir + "/");
      this.specs = new URLClassLoader(new URL[] {root}, null);
    }

    private static boolean isSpec(String name) {
      return name.startsWith("specs/ui") || name.startsWith("/specs/ui");
    }

    @Override
    public URL getResource(String name) {
      return isSpec(name) ? specs.getResource(name) : super.getResource(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      return isSpec(name) ? specs.getResources(name) : super.getResources(name);
    }
  }

  static <T> T over(String fixtureDir, Supplier<T> body) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(new Overlay(fixtureDir, SpecsFixture.class.getClassLoader()));
    try {
      return body.get();
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  static JsonNode wire(Object increment) {
    return JSON.valueToTree(increment);
  }
}
