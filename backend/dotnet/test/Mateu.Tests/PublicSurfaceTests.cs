using Mateu.AspNetCore;
using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

// The engine of Mateu.Core is internal (3.0-alpha.429): an app authors against Mateu.Uidl, hosts
// with Mateu.AspNetCore and reads the wire with Mateu.Dtos. What Mateu.Core and Mateu.AspNetCore
// still export is pinned here, so the public surface cannot grow (or shrink) without a reviewed
// change to the checked-in lists under api/. To accept a deliberate change, run the suite with
// MATEU_API_WRITE=true and commit the rewritten file.
public class PublicSurfaceTests
{
    [Fact]
    public void Mateu_Core_exports_only_the_pinned_types() =>
        AssertSurface(typeof(DevSpecs).Assembly, "Mateu.Core.public-types.txt");

    [Fact]
    public void Mateu_AspNetCore_exports_only_the_pinned_types() =>
        AssertSurface(typeof(MateuExtensions).Assembly, "Mateu.AspNetCore.public-types.txt");

    [Fact]
    public void The_engine_is_not_exported()
    {
        // the three types an app used to reach for are reachable only through AddMateu/MapMateu
        foreach (var engine in new[] { typeof(SyncHandler), typeof(MateuRegistry), typeof(ReflectionMapper) })
            Assert.False(engine.IsVisible, engine.FullName + " is public");
    }

    private static void AssertSurface(System.Reflection.Assembly assembly, string file)
    {
        var actual = assembly.GetExportedTypes()
            .Select(t => t.FullName!)
            .Concat(assembly.GetForwardedTypes().Select(t => t.FullName! + " (forwarded)"))
            .OrderBy(n => n, StringComparer.Ordinal)
            .ToList();
        var path = Path.Combine(TestProjectDir(), "api", file);
        if (string.Equals(Environment.GetEnvironmentVariable("MATEU_API_WRITE"), "true",
                StringComparison.OrdinalIgnoreCase))
            File.WriteAllLines(path, actual);
        var expected = File.ReadAllLines(path).Where(l => l.Length > 0).ToList();
        var added = actual.Except(expected).ToList();
        var removed = expected.Except(actual).ToList();
        Assert.True(added.Count == 0 && removed.Count == 0,
            $"The public surface of {assembly.GetName().Name} changed — added: [{string.Join(", ", added)}], "
            + $"removed: [{string.Join(", ", removed)}]. If deliberate, rerun with MATEU_API_WRITE=true "
            + $"and commit api/{file}.");
    }

    // not [CallerFilePath]: CI builds deterministically, so source paths come out as "/_/..."
    private static string TestProjectDir()
    {
        for (var d = new DirectoryInfo(AppContext.BaseDirectory); d != null; d = d.Parent)
            if (File.Exists(Path.Combine(d.FullName, "Mateu.Tests.csproj"))) return d.FullName;
        throw new InvalidOperationException("Mateu.Tests.csproj not found above " + AppContext.BaseDirectory);
    }
}
