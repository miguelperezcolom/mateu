package io.mateu.core.domain.out.fragmentmapper.mappers;

import java.io.DataInputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * The string literals of a view's own code — the constant pools of its class, the classes declared
 * inside it (inner, local and anonymous classes; lambdas live in the class itself) and its
 * application superclasses. An action id written in that code ({@code
 * confirmActionId("doArchive")}, {@code new Button("Go").actionId("go")}) is a declaration by the
 * developer, which is what strict action mode asks of an unmarked method; an id nobody wrote
 * anywhere in the view is not. Read once per class.
 */
final class ClassLiterals {

  private static final ClassValue<Set<String>> CACHE =
      new ClassValue<>() {
        @Override
        protected Set<String> computeValue(Class<?> type) {
          var literals = new HashSet<String>();
          for (Class<?> c = type; c != null && !isPlatformOrMateu(c); c = c.getSuperclass()) {
            Class<?>[] nest;
            try {
              nest = c.getNestHost().getNestMembers();
            } catch (RuntimeException | LinkageError e) {
              nest = new Class<?>[] {c};
            }
            for (var member : nest) {
              // the class and the classes declared inside it — not its nestmates' siblings (a
              // fixture nested in a test class shares the test class's nest)
              if (member == c || member.getName().startsWith(c.getName() + "$")) {
                read(member, literals);
              }
            }
          }
          return Collections.unmodifiableSet(literals);
        }
      };

  private ClassLiterals() {}

  static Set<String> of(Class<?> type) {
    return type == null ? Set.of() : CACHE.get(type);
  }

  private static boolean isPlatformOrMateu(Class<?> c) {
    var name = c.getName();
    return c == Object.class
        || name.startsWith("java.")
        || name.startsWith("javax.")
        || name.startsWith("jakarta.")
        || name.startsWith("kotlin.")
        || io.mateu.core.application.security.WireTypes.isFramework(c);
  }

  /** The CONSTANT_String entries of one class file (silently nothing when it cannot be read). */
  private static void read(Class<?> type, Set<String> into) {
    var resource = type.getName().replace('.', '/') + ".class";
    var loader = type.getClassLoader();
    try (var raw =
        loader != null
            ? loader.getResourceAsStream(resource)
            : ClassLoader.getSystemResourceAsStream(resource)) {
      if (raw == null) {
        return;
      }
      var in = new DataInputStream(new java.io.BufferedInputStream(raw));
      if (in.readInt() != 0xCAFEBABE) {
        return;
      }
      in.readUnsignedShort(); // minor
      in.readUnsignedShort(); // major
      int count = in.readUnsignedShort();
      var utf8 = new String[count];
      var strings = new int[count];
      int stringCount = 0;
      for (int i = 1; i < count; i++) {
        int tag = in.readUnsignedByte();
        switch (tag) {
          case 1 -> utf8[i] = in.readUTF();
          case 3, 4 -> in.readInt();
          case 5, 6 -> {
            in.readLong();
            i++; // a long/double takes two slots
          }
          case 7, 16, 19, 20 -> in.readUnsignedShort();
          case 8 -> strings[stringCount++] = in.readUnsignedShort();
          case 9, 10, 11, 12, 17, 18 -> in.readInt();
          case 15 -> {
            in.readUnsignedByte();
            in.readUnsignedShort();
          }
          default -> {
            return; // an unknown tag: stop rather than misread the pool
          }
        }
      }
      for (int i = 0; i < stringCount; i++) {
        var value = utf8[strings[i]];
        if (value != null && !value.isEmpty() && value.length() <= 200) {
          into.add(value);
        }
      }
    } catch (IOException | RuntimeException e) {
      // unreadable class file: no literals
    }
  }
}
