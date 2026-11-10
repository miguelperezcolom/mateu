using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The non-wire halves of the 3.0 GA parity features (the wire halves are pinned by the
/// conformance corpus): the save-side mass-assignment rule of [GeneratedValue] /
/// [EditableOnlyWhenCreating], the code-supplied overline / title placeholder, and the
/// <c>type: Project</c> renderer-mismatch warning.</summary>
public class ParityFeatureTests
{
    private static Dictionary<string, object?> State() => new()
    {
        ["id"] = "T-001", ["reference"] = "FORGED", ["code"] = "FORGED", ["title"] = "Edited",
    };

    [Fact]
    public void An_edit_takes_the_generated_and_the_create_only_values_from_the_stored_record()
    {
        // Java's ClientWritableFields: the client may not rewrite what its edit form drew read-only
        var writable = ReflectionMapper.WritableOnSave(typeof(Wire.SupportCase), State(), creating: false);
        Assert.False(writable.ContainsKey("reference"));
        Assert.False(writable.ContainsKey("code"));
        Assert.Equal("Edited", writable["title"]);
    }

    [Fact]
    public void A_create_keeps_the_generated_value_and_the_create_only_field_the_client_sends()
    {
        // the server generated the value for the very form being saved; a create-only field is editable there
        var writable = ReflectionMapper.WritableOnSave(typeof(Wire.SupportCase), State(), creating: true);
        Assert.Equal("FORGED", writable["reference"]);
        Assert.Equal("FORGED", writable["code"]);
    }

    [Fact]
    public void A_creation_form_starts_with_the_generated_value()
    {
        var entity = new Wire.SupportCase();
        ReflectionMapper.GenerateValues(typeof(Wire.SupportCase), entity);
        Assert.Equal("T-100", entity.Reference);
    }

    [UI("parity/supplied-header"), Title(""), Overline("Declared"), TitlePlaceholder("Declared…")]
    public class SuppliedHeaderPage : IOverlineSupplier, ITitlePlaceholderSupplier
    {
        public string? Name { get; set; } = "Ada";
        public string? Overline() => "Supplied";
        public string? TitlePlaceholder() => "Supplied…";
    }

    [Fact]
    public void A_supplied_overline_and_title_placeholder_win_over_the_declared_ones()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(SuppliedHeaderPage).Assembly));
        var json = JsonSerializer.Serialize(
            handler.Handle(new RunActionRqDto { ServerSideType = typeof(SuppliedHeaderPage).FullName }),
            new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.Contains("\"overline\":\"Supplied\"", json);
        Assert.Contains("\"titlePlaceholder\":\"Supplied\\u2026\"", json);
        Assert.DoesNotContain("Declared", json);
    }

    [Fact]
    public void A_descriptor_naming_another_renderer_than_the_served_one_is_warned()
    {
        var specs = Directory.CreateTempSubdirectory("mateu-project-").FullName;
        var ui = Directory.CreateTempSubdirectory("mateu-ui-").FullName;
        File.WriteAllText(Path.Combine(ui, "_index.html"), "<html></html>");
        try
        {
            Assert.Null(ProjectRendererCheck.Declared(specs)); // nothing declared: nothing to say
            File.WriteAllText(Path.Combine(specs, "project.yaml"), "type: Project\nrenderer: redwood\n");
            var served = ProjectRendererCheck.Served(RendererFiles.At(ui));
            Assert.Equal("vaadin", served);
            var warning = ProjectRendererCheck.Mismatch(ProjectRendererCheck.Declared(specs), served);
            Assert.NotNull(warning);
            Assert.Contains("says renderer: redwood, but this server serves vaadin", warning);
            // agreeing, headless or undeclared: silent
            Assert.Null(ProjectRendererCheck.Mismatch("vaadin", "vaadin"));
            Assert.Null(ProjectRendererCheck.Mismatch("redwood", null));
            Assert.Null(ProjectRendererCheck.Mismatch(null, "vaadin"));
        }
        finally
        {
            Directory.Delete(specs, true);
            Directory.Delete(ui, true);
        }
    }

    [Fact]
    public void A_type_Project_file_anywhere_under_the_specs_is_the_descriptor()
    {
        var specs = Directory.CreateTempSubdirectory("mateu-project-").FullName;
        try
        {
            Directory.CreateDirectory(Path.Combine(specs, "settings"));
            File.WriteAllText(Path.Combine(specs, "settings", "app.yaml"), "type: Project\n");
            Assert.Equal("vaadin", ProjectRendererCheck.Declared(specs)); // no renderer: the default
            Assert.Null(ProjectRendererCheck.Parse("type: Form\ntitle: x\n"));
        }
        finally
        {
            Directory.Delete(specs, true);
        }
    }
}
