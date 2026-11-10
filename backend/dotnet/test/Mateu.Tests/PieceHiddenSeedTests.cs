using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A route's <c>state:</c> seed of a field a YAML partial or a components.yaml business component
/// hides from the caller (<c>eyesOnly:</c>) never reaches that caller — the rule the conformance case
/// <c>yaml-eyes-only</c> pins for an inline field (mirrors Java's YamlPieceHiddenSeedSyncTest). The
/// compositions are resolved while the page is mapped, after the route seeded its state; a
/// read-only field keeps its seed (it is drawn, with its value).
/// </summary>
public class PieceHiddenSeedTests
{
    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("piece-hidden-seed-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"),
            "routes:\n  - route: staff\n    layout: staff.yaml\n    state:\n"
            + "      name: Ada\n      salary: SALARY-SEED\n      bonus: 1234\n      payrollNote: PAYROLL-SEED\n");
        File.WriteAllText(Path.Combine(dir, "staff.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n"
            + "    - {type: FormField, id: name, label: Name, dataType: string}\n"
            + "    - {type: Partial, ref: payroll}\n"
            + "    - {type: ComponentRef, ref: Payroll}\n");
        Directory.CreateDirectory(Path.Combine(dir, "partials"));
        File.WriteAllText(Path.Combine(dir, "partials", "payroll.yaml"),
            "content:\n"
            + "  - {type: FormField, id: salary, label: Salary, dataType: string, eyesOnly: {roles: [hr]}}\n"
            + "  - {type: FormField, id: bonus, label: Bonus, dataType: number, readOnlyUnless: {roles: [hr]}}\n");
        File.WriteAllText(Path.Combine(dir, "components.yaml"),
            "- name: Payroll\n  component:\n    type: VerticalLayout\n    content:\n"
            + "      - {type: FormField, id: payrollNote, label: Note, dataType: string, eyesOnly: {roles: [hr]}}\n");
        return dir;
    }

    private static readonly string Dir = Specs();

    private static string Load(params string[] roles) =>
        JsonSerializer.Serialize(new SyncHandler(new MateuRegistry(typeof(PieceHiddenSeedTests).Assembly),
                identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
                specsDir: Dir)
            .Handle(new RunActionRqDto { Route = "/staff" }));

    [Fact]
    public void A_seed_of_a_field_a_piece_hides_never_reaches_the_caller()
    {
        var guest = Load();
        Assert.Contains("Ada", guest);
        Assert.Contains("1234", guest);
        Assert.DoesNotContain("SALARY-SEED", guest);
        Assert.DoesNotContain("PAYROLL-SEED", guest);
    }

    [Fact]
    public void The_seeds_reach_a_caller_who_may_see_the_fields()
    {
        var hr = Load("hr");
        Assert.Contains("SALARY-SEED", hr);
        Assert.Contains("PAYROLL-SEED", hr);
    }
}
