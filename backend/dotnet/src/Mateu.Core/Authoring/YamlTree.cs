using YamlDotNet.Core;
using YamlDotNet.Core.Events;

namespace Mateu.Core.Authoring;

/// <summary>A node of a COMPOSED YAML document: the shape and the raw text, with where each node
/// starts (1-based line and column) — no construction, no type resolution. What the validator walks
/// (the twin of SnakeYAML's composed node tree in Java). Built from the parser's events rather than
/// YamlDotNet's representation model, which refuses duplicate keys: a definition with a duplicate
/// key must still be reported, not crash the validator.</summary>
internal abstract class YNode
{
    public int Line { get; init; }
    public int Column { get; init; }
}

/// <summary>A scalar: its text and whether it was written plain (unquoted, not a block scalar).</summary>
internal sealed class YScalar : YNode
{
    public required string Value { get; init; }
    public bool Plain { get; init; }
}

internal sealed class YSequence : YNode
{
    public List<YNode> Items { get; } = [];
}

internal sealed class YMapping : YNode
{
    /// <summary>The entries in document order — duplicate keys kept, as written.</summary>
    public List<KeyValuePair<YNode, YNode>> Entries { get; } = [];
}

/// <summary>A YAML text the composer cannot read: the parser's message and where.</summary>
internal sealed class YamlTreeException(string message, int? line, int? column) : Exception(message)
{
    public int? Line { get; } = line;
    public int? Column { get; } = column;
}

/// <summary>Composes YAML text into a <see cref="YNode"/> tree.</summary>
internal static class YamlTree
{
    /// <summary>Deepest nesting accepted (the same limit the Java composer is given).</summary>
    public const int MaxDepth = 1000;

    /// <summary>The root of the single document in <paramref name="yaml"/>, or null for an empty stream.</summary>
    /// <exception cref="YamlTreeException">the text is not well-formed YAML, or holds several documents</exception>
    public static YNode? Compose(string yaml)
    {
        var parser = new Parser(new StringReader(yaml));
        var anchors = new Dictionary<string, YNode>(StringComparer.Ordinal);
        var stack = new Stack<YNode>();
        // a mapping's pending key, per open mapping (null = the next node is a key)
        var pendingKeys = new Stack<YNode?>();
        YNode? root = null;
        var documents = 0;
        try
        {
            while (parser.MoveNext())
            {
                var e = parser.Current!;
                switch (e)
                {
                    case DocumentStart ds:
                        documents++;
                        if (documents > 1)
                            throw new YamlTreeException("Expected a single document in the stream, but found another document",
                                (int)ds.Start.Line, (int)ds.Start.Column);
                        break;
                    case Scalar s:
                        Add(new YScalar
                        {
                            Value = s.Value,
                            Plain = s.Style == ScalarStyle.Plain,
                            Line = (int)s.Start.Line,
                            Column = (int)s.Start.Column,
                        }, s.Anchor);
                        break;
                    case SequenceStart ss:
                    {
                        var node = new YSequence { Line = (int)ss.Start.Line, Column = (int)ss.Start.Column };
                        Add(node, ss.Anchor);
                        Open(node, ss);
                        break;
                    }
                    case MappingStart ms:
                    {
                        var node = new YMapping { Line = (int)ms.Start.Line, Column = (int)ms.Start.Column };
                        Add(node, ms.Anchor);
                        Open(node, ms);
                        pendingKeys.Push(null);
                        break;
                    }
                    case SequenceEnd:
                        stack.Pop();
                        break;
                    case MappingEnd:
                        stack.Pop();
                        pendingKeys.Pop();
                        break;
                    case AnchorAlias alias:
                        if (!anchors.TryGetValue(alias.Value.Value, out var target))
                            throw new YamlTreeException("Found undefined alias " + alias.Value.Value,
                                (int)alias.Start.Line, (int)alias.Start.Column);
                        Add(target, AnchorName.Empty);
                        break;
                }
            }
        }
        catch (YamlException ex)
        {
            throw new YamlTreeException(MessageOf(ex), (int)ex.Start.Line, (int)ex.Start.Column);
        }
        return root;

        void Open(YNode node, ParsingEvent at)
        {
            if (stack.Count >= MaxDepth)
                throw new YamlTreeException("Nesting depth exceeds the limit of " + MaxDepth,
                    (int)at.Start.Line, (int)at.Start.Column);
            stack.Push(node);
        }

        void Add(YNode node, AnchorName anchor)
        {
            if (!anchor.IsEmpty) anchors[anchor.Value] = node;
            if (stack.Count == 0)
            {
                root = node;
                return;
            }
            switch (stack.Peek())
            {
                case YSequence seq:
                    seq.Items.Add(node);
                    break;
                case YMapping map:
                    var key = pendingKeys.Pop();
                    if (key is null)
                    {
                        pendingKeys.Push(node);
                    }
                    else
                    {
                        map.Entries.Add(new(key, node));
                        pendingKeys.Push(null);
                    }
                    break;
            }
        }
    }

    /// <summary>The parser's message without the "(Line: …) - (Line: …): " position prefix.</summary>
    private static string MessageOf(YamlException ex)
    {
        var message = ex.Message;
        var cut = message.IndexOf("): ", StringComparison.Ordinal);
        if (message.StartsWith('(') && cut >= 0) message = message[(cut + 3)..];
        message = message.Trim();
        if (message.Length > 0) message = char.ToUpperInvariant(message[0]) + message[1..];
        return message.EndsWith('.') ? message : message + ".";
    }
}
