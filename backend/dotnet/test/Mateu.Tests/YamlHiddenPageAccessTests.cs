using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The view model the YAML payroll routes bind: it pays whatever salary it is hydrated with.</summary>
public class PayrollView
{
    public double Salary { get; set; } = 100;
    public Message Pay() => new($"paid {Salary}");
}

/// <summary>
/// The YAML access keys survive the two situations where the personalised definition used to be
/// thrown away (mirrors Java's YamlHiddenPageAccessSyncTest): the caller may see NOTHING of the
/// page (its root is hidden) → 403 before anything is hydrated or run; and personalising FAILS
/// (here: the translation pass throws) → the restrictions still apply, the text stays untranslated.
/// </summary>
public class YamlHiddenPageAccessTests
{
    private const string Fields = """
            - type: FormField
              id: salary
              label: ${i18n.salary}
              dataType: number
            - type: Button
              label: Pay
              actionId: pay
        """;

    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-hidden-page-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: payroll
                definition: payroll.yaml
                viewModel: Mateu.Tests.PayrollView
              - route: payroll-bare
                definition: payroll-bare.yaml
                viewModel: Mateu.Tests.PayrollView
              - route: payroll-locked
                definition: payroll-locked.yaml
                viewModel: Mateu.Tests.PayrollView
            """);
        File.WriteAllText(Path.Combine(dir, "payroll.yaml"), """
            layout:
              type: VerticalLayout
              eyesOnly: admin
              content:
            """ + "\n" + Fields);
        File.WriteAllText(Path.Combine(dir, "payroll-bare.yaml"), """
            type: VerticalLayout
            eyesOnly: admin
            content:
            """ + "\n" + string.Join("\n", Fields.Split('\n').Select(l => l.Length >= 2 ? l[2..] : l)));
        File.WriteAllText(Path.Combine(dir, "payroll-locked.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - type: FormField
                  id: salary
                  label: ${i18n.salary}
                  dataType: number
                  readOnlyUnless: admin
                - type: Button
                  label: Pay
                  actionId: pay
            """);
        return dir;
    }

    private static readonly string Dir = Specs();

    /// <summary>A catalogue whose every read fails — so does the translation pass over a tree.</summary>
    private static IEnumerable<Translations> Broken()
    {
        throw new InvalidOperationException("translation catalogue broke");
#pragma warning disable CS0162
        yield break;
#pragma warning restore CS0162
    }

    private static SyncHandler Handler(bool brokenTranslations, params string[] roles) =>
        new(new MateuRegistry(typeof(PayrollView).Assembly),
            identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
            specsDir: Dir,
            translations: brokenTranslations ? new TranslationRegistry(Broken()) : null);

    private static RunActionRqDto Pay(string route) => new()
    {
        Route = route,
        ActionId = "pay",
        ServerSideType = typeof(PayrollView).FullName,
        ComponentState = new() { ["salary"] = JsonSerializer.SerializeToElement(999) },
    };

    private static string PaidBy(SyncHandler handler, string route) =>
        Assert.Single(handler.Handle(Pay(route)).Messages).Text!;

    [Fact]
    public void A_caller_who_may_see_nothing_of_an_enveloped_page_is_refused()
    {
        Assert.Throws<MateuForbiddenException>(() => Handler(false).Handle(Pay("/payroll")));
        Assert.Throws<MateuForbiddenException>(() =>
            Handler(false).Handle(new RunActionRqDto { Route = "/payroll" }));
        Assert.Equal("paid 999", PaidBy(Handler(false, "admin"), "/payroll"));
    }

    [Fact]
    public void A_caller_who_may_see_nothing_of_a_bare_layout_is_refused()
    {
        Assert.Throws<MateuForbiddenException>(() => Handler(false).Handle(Pay("/payroll-bare")));
        Assert.Throws<MateuForbiddenException>(() =>
            Handler(false).Handle(new RunActionRqDto { Route = "/payroll-bare" }));
        Assert.Equal("paid 999", PaidBy(Handler(false, "admin"), "/payroll-bare"));
    }

    [Fact]
    public void A_broken_translation_pass_keeps_the_locked_fields_locked()
    {
        var loader = new YamlSpecLoader(Dir, translations: new TranslationRegistry(Broken()));
        var anonymous = loader.LoadSpec("payroll-locked", a => a is null, "en")!;
        Assert.Contains("salary", anonymous.LockedFields);
        Assert.Empty(loader.LoadSpec("payroll-locked", _ => true, "en")!.LockedFields);
    }

    [Fact]
    public void A_broken_translation_pass_keeps_the_locked_fields_locked_on_the_full_path()
    {
        Assert.Equal("paid 100", PaidBy(Handler(true), "/payroll-locked"));
        Assert.Equal("paid 999", PaidBy(Handler(true, "admin"), "/payroll-locked"));
    }

    [Fact]
    public void A_broken_translation_pass_still_refuses_a_hidden_page()
    {
        Assert.Throws<MateuForbiddenException>(() => Handler(true).Handle(Pay("/payroll")));
        Assert.Equal("paid 999", PaidBy(Handler(true, "admin"), "/payroll"));
    }
}
