using System.Reflection;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// The pre-beta API freeze (design/api-freeze-review.md): the right spelling of the hamburger variant
// is an alias of the old one on the wire, and every [Obsolete] element of the public surface names
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

public class FreezeHome { public string? Name { get; set; } }

public class ApiFreezeTests
{
    private static string WireVariantOf(Type app) =>
        ((AppMetadataDto)new ReflectionMapper().MapApp(app).Metadata).Variant;

    [Fact]
    public void The_right_spelling_travels_under_the_wire_name_every_renderer_reads()
    {
        Assert.Equal("HAMBURGUER_MENU", WireVariantOf(typeof(HamburgerVariantApp)));
    }

    [Fact]
    public void The_old_misspelling_keeps_working()
    {
        Assert.Equal("HAMBURGUER_MENU", WireVariantOf(typeof(OldHamburguerVariantApp)));
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
#pragma warning disable CS0618
        Assert.NotNull(typeof(DashboardLayout).GetCustomAttribute<ObsoleteAttribute>());
        Assert.NotNull(typeof(ContentLayout).GetCustomAttribute<ObsoleteAttribute>());
#pragma warning restore CS0618
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
