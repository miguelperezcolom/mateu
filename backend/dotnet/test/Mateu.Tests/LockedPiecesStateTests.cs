using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The view model the locked-pieces YAML layouts bind: it echoes what it was bound with.</summary>
public class LockedPayrollModel
{
    public double Bonus { get; set; } = 10;
    public string SalaryNote { get; set; } = "kept";
    public string Approver { get; set; } = "nobody";
    public string Comment { get; set; } = "";

    [Button] public Message Echo() => new($"{Bonus}|{SalaryNote}|{Approver}|{Comment}");
}

/// <summary>A code view whose own tree references the restricted business component.</summary>
[UI("locked-payroll-tree")]
public class LockedPayrollTree : IComponentTreeSupplier
{
    public double Bonus { get; set; } = 10;
    public string SalaryNote { get; set; } = "kept";
    public string Approver { get; set; } = "nobody";
    public string Comment { get; set; } = "";

    public IComponent Component() => new VerticalLayout { Content = [new ComponentRef("Payroll")] };

    [Button] public Message Echo() => new($"{Bonus}|{SalaryNote}|{Approver}|{Comment}");
}

/// <summary>A code view that draws the restricted business component ONLY while <c>ShowPayroll</c> is true.</summary>
[UI("locked-payroll-conditional")]
public class LockedPayrollConditional : IComponentTreeSupplier
{
    public bool ShowPayroll { get; set; }
    public double Bonus { get; set; } = 10;
    public string SalaryNote { get; set; } = "kept";
    public string Approver { get; set; } = "nobody";
    public string Comment { get; set; } = "";

    public IComponent Component() => ShowPayroll
        ? new VerticalLayout { Content = [new ComponentRef("Payroll")] }
        : new VerticalLayout { Content = [] };

    [Button] public Message Echo() => new($"{Bonus}|{SalaryNote}|{Approver}|{Comment}");
}

/// <summary>
/// Write side of the access keys of the YAML pieces a view draws (mirrors Java's
/// JavaPagePartialLockedStateSyncTest): a field a partial or a components.yaml business component
/// hides (<c>eyesOnly:</c>) or locks (<c>readOnlyUnless:</c> / <c>disabledUnless:</c>) for the
/// caller keeps its server-side value whatever the client POSTS — and the component's restricted
/// pieces never reach a caller who may not see them.
/// </summary>
public class LockedPiecesStateTests
{
    private const string Fields = """
        - {type: FormField, id: bonus, label: Bonus, dataType: number, readOnlyUnless: {roles: [hr]}}
        - {type: FormField, id: salaryNote, label: Salary note, dataType: string, eyesOnly: {roles: [hr]}}
        - {type: FormField, id: approver, label: Approver, dataType: string, disabledUnless: {roles: [hr]}}
        - {type: FormField, id: comment, label: Comment, dataType: string}
        - {type: Text, text: Secret salary table, eyesOnly: {roles: [hr]}}
        """;

    private static string Indent(string text, int spaces) =>
        string.Join("\n", text.Split('\n').Select(l => new string(' ', spaces) + l)) + "\n";

    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("locked-pieces-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"),
            "routes:\n"
            + "  - route: locked-with-partial\n    layout: with-partial.yaml\n    viewModel: Mateu.Tests.LockedPayrollModel\n"
            + "  - route: locked-with-component\n    layout: with-component.yaml\n    viewModel: Mateu.Tests.LockedPayrollModel\n"
            + "  - route: locked-plain\n    layout: plain.yaml\n    viewModel: Mateu.Tests.LockedPayrollModel\n");
        File.WriteAllText(Path.Combine(dir, "plain.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n"
            + "    - {type: FormField, id: bonus, label: Bonus, dataType: number}\n"
            + "    - {type: FormField, id: comment, label: Comment, dataType: string}\n");
        File.WriteAllText(Path.Combine(dir, "with-partial.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n    - {type: Partial, ref: payroll}\n");
        File.WriteAllText(Path.Combine(dir, "with-component.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n    - {type: ComponentRef, ref: Payroll}\n");
        Directory.CreateDirectory(Path.Combine(dir, "partials"));
        File.WriteAllText(Path.Combine(dir, "partials", "payroll.yaml"), "content:\n" + Indent(Fields, 2));
        File.WriteAllText(Path.Combine(dir, "components.yaml"),
            "- name: Payroll\n  component:\n    type: VerticalLayout\n    content:\n" + Indent(Fields, 6));
        return dir;
    }

    private static readonly string Dir = Specs();

    private static SyncHandler For(params string[] roles) =>
        new(new MateuRegistry(typeof(LockedPayrollModel).Assembly),
            identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
            specsDir: Dir);

    private static string Echo(SyncHandler handler, string route, string? serverSideType = null) =>
        handler.Handle(new RunActionRqDto
        {
            Route = route,
            ActionId = "echo",
            ServerSideType = serverSideType ?? typeof(LockedPayrollModel).FullName,
            ComponentState = new()
            {
                ["bonus"] = JsonSerializer.SerializeToElement(999),
                ["salaryNote"] = JsonSerializer.SerializeToElement("hacked"),
                ["approver"] = JsonSerializer.SerializeToElement("mallory"),
                ["comment"] = JsonSerializer.SerializeToElement("hi"),
            },
        }).Messages.Single().Text;

    [Theory]
    [InlineData("/locked-with-partial")]
    [InlineData("/locked-with-component")]
    public void A_guest_cannot_write_the_locked_fields_of_a_piece_in_a_yaml_layout(string route)
    {
        Assert.Equal("10|kept|nobody|hi", Echo(For(), route));
        Assert.Equal("999|hacked|mallory|hi", Echo(For("hr"), route));
    }

    [Fact]
    public void A_guest_cannot_write_the_locked_fields_of_a_business_component_a_code_view_draws()
    {
        var type = typeof(LockedPayrollTree).FullName;
        Assert.Equal("10|kept|nobody|hi", Echo(For(), "locked-payroll-tree", type));
        Assert.Equal("999|hacked|mallory|hi", Echo(For("hr"), "locked-payroll-tree", type));
    }

    /// <summary>STRICT: a page that draws the component only in another state, rendered once
    /// without it, still never takes a guest's posted value for the component's locked field.</summary>
    [Fact]
    public void A_component_drawn_only_in_another_state_still_locks_its_fields()
    {
        var type = typeof(LockedPayrollConditional).FullName;
        var guest = For();
        guest.Handle(new RunActionRqDto { Route = "locked-payroll-conditional" }); // drawn without it
        Assert.Equal("10|kept|nobody|hi", Echo(guest, "locked-payroll-conditional", type));
        Assert.Equal("999|hacked|mallory|hi", Echo(For("hr"), "locked-payroll-conditional", type));
    }

    /// <summary>STRICT for YAML views too: a layout naming no business component is checked against
    /// every restricted one of the app (the documented false positive: a same-named field is dropped).</summary>
    [Fact]
    public void A_yaml_layout_is_checked_against_every_restricted_business_component()
    {
        Assert.Equal("10|kept|nobody|hi", Echo(For(), "/locked-plain"));
        Assert.Equal("999|hacked|mallory|hi", Echo(For("hr"), "/locked-plain"));
    }

    [Fact]
    public void A_business_components_access_keys_apply_on_the_wire()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var guest = JsonSerializer.Serialize(For().Handle(new RunActionRqDto { Route = "locked-payroll-tree" }), options);
        Assert.DoesNotContain("Secret salary table", guest);
        var hr = JsonSerializer.Serialize(For("hr").Handle(new RunActionRqDto { Route = "locked-payroll-tree" }), options);
        Assert.Contains("Secret salary table", hr);
    }
}
