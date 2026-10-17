using Xunit;

namespace Mateu.Tests;

/// <summary>Tests that set process-wide state another test can change under them, and assert on it.
/// Not parallelized: xunit runs this collection on its own, after the parallel ones, so nothing swaps
/// that state mid-test. Every test that boots a host (<c>AddMateu</c>) touches both statics below,
/// so "in the same collection as the other hosts" is not enough — those flaked:
/// <list type="bullet">
/// <item><see cref="Mateu.Core.MateuLogging"/> holds ONE logger factory: <c>AddMateu</c> hands it the
/// host's and the host tests reset it on the way out, so a capturing factory lost its warning
/// (<c>ActionCatalogueTests</c>, <c>YamlDefinitionProblemsTests</c>).</item>
/// <item><see cref="Mateu.Core.DevSpecs"/> holds ONE dev mode and watcher: a host booting while a
/// test forced dev mode on restarts the watcher (<c>options.Dev ?? DevSpecs.Enabled</c>), dropping
/// the edit the test had just written (<c>LiveReloadTests</c>).</item>
/// </list></summary>
[CollectionDefinition(Name, DisableParallelization = true)]
public sealed class ProcessWideStateCollection
{
    public const string Name = "ProcessWideState";
}

/// <summary>Keeps the rule above true: a test class that INSTALLS a logger factory of its own (to
/// assert on what is logged) belongs to <see cref="ProcessWideStateCollection"/> — outside it a host
/// booting in a parallel test swaps the factory and the assertion flakes. Resetting it
/// (<c>UseLoggerFactory(null)</c>, what the host tests do on the way out) is not installing.</summary>
public class ProcessWideStateCollectionTests
{
    private static readonly System.Text.RegularExpressions.Regex Installs =
        new(@"MateuLogging\.UseLoggerFactory\(\s*(?!null\s*\))");

    [Fact]
    public void Every_test_class_that_captures_the_log_is_in_the_process_wide_collection()
    {
        var dir = Path.GetDirectoryName(SourceFile())!;
        var offenders = new List<string>();
        foreach (var file in Directory.GetFiles(dir, "*.cs", SearchOption.AllDirectories))
        {
            if (file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}")
                || file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")) continue;
            var source = File.ReadAllText(file);
            foreach (System.Text.RegularExpressions.Match use in Installs.Matches(source))
            {
                // the class declaring the use: the last class declaration before it
                var head = source[..use.Index];
                var cls = System.Text.RegularExpressions.Regex.Matches(head, @"(?m)^(\[[^\n]*\]\s*\n)*(public|internal)?\s*(sealed\s+)?class\s+(\w+)");
                if (cls.Count == 0) continue;
                var decl = cls[^1];
                if (!decl.Value.Contains("Collection(ProcessWideStateCollection.Name)"))
                    offenders.Add($"{Path.GetFileName(file)}: {decl.Groups[4].Value}");
            }
        }
        Assert.True(offenders.Count == 0, "not in [Collection(ProcessWideStateCollection.Name)]: " + string.Join(", ", offenders.Distinct()));
    }

    private static string SourceFile([System.Runtime.CompilerServices.CallerFilePath] string path = "") => path;
}
