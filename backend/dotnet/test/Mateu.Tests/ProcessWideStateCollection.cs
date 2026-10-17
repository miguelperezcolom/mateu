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
