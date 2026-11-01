package io.mateu.core.application.runaction;

import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.core.io.IOContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLParser;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;
import org.yaml.snakeyaml.events.AliasEvent;
import org.yaml.snakeyaml.events.Event;
import org.yaml.snakeyaml.nodes.MappingNode;
import org.yaml.snakeyaml.nodes.Node;
import org.yaml.snakeyaml.nodes.NodeTuple;
import org.yaml.snakeyaml.nodes.ScalarNode;
import org.yaml.snakeyaml.nodes.SequenceNode;

/**
 * The YAML reader of the specs files ({@code specs/ui/**}): Jackson's, with YAML <b>anchors and
 * aliases</b> resolved.
 *
 * <p>Jackson's YAML parser does not resolve an alias: it hands {@code *api} over as the STRING
 * {@code "api"}. So {@code museum-artworks: *api} in an environment's {@code sources:} became an
 * override with no base url — the entry was still counted as re-pointed, and nothing changed. A
 * silent no-op is the worst answer a loader can give, and rejecting aliases would refuse standard
 * YAML that authors reach for precisely in these files (one base url written once). So they are
 * RESOLVED, as every other YAML reader does (the Python port's {@code yaml.safe_load}, .NET's
 * YamlDotNet deserializer): before Jackson parses a file that uses an alias, every alias is
 * replaced by a copy of the node it names, and a merge key ({@code <<: *base}) is applied.
 *
 * <p>A file WITHOUT aliases is parsed exactly as before, byte for byte (so its line numbers in
 * error messages are unchanged). Expansion is bounded: SnakeYAML's alias limit applies, a recursive
 * alias is refused, and so is an expansion beyond {@link #MAX_EXPANDED_NODES} nodes.
 */
public final class SpecsYaml {

  /** The most nodes an alias expansion may produce (a guard against "billion laughs"). */
  static final int MAX_EXPANDED_NODES = 100_000;

  private SpecsYaml() {}

  /** An {@link ObjectMapper} over {@link #factory()}. */
  public static ObjectMapper mapper() {
    return new ObjectMapper(factory());
  }

  /** A {@link YAMLFactory} whose parsers see every alias resolved. */
  public static YAMLFactory factory() {
    return new AliasResolvingYamlFactory();
  }

  /**
   * {@code yaml} with every alias replaced by a copy of its anchored node and every merge key
   * applied; the very same text when it uses no alias.
   *
   * @throws IllegalArgumentException for a recursive alias or an expansion too large
   */
  public static String expandAliases(String yaml) {
    if (yaml == null || yaml.indexOf('*') < 0 || !usesAliases(yaml)) {
      return yaml;
    }
    var yamlLib = newYaml();
    var out = new StringWriter();
    var documents = new ArrayList<Node>();
    for (var node : yamlLib.composeAll(new StringReader(yaml))) {
      documents.add(new Expander().copy(node));
    }
    if (documents.size() == 1) {
      yamlLib.serialize(documents.get(0), out);
    } else {
      // keep the document separators of a multi-document file
      for (var document : documents) {
        out.write("---\n");
        yamlLib.serialize(document, out);
      }
    }
    return out.toString();
  }

  private static boolean usesAliases(String yaml) {
    try {
      for (Event event : newYaml().parse(new StringReader(yaml))) {
        if (event instanceof AliasEvent) {
          return true;
        }
      }
      return false;
    } catch (RuntimeException e) {
      // not valid YAML: Jackson reports it in its own words, on the text as written
      return false;
    }
  }

  private static Yaml newYaml() {
    var options = new LoaderOptions();
    var dumper = new DumperOptions();
    dumper.setWidth(Integer.MAX_VALUE); // never fold a long scalar (a url) on the way back
    dumper.setSplitLines(false);
    return new Yaml(
        new MergingConstructor(options),
        new org.yaml.snakeyaml.representer.Representer(dumper),
        dumper,
        options);
  }

  /** Exposes SnakeYAML's merge-key flattening ({@code <<: *base}) on a composed node. */
  private static final class MergingConstructor extends SafeConstructor {
    MergingConstructor(LoaderOptions options) {
      super(options);
    }

    void merge(MappingNode node) {
      flattenMapping(node);
    }
  }

  /** Deep-copies a composed node graph so no node is shared (no alias is emitted again). */
  private static final class Expander {
    private final IdentityHashMap<Node, Boolean> inProgress = new IdentityHashMap<>();
    private final MergingConstructor merger = new MergingConstructor(new LoaderOptions());
    private int produced;

    Node copy(Node node) {
      if (++produced > MAX_EXPANDED_NODES) {
        throw new IllegalArgumentException(
            "YAML aliases expand to more than " + MAX_EXPANDED_NODES + " nodes");
      }
      if (inProgress.containsKey(node)) {
        throw new IllegalArgumentException("A YAML alias refers to itself: " + node.getStartMark());
      }
      inProgress.put(node, Boolean.TRUE);
      try {
        if (node instanceof ScalarNode scalar) {
          return new ScalarNode(
              scalar.getTag(),
              scalar.getValue(),
              scalar.getStartMark(),
              scalar.getEndMark(),
              scalar.getScalarStyle());
        }
        if (node instanceof SequenceNode sequence) {
          List<Node> items = new ArrayList<>();
          for (var item : sequence.getValue()) {
            items.add(copy(item));
          }
          return new SequenceNode(
              sequence.getTag(),
              true,
              items,
              sequence.getStartMark(),
              sequence.getEndMark(),
              sequence.getFlowStyle());
        }
        var mapping = (MappingNode) node;
        List<NodeTuple> tuples = new ArrayList<>();
        for (var tuple : mapping.getValue()) {
          tuples.add(new NodeTuple(copy(tuple.getKeyNode()), copy(tuple.getValueNode())));
        }
        var copied =
            new MappingNode(
                mapping.getTag(),
                true,
                tuples,
                mapping.getStartMark(),
                mapping.getEndMark(),
                mapping.getFlowStyle());
        copied.setMerged(mapping.isMerged());
        merger.merge(copied);
        return copied;
      } finally {
        inProgress.remove(node);
      }
    }
  }

  private static String read(Reader reader) throws IOException {
    var sb = new StringBuilder();
    var buffer = new char[8192];
    int n;
    while ((n = reader.read(buffer)) > 0) {
      sb.append(buffer, 0, n);
    }
    return sb.toString();
  }

  /** Jackson's YAML factory, expanding aliases before its parser sees the text. */
  private static final class AliasResolvingYamlFactory extends YAMLFactory {

    AliasResolvingYamlFactory() {
      super();
    }

    AliasResolvingYamlFactory(AliasResolvingYamlFactory src, ObjectCodec codec) {
      super(src, codec);
    }

    @Override
    public YAMLFactory copy() {
      return new AliasResolvingYamlFactory(this, null);
    }

    private YAMLParser expanded(String text, IOContext ctxt) throws IOException {
      try {
        return super._createParser(new StringReader(expandAliases(text)), ctxt);
      } catch (RuntimeException e) {
        // a recursive or runaway alias (ours or SnakeYAML's limit): the file does not load
        throw new IOException("YAML aliases could not be resolved: " + e.getMessage(), e);
      }
    }

    @Override
    protected YAMLParser _createParser(InputStream in, IOContext ctxt) throws IOException {
      String text;
      try (in) {
        text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
      }
      return expanded(text.startsWith("\uFEFF") ? text.substring(1) : text, ctxt);
    }

    @Override
    protected YAMLParser _createParser(Reader r, IOContext ctxt) throws IOException {
      String text;
      try (r) {
        text = read(r);
      }
      return expanded(text, ctxt);
    }

    @Override
    protected YAMLParser _createParser(
        char[] data, int offset, int len, IOContext ctxt, boolean recyclable) throws IOException {
      return expanded(new String(data, offset, len), ctxt);
    }

    @Override
    protected YAMLParser _createParser(byte[] data, int offset, int len, IOContext ctxt)
        throws IOException {
      return expanded(new String(data, offset, len, StandardCharsets.UTF_8), ctxt);
    }
  }
}
