package io.mateu.maven.bundle;

/** Sets a mojo's {@code @Parameter} field, as Maven does from the pom (inherited ones too). */
final class Mojos {

  static void set(Object mojo, String name, Object value) throws Exception {
    for (Class<?> type = mojo.getClass(); type != null; type = type.getSuperclass()) {
      try {
        var field = type.getDeclaredField(name);
        field.setAccessible(true);
        field.set(mojo, value);
        return;
      } catch (NoSuchFieldException e) {
        // declared further up
      }
    }
    throw new NoSuchFieldException(name);
  }

  private Mojos() {}
}
