using System.Reflection;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// The pre-beta API freeze (design/api-freeze-review.md): the right spelling of the hamburger variant
// is the wire value (since 3.0-alpha.412; the old spelling maps to it), and every [Obsolete] element of the public surface names
// its replacement — the .NET side of Java's DeprecationsNameTheirReplacementTest.

[App("Hamburger", Variant = AppVariant.HamburgerMenu)]
public class HamburgerVariantApp
{
    [MenuItem("Home")] public FreezeHome Home() => new();
}

[App("Old hamburger", Variant = "HAMBURGUER_MENU")]
public class OldHamburguerVariantApp
{
    [MenuItem("Home")] public FreezeHome Home() => new();
}

[App("Old hamburger, warned", Variant = "HAMBURGUER_MENU")]
public class WarnedHamburguerVariantApp
{
    [MenuItem("Home")] public FreezeHome Home() => new();
}

public class FreezeHome { public string? Name { get; set; } }

public class ApiFreezeTests
{
    private static string WireVariantOf(Type app) =>
        ((AppMetadataDto)new ReflectionMapper().MapApp(app).Metadata).Variant;

    [Fact]
    public void The_right_spelling_is_the_wire_value()
    {
        // since 3.0-alpha.412 servers send HAMBURGER_MENU; the renderers accept both spellings
        Assert.Equal("HAMBURGER_MENU", WireVariantOf(typeof(HamburgerVariantApp)));
    }

    [Fact]
    public void The_old_misspelling_keeps_working()
    {
        Assert.Equal("HAMBURGER_MENU", WireVariantOf(typeof(OldHamburguerVariantApp)));
    }

    [Fact]
    public void The_old_misspelling_warns_naming_the_replacement()
    {
        var capture = new VariantLogCapture();
        MateuLogging.UseLoggerFactory(capture);
        try
        {
            Assert.Equal("HAMBURGER_MENU", WireVariantOf(typeof(WarnedHamburguerVariantApp)));
            WireVariantOf(typeof(WarnedHamburguerVariantApp)); // once per app, not per request
        }
        finally
        {
            MateuLogging.UseLoggerFactory(null);
        }
        var warned = capture.Entries.Where(e => e.Level == Microsoft.Extensions.Logging.LogLevel.Warning
                                               && e.Message.Contains(nameof(WarnedHamburguerVariantApp))).ToList();
        var warning = Assert.Single(warned);
        Assert.Contains("AppVariant.HamburgerMenu", warning.Message);
    }

    [Fact]
    public void Other_variants_travel_unchanged()
    {
        Assert.Equal("TILES", AppVariant.ToWire(AppVariant.Tiles));
        Assert.Equal("", AppVariant.ToWire(AppVariant.Auto));
    }

    [Fact]
    public void Every_obsolete_public_element_names_its_replacement()
    {
        var offenders = new List<string>();
        var assembly = typeof(AppAttribute).Assembly;
        foreach (var type in assembly.GetExportedTypes())
        {
            Check(type, type.FullName!, offenders);
            foreach (var member in type.GetMembers(BindingFlags.Public | BindingFlags.Instance
                                                   | BindingFlags.Static | BindingFlags.DeclaredOnly))
                Check(member, type.FullName + "." + member.Name, offenders);
        }
        Assert.Empty(offenders);
        // the scan is not vacuous: the deprecated layouts are found
#pragma warning disable CS0618, MATEU002, MATEU003
        Assert.NotNull(typeof(DashboardLayout).GetCustomAttribute<ObsoleteAttribute>());
        Assert.NotNull(typeof(ContentLayout).GetCustomAttribute<ObsoleteAttribute>());
#pragma warning restore CS0618, MATEU002, MATEU003
    }

    [Fact]
    public void The_code_authoring_types_live_in_Mateu_Uidl_and_Mateu_Core_forwards_them()
    {
        // A UI-only module (referencing just Mateu.Uidl) can author routes and app shells in code;
        // the full names are unchanged and Mateu.Core forwards them, so old binaries keep loading.
        var core = typeof(SyncHandler).Assembly;
        foreach (var type in new[]
                 {
                     typeof(IRouteEntrySupplier), typeof(IAppSupplier), typeof(IMenuSupplier),
                     typeof(AppShell), typeof(RouteEntry), typeof(MateuForbiddenException),
                 })
        {
            Assert.Equal("Mateu.Uidl", type.Assembly.GetName().Name);
            Assert.Equal("Mateu.Core", type.Namespace);
            Assert.Same(type, core.GetType(type.FullName!, throwOnError: true));
        }
    }

    [Fact]
    public void Every_obsolete_public_element_carries_a_diagnostic_id()
    {
        // without one, a consumer building with TreatWarningsAsErrors can only silence ALL of
        // CS0618; with one it can NoWarn exactly the deprecation it is migrating away from
        var offenders = new List<string>();
        var ids = new Dictionary<string, string>();
        foreach (var assembly in new[]
                 {
                     typeof(AppAttribute).Assembly, typeof(SyncHandler).Assembly, typeof(UIIncrementDto).Assembly,
                 })
        foreach (var type in assembly.GetExportedTypes())
        foreach (var member in type.GetMembers(BindingFlags.Public | BindingFlags.Instance
                                                | BindingFlags.Static | BindingFlags.DeclaredOnly)
                     .Prepend<MemberInfo>(type))
        {
            var obsolete = member.GetCustomAttribute<ObsoleteAttribute>();
            if (obsolete is null
                || member.GetCustomAttribute<System.Runtime.CompilerServices.CompilerFeatureRequiredAttribute>() is not null)
                continue;
            var name = type.FullName + (member == type ? "" : "." + member.Name);
            if (obsolete.DiagnosticId is not { Length: > 0 } id || !id.StartsWith("MATEU"))
                offenders.Add(name + ": [Obsolete] without a MATEU DiagnosticId");
            else if (ids.TryGetValue(id, out var other) && other != name)
                offenders.Add(name + ": DiagnosticId " + id + " already used by " + other);
            else
                ids[id] = name;
        }
        Assert.Empty(offenders);
        Assert.NotEmpty(ids);
    }

    private static void Check(MemberInfo member, string name, List<string> offenders)
    {
        var obsolete = member.GetCustomAttribute<ObsoleteAttribute>();
        if (obsolete is null) return;
        var message = obsolete.Message ?? "";
        // the compiler marks constructors of types with 'required' members [Obsolete] for old
        // compilers — not an API deprecation
        if (member.GetCustomAttribute<System.Runtime.CompilerServices.CompilerFeatureRequiredAttribute>() is not null)
            return;
        if (!message.Contains("use ", StringComparison.OrdinalIgnoreCase)
            && !message.Contains("no replacement", StringComparison.OrdinalIgnoreCase))
            offenders.Add(name + ": [Obsolete] names no replacement — \"" + message + "\"");
    }
}

internal sealed class VariantLogCapture : Microsoft.Extensions.Logging.ILoggerFactory
{
    public readonly System.Collections.Concurrent.ConcurrentQueue<(Microsoft.Extensions.Logging.LogLevel Level, string Message)> Entries = new();
    public Microsoft.Extensions.Logging.ILogger CreateLogger(string categoryName) => new Logger(this);
    public void AddProvider(Microsoft.Extensions.Logging.ILoggerProvider provider) { }
    public void Dispose() { }

    private sealed class Logger(VariantLogCapture owner) : Microsoft.Extensions.Logging.ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(Microsoft.Extensions.Logging.LogLevel logLevel) => true;
        public void Log<TState>(Microsoft.Extensions.Logging.LogLevel logLevel, Microsoft.Extensions.Logging.EventId eventId,
            TState state, Exception? exception, Func<TState, Exception?, string> formatter) =>
            owner.Entries.Enqueue((logLevel, formatter(state, exception)));
    }
}
