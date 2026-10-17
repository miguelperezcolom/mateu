using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>Business components behind a broken getter, a member needing arguments and a broken
/// supplier — only while <see cref="Enabled"/> is on, so the scans of the rest of the
/// assembly see none of them.</summary>
public class FieldBusinessComponents
{
    public static readonly AsyncLocal<bool> Enabled = new();

    [BusinessComponent("NeedsArgs")]
    public IComponent NeedsArgs(string who) => new Text(who);

    [BusinessComponent("Broken")]
    public IComponent? Broken => Enabled.Value ? throw new InvalidOperationException("boom") : null;

    [BusinessComponent("Kept")]
    public IComponent? Kept => Enabled.Value ? new Text("kept") : null;
}

public class BrokenComponentSupplier : IComponentCatalogSupplier
{
    public IReadOnlyList<ComponentEntry> BusinessComponents() =>
        FieldBusinessComponents.Enabled.Value ? throw new InvalidOperationException("down") : [];
}

/// <summary>
/// The authored catalogue files as a user writes them: the bare-list spelling, a sampleFile that
/// is missing, a component that does not parse, and a file that is not YAML at all — none of them
/// takes the catalogue (or the app) down. Plus a broken derived business component.
/// </summary>
public class CatalogueFilesTests : IDisposable
{
    private readonly string _dir = Directory.CreateTempSubdirectory("mateu-catalogue-").FullName;

    public void Dispose() => Directory.Delete(_dir, true);

    private void Write(string file, string content) => File.WriteAllText(Path.Combine(_dir, file), content);

    [Fact]
    public void A_sources_file_may_be_a_bare_list_and_a_missing_sample_file_leaves_the_source_without_one()
    {
        Write("sources.yaml", """
            - name: countries
              source:
                url: /api/countries
              sampleFile: specs/ui/samples/countries.json
            - name: cities
              source:
                url: /api/cities
              sampleFile: samples/cities.yaml
            - source:
                url: /nameless
            - just a string
            """);
        Directory.CreateDirectory(Path.Combine(_dir, "samples"));
        Write("samples/cities.yaml", "- Palma\n- Inca\n");
        var catalog = RestSourceRegistry.AuthoredFrom(_dir);
        Assert.Equal(["countries", "cities"], catalog.Sources.Select(e => e.Name).ToArray());
        Assert.Null(catalog.Get("countries")!.Sample);
        Assert.Equal("specs/ui/samples/countries.json", catalog.Get("countries")!.SampleFile);
        Assert.Equal(new List<object?> { "Palma", "Inca" }, catalog.Get("cities")!.Sample);
    }

    [Fact]
    public void An_inline_sample_on_the_source_is_read_typed()
    {
        Write("sources.yaml", """
            sources:
              - name: totals
                source:
                  url: /api/totals
                  sample:
                    total: 120.5
            """);
        var sample = (IDictionary<string, object?>)RestSourceRegistry.AuthoredFrom(_dir).Get("totals")!.Source.Sample!;
        Assert.Equal(120.5, Convert.ToDouble(sample["total"]));
        Assert.IsNotType<string>(sample["total"]);
    }

    [Theory]
    [InlineData("sources.yaml", "sources: [unclosed")]
    [InlineData("components.yaml", "components: {: :")]
    public void A_file_that_is_not_yaml_is_ignored(string file, string content)
    {
        Write(file, content);
        Assert.True(RestSourceRegistry.AuthoredFrom(_dir).HasNoSources());
        Assert.True(ComponentRegistry.AuthoredFrom(_dir).HasNoComponents());
    }

    [Fact]
    public void A_scalar_file_has_no_entries()
    {
        Write("sources.yaml", "just text");
        Write("components.yaml", "42");
        Assert.True(RestSourceRegistry.AuthoredFrom(_dir).HasNoSources());
        Assert.True(ComponentRegistry.AuthoredFrom(_dir).HasNoComponents());
    }

    [Fact]
    public void A_components_file_may_be_a_bare_list_and_an_unparseable_component_is_skipped()
    {
        Write("components.yaml", """
            - name: Hello
              component:
                type: Text
                text: hi
            - name: Scalar
              component: just text
            - name: Empty
            - component:
                type: Text
                text: nameless
            - 7
            """);
        var catalog = ComponentRegistry.AuthoredFrom(_dir);
        Assert.Equal(["Hello"], catalog.Components.Select(e => e.Name).ToArray());
    }

    [Fact]
    public void A_broken_business_component_or_supplier_is_skipped_and_its_siblings_kept()
    {
        FieldBusinessComponents.Enabled.Value = true;
        try
        {
            var derived = ComponentRegistry.DerivedFrom([typeof(FieldBusinessComponents), typeof(BrokenComponentSupplier)]);
            var names = derived.Components.Select(e => e.Name).ToList();
            Assert.Contains("Kept", names); // a broken sibling does not take it down
            Assert.DoesNotContain("Broken", names);
            Assert.DoesNotContain("NeedsArgs", names); // a member needing arguments is not a composition
        }
        finally
        {
            FieldBusinessComponents.Enabled.Value = false;
        }
    }
}
