using Mateu.Core;
using Mateu.Dtos;
using Xunit;
using Xunit.Abstractions;

namespace Mateu.Tests;

/// <summary>A YAML listing's <c>rowRoute:</c> — the way IN to a record when no view model is behind
/// the listing (Java's Listing.rowRoute → CrudlDto.rowRoute): the Java fixture read-listing.yaml
/// through the .NET handler, held to the Java golden of ReadListingDefinitionSyncTest. Which row
/// fields the template needs (rowRouteFields) is the renderer's business, as in Java.</summary>
public class YamlRowRouteTests(ITestOutputHelper output)
{
    [Fact]
    public void A_read_listing_with_a_row_route_matches_the_java_golden()
    {
        // the component only: that golden (2026-09-20) predates Java naming a definition-only page's
        // window (ActionInstanceCreator.nameTheWindow, 2026-10-17) — today Java sends the same
        // SetWindowTitle "Read Only People" .NET does; regenerating the golden would pin it
        var diffs = YamlGoldenHarness.Diffs(YamlGoldenHarness.Expected("read-listing")["component"]!,
            YamlGoldenHarness.Actual("read-listing")["component"]!);
        foreach (var d in diffs) output.WriteLine(d);
        Assert.True(diffs.Count == 0, "read-listing diverges:\n  " + string.Join("\n  ", diffs.Take(40)));
    }

    [Fact]
    public void The_row_route_travels_as_written_and_is_absent_when_undeclared()
    {
        var routed = ComponentMapper.Map(YamlComponentBuilder.Parse("""
            type: Listing
            rowRoute: " people/${row.id} "
            rowsSource: {url: /api/people}
            columns: [{type: GridColumn, id: name}]
            """)!);
        Assert.Equal("people/${row.id}", Assert.IsType<CrudMetadataDto>(routed.Metadata).RowRoute);
        var plain = ComponentMapper.Map(YamlComponentBuilder.Parse("type: Listing\ncolumns: [{type: GridColumn, id: name}]\n")!);
        Assert.Null(Assert.IsType<CrudMetadataDto>(plain.Metadata).RowRoute);
    }
}
