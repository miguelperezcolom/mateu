package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.HeroSection;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import java.util.Collection;

/**
 * What a composed tree already shows of its page header — the server-side twin of the web's {@code
 * composedHeading.ts} rule, so a page wrapped around a tree is titled only when nothing in the tree
 * names it (a hero, an entity header, a {@code *title} Text such as the one a {@code
 * DataManagement} or a {@code GanttPage} draws).
 */
final class SelfNamingTree {

  private static final int MAX_DEPTH = 6;

  private SelfNamingTree() {}

  /** Whether something in the tree names the page. */
  static boolean namesItself(Component tree) {
    return names(tree, 0);
  }

  /** Whether the tree opens with a hero (a {@code Welcome}, a {@code HeroSearch}). */
  static boolean opensWithHero(Component tree) {
    var node = tree;
    for (int depth = 0; node != null && depth < MAX_DEPTH; depth++) {
      if (node instanceof HeroSection) {
        return true;
      }
      var children = childrenOf(node);
      node = children.isEmpty() ? null : children.iterator().next();
    }
    return false;
  }

  private static boolean names(Component node, int depth) {
    if (node == null || depth > MAX_DEPTH) {
      return false;
    }
    if (node instanceof HeroSection || node instanceof EntityHeader) {
      return true;
    }
    if (node instanceof Text text
        && ((text.id() != null && text.id().endsWith("title"))
            || ((text.container() == io.mateu.uidl.data.TextContainer.h1
                    || text.container() == io.mateu.uidl.data.TextContainer.h2)
                && text.text() != null
                && !text.text().isBlank()))) {
      return true;
    }
    for (var child : childrenOf(node)) {
      if (names(child, depth + 1)) {
        return true;
      }
    }
    return false;
  }

  /** The components a record component holds (a single one or a collection of them). */
  private static Collection<Component> childrenOf(Component node) {
    var out = new java.util.ArrayList<Component>();
    if (!node.getClass().isRecord()) {
      return out;
    }
    for (var rc : node.getClass().getRecordComponents()) {
      Object value;
      try {
        value = rc.getAccessor().invoke(node);
      } catch (ReflectiveOperationException | RuntimeException e) {
        continue;
      }
      if (value instanceof Component component) {
        out.add(component);
      } else if (value instanceof Collection<?> collection) {
        for (var item : collection) {
          if (item instanceof Component component) {
            out.add(component);
          }
        }
      }
    }
    return out;
  }
}
