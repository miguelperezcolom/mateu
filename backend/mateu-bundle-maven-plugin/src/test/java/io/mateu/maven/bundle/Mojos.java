package io.mateu.maven.bundle;

/** Sets a mojo's {@code @Parameter} field, as Maven does from the pom. */
final class Mojos {

  static void set(Object mojo, String name, Object value) throws Exception {
    var field = mojo.getClass().getDeclaredField(name);
    field.setAccessible(true);
    field.set(mojo, value);
  }

  private Mojos() {}
}
