using YamlDotNet.Core;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// How the specs files (<c>specs/ui/**</c>) are read: YamlDotNet resolves an alias (<c>*api</c>) on
/// its own, but a MERGE key (<c>&lt;&lt;: *api</c>) only through a <see cref="MergingParser"/> —
/// without it the key was kept as a literal <c>&lt;&lt;</c> entry nobody reads, and an environment
/// entry written that way re-pointed nothing. Java (<c>SpecsYaml</c>) and Python
/// (<c>yaml.safe_load</c>) resolve both, so the three read a file the same way.
/// </summary>
internal static class SpecsYaml
{
    /// <summary>Deserializes <paramref name="yaml"/> with its aliases AND merge keys resolved.</summary>
    public static T Read<T>(this IDeserializer deserializer, string yaml) =>
        deserializer.Deserialize<T>(new MergingParser(new Parser(new StringReader(yaml))));
}
