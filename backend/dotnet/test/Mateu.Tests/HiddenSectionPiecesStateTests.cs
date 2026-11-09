using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The view model the hidden-section layouts bind: it echoes what it was bound with.</summary>
public class VaultModel
{
    public string Pin { get; set; } = "0000";
    public string Comment { get; set; } = "";

    [Button] public Message Echo() => new($"{Pin}|{Comment}");
}

/// <summary>A code view drawing the restricted component whose eyesOnly section nests the plain one.</summary>
[UI("vault-tree")]
public class VaultTree : IComponentTreeSupplier
{
    public string Pin { get; set; } = "0000";
    public string Comment { get; set; } = "";

    public IComponent Component() => new VerticalLayout { Content = [new ComponentRef("Outer")] };

    [Button] public Message Echo() => new($"{Pin}|{Comment}");
}

/// <summary>
/// A business component with NO access keys of its own, placed under a section (or a parent piece)
/// the caller may not see, locks every field it holds (mirrors Java's
/// ClientLockedFieldsTest.aPlainPartialNestedUnderASectionTheCallerMayNotSeeLocksAllItsFields).
/// </summary>
public class HiddenSectionPiecesStateTests
{
    private const string Vault = """
        - name: Vault
          component:
            type: VerticalLayout
            content:
              - {type: FormField, id: pin, label: Vault pin, dataType: string}
        """;

    private static string Specs(bool withOuter)
    {
        var dir = Directory.CreateTempSubdirectory("hidden-section-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"),
            "routes:\n"
            + "  - route: vault-in-section\n    layout: in-section.yaml\n    viewModel: Mateu.Tests.VaultModel\n"
            + (withOuter ? "  - route: vault-in-outer\n    layout: in-outer.yaml\n    viewModel: Mateu.Tests.VaultModel\n" : ""));
        File.WriteAllText(Path.Combine(dir, "in-section.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n"
            + "    - {type: FormField, id: comment, label: Comment, dataType: string}\n"
            + "    - type: VerticalLayout\n      eyesOnly: {roles: [hr]}\n      content:\n"
            + "        - {type: ComponentRef, ref: Vault}\n");
        File.WriteAllText(Path.Combine(dir, "in-outer.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n"
            + "    - {type: FormField, id: comment, label: Comment, dataType: string}\n"
            + "    - {type: ComponentRef, ref: Outer}\n");
        var outer = withOuter
            ? "- name: Outer\n  component:\n    type: VerticalLayout\n    content:\n"
              + "      - {type: Text, text: Public part}\n"
              + "      - type: VerticalLayout\n        eyesOnly: {roles: [hr]}\n        content:\n"
              + "          - {type: ComponentRef, ref: Vault}\n"
            : "";
        File.WriteAllText(Path.Combine(dir, "components.yaml"), outer + Vault + "\n");
        return dir;
    }

    private static readonly string WithOuter = Specs(withOuter: true);
    private static readonly string SectionOnly = Specs(withOuter: false);

    private static SyncHandler For(string dir, params string[] roles) =>
        new(new MateuRegistry(typeof(VaultModel).Assembly),
            identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
            specsDir: dir);

    private static string Echo(SyncHandler handler, string route, string? serverSideType = null) =>
        handler.Handle(new RunActionRqDto
        {
            Route = route,
            ActionId = "echo",
            ServerSideType = serverSideType ?? typeof(VaultModel).FullName,
            ComponentState = new()
            {
                ["pin"] = JsonSerializer.SerializeToElement("1234"),
                ["comment"] = JsonSerializer.SerializeToElement("hi"),
            },
        }).Messages.Single().Text;

    [Fact]
    public void A_plain_component_nested_under_a_section_the_caller_may_not_see_locks_all_its_fields()
    {
        var type = typeof(VaultTree).FullName;
        Assert.Equal("0000|hi", Echo(For(WithOuter), "vault-tree", type));
        Assert.Equal("0000|hi", Echo(For(WithOuter), "/vault-in-outer"));
    }

    [Fact]
    public void A_caller_who_may_see_the_section_writes_the_nested_components_fields()
    {
        var type = typeof(VaultTree).FullName;
        Assert.Equal("1234|hi", Echo(For(WithOuter, "hr"), "vault-tree", type));
        Assert.Equal("1234|hi", Echo(For(WithOuter, "hr"), "/vault-in-outer"));
    }

    /// <summary>The section is the YAML layout's own (no restricted business component in the app).</summary>
    [Fact]
    public void A_plain_component_under_a_hidden_section_of_a_yaml_layout_locks_its_fields()
    {
        Assert.Equal("0000|hi", Echo(For(SectionOnly), "/vault-in-section"));
        Assert.Equal("1234|hi", Echo(For(SectionOnly, "hr"), "/vault-in-section"));
    }

    [Fact]
    public void The_nested_component_is_not_drawn_for_a_caller_who_may_not_see_the_section()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        string Load(string dir, string route, params string[] roles) =>
            JsonSerializer.Serialize(For(dir, roles).Handle(new RunActionRqDto { Route = route }), options);
        Assert.DoesNotContain("Vault pin", Load(WithOuter, "vault-tree"));
        Assert.Contains("Vault pin", Load(WithOuter, "vault-tree", "hr"));
        Assert.DoesNotContain("Vault pin", Load(SectionOnly, "/vault-in-section"));
        Assert.Contains("Vault pin", Load(SectionOnly, "/vault-in-section", "hr"));
    }
}
