package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A reference to a reusable piece of UI, usable anywhere a component is.
 *
 * <p>A <b>fragment</b> is authored exactly like a page — a YAML file, or a Java class — except that
 * it has no route and no page chrome: it is a component, or a list of components, and nothing else.
 * Where a page answers "what does this URL show", a fragment answers "what does this <i>piece</i>
 * look like, wherever it appears".
 *
 * <pre>{@code
 * # specs/ui/fragments/address-block.yaml
 * content:
 *   - type: FormField
 *     id: street
 *     label: Street
 *   - type: FormField
 *     id: city
 *     label: City
 * }</pre>
 *
 * <pre>{@code
 * # any page
 * - type: Fragment
 *   ref: address-block
 * }</pre>
 *
 * <p><b>Fragments do not exist on the wire.</b> They are resolved and inlined server-side before
 * the tree is mapped, so every renderer — Vaadin, Redwood, React Native, the IDE plugins — supports
 * them without a line of renderer code, and a static bundle stays self-contained rather than
 * carrying an unresolved reference to a CDN.
 *
 * <p>Because inlining happens before binding, a fragment's fields bind against <i>the page that
 * used it</i>, by the same convention as everywhere else: a {@code FormField id="street"} inside a
 * fragment binds to the hosting ModelView's {@code street} property. That is what makes a fragment
 * useful without a parameter-passing mechanism of its own.
 *
 * <p>Note for readers of the codebase: this is unrelated to {@code UIFragmentDto}, which is the
 * wire's name for an increment of UI sent in response to an action. This {@code Fragment} is an
 * authoring-time concept and never reaches that layer.
 *
 * @param ref names the definition. Resolution order: {@code specs/ui/fragments/<ref>.yaml} on the
 *     classpath; then {@code <ref>} itself when it already looks like a classpath path to a YAML
 *     file; then {@code <ref>} as a fully-qualified Java class name.
 */
@Builder
public record Fragment(String ref) implements Component {}
