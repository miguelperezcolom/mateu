package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URL;
import java.net.URLClassLoader;
import org.junit.jupiter.api.Test;

/**
 * Application classes are loaded from the thread context classloader first. Spring Boot devtools
 * runs the app from a child RestartClassLoader while the parent can load a second copy of the same
 * classes: Mateu resolved the parent's copy, which no bean is an instance of, so the view's
 * {@code @Autowired} fields stayed null and its {@code @Lookup} suppliers could not be
 * instantiated.
 */
class ClassLoadersTest {

  @Test
  void prefersTheContextClassloadersCopyOfAnApplicationClass() throws Exception {
    var classes = ClassLoadersTestView.class.getProtectionDomain().getCodeSource().getLocation();
    try (var restart =
        new ChildFirst(new URL[] {classes}, ClassLoadersTestView.class.getClassLoader())) {
      var restarted = restart.loadClass(ClassLoadersTestView.class.getName());
      assertThat(restarted).isNotSameAs(ClassLoadersTestView.class);

      var thread = Thread.currentThread();
      var previous = thread.getContextClassLoader();
      thread.setContextClassLoader(restart);
      try {
        assertThat(ClassLoaders.forName(ClassLoadersTestView.class.getName())).isSameAs(restarted);
      } finally {
        thread.setContextClassLoader(previous);
      }
    }
  }

  @Test
  void fallsBackToItsOwnLoaderAndNamesAMissingClass() {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(new URLClassLoader(new URL[0], null));
    try {
      assertThat(ClassLoaders.forName(ClassLoadersTestView.class.getName()))
          .isSameAs(ClassLoadersTestView.class);
      assertThatThrownBy(() -> ClassLoaders.forName("com.example.NoSuchView"))
          .isInstanceOf(IllegalStateException.class)
          .hasMessageContaining("com.example.NoSuchView");
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  /** Like devtools' RestartClassLoader: the app's own classes first, the rest from the parent. */
  private static final class ChildFirst extends URLClassLoader {
    ChildFirst(URL[] urls, ClassLoader parent) {
      super(urls, parent);
    }

    @Override
    protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
      synchronized (getClassLoadingLock(name)) {
        if (name.equals(ClassLoadersTestView.class.getName())) {
          var loaded = findLoadedClass(name);
          return loaded != null ? loaded : findClass(name);
        }
        return super.loadClass(name, resolve);
      }
    }
  }
}
