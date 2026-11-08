namespace Mateu.Core;

/// <summary>The two global inference switches (AppContext switches), one naming scheme for both
/// since 3.0-alpha.412 — the C# twin of Java's <c>mateu.layout.inference.enabled</c> /
/// <c>mateu.page.inference.enabled</c>:
/// <list type="bullet">
/// <item><see cref="Layout"/> — layout inference ([AutoLayout]) for every class; default off.</item>
/// <item><see cref="Page"/> — page-level inference ([AutoPage]) for every class; default on.</item>
/// </list>
/// An attribute on the class always wins. (The alpha-era names "Mateu.LayoutInference" and
/// "Mateu.PageInference.Disabled" were removed for 3.0.)</summary>
public static class InferenceSwitches
{
    public const string Layout = "Mateu.LayoutInference.Enabled";
    public const string Page = "Mateu.PageInference.Enabled";

    /// <summary>Whether layout inference is on globally (classes without [AutoLayout]).</summary>
    public static bool LayoutInferenceEnabled() =>
        AppContext.TryGetSwitch(Layout, out var on) && on;

    /// <summary>Whether page-level inference is on globally (classes without [AutoPage]).</summary>
    public static bool PageInferenceEnabled() =>
        !AppContext.TryGetSwitch(Page, out var on) || on;
}
