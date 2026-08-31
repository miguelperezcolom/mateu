package io.mateu.core.application.runaction;

import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * Inlines every {@link Partial} in a component tree, before anything maps it to DTOs.
 *
 * <p>This is what makes a partial "usable anywhere a component is" true rather than aspirational.
 * The alternative — a partial node on the wire that each renderer resolves — would mean the feature
 * ships once per renderer, arrives late in the ones nobody maintains, and leaves a static bundle
 * holding a reference it cannot follow. Resolving here means the wire never learns the concept
 * exists, and neither does any renderer.
 *
 * <p>A partial that stands for <b>several</b> components is spliced into its parent's content
 * rather than wrapped, so putting one inside a {@code FormLayout} yields form fields — not a nested
 * layout that quietly breaks the grid. That splice is why this walks the tree generically over
 * record components instead of teaching each of the ~36 layout mappers about partials: the rule
 * belongs in one place, and a layout added next year gets it for free.
 *
 * <p>In the one position where splicing is impossible — a slot that holds a single component, like
 * {@code Container.content} — a multi-component partial is stacked in a bare {@link
 * VerticalLayout}. Nothing else is available there, and silently dropping all but the first would
 * be worse.
 */
@Slf4j
public final class PartialExpander {

  /** A ref chain longer than this is a bug, not a design. Belt to the cycle detector's braces. */
  private static final int MAX_DEPTH = 20;

  private PartialExpander() {}

  /**
   * The tree with its partials resolved. Returns the very same instance when there was nothing to
   * resolve, which is the common case and costs one reflective pass with no allocation.
   */
  public static Component expand(Component root, HttpRequest httpRequest) {
    if (root == null) {
      return null;
    }
    try {
      return single(root, httpRequest, new ArrayDeque<>());
    } catch (Exception e) {
      // A tree that renders slightly wrong beats a page that does not render. The refs that failed
      // have already been logged by the registry.
      log.error("Could not expand partials; rendering the tree as authored", e);
      return root;
    }
  }

  /** What a component becomes in a slot that holds exactly one. */
  private static Component single(Component component, HttpRequest request, Deque<String> chain) {
    var expanded = inList(component, request, chain);
    if (expanded.isEmpty()) {
      return null;
    }
    if (expanded.size() == 1) {
      return expanded.get(0);
    }
    return new VerticalLayout(expanded);
  }

  /** What a component becomes in a content list — where a partial may contribute several. */
  private static List<Component> inList(
      Component component, HttpRequest request, Deque<String> chain) {
    if (!(component instanceof Partial partial)) {
      return List.of(rewrite(component, request, chain));
    }
    var ref = partial.ref();
    if (chain.contains(ref)) {
      // A stack iterates newest-first; reversed, the message reads as the include chain a human
      // would follow through the files.
      var path = new ArrayList<>(chain);
      java.util.Collections.reverse(path);
      path.add(ref);
      log.error("Partial '{}' includes itself: {}", ref, String.join(" -> ", path));
      return List.of();
    }
    if (chain.size() >= MAX_DEPTH) {
      log.error("Partial nesting deeper than {} at '{}'; stopping", MAX_DEPTH, ref);
      return List.of();
    }
    chain.push(ref);
    try {
      var resolved = new ArrayList<Component>();
      for (var child : PartialRegistry.instance().resolve(ref, request)) {
        resolved.addAll(inList(child, request, chain));
      }
      return resolved;
    } finally {
      chain.pop();
    }
  }

  /** The same component with its children expanded — identical instance when nothing changed. */
  private static Component rewrite(Component component, HttpRequest request, Deque<String> chain) {
    return ComponentRecords.rewrite(
        component,
        value -> {
          if (value instanceof Component child) {
            var expanded = single(child, request, chain);
            return expanded == child ? value : expanded;
          }
          if (!ComponentRecords.isComponentList(value)) {
            // Options, grid columns, flex grows — plenty of lists on a component hold no
            // components.
            return value;
          }
          var changed = false;
          var rewritten = new ArrayList<Component>();
          for (var child : ComponentRecords.componentsOf(value)) {
            var expanded = inList(child, request, chain);
            changed |= expanded.size() != 1 || expanded.get(0) != child;
            rewritten.addAll(expanded);
          }
          return changed ? List.copyOf(rewritten) : value;
        });
  }
}
