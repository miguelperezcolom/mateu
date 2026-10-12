using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

/// <summary>The two global inference switches (AppContext switches), one naming scheme for both
/// since 3.0-alpha.412 — the C# twin of Java's <c>mateu.layout.inference.enabled</c> /
/// <c>mateu.page.inference.enabled</c>:
/// <list type="bullet">
/// <item><see cref="Layout"/> — layout inference ([AutoLayout]) for every class; default off.</item>
/// <item><see cref="Page"/> — page-level inference ([AutoPage]) for every class; default on.</item>
/// </list>
/// An attribute on the class always wins. The previous names — <see cref="LegacyLayout"/> (true
/// enables) and <see cref="LegacyPageDisabled"/> (true DISABLES) — keep working as deprecated
/// aliases, with one warning per process naming the replacement; the new name wins when both are
/// set.</summary>
public static class InferenceSwitches
{
    public const string Layout = "Mateu.LayoutInference.Enabled";
    public const string Page = "Mateu.PageInference.Enabled";

    /// <summary>Deprecated alias of <see cref="Layout"/>, same polarity.</summary>
    public const string LegacyLayout = "Mateu.LayoutInference";

    /// <summary>Deprecated alias of <see cref="Page"/>, inverted polarity (true = off).</summary>
    public const string LegacyPageDisabled = "Mateu.PageInference.Disabled";

    private static readonly ConcurrentDictionary<string, bool> Warned = new();

    /// <summary>Whether layout inference is on globally (classes without [AutoLayout]).</summary>
    public static bool LayoutInferenceEnabled()
    {
        if (AppContext.TryGetSwitch(Layout, out var on)) return on;
        if (AppContext.TryGetSwitch(LegacyLayout, out var legacy))
        {
            WarnLegacy(LegacyLayout, $"{Layout}={legacy.ToString().ToLowerInvariant()}");
            return legacy;
        }
        return false;
    }

    /// <summary>Whether page-level inference is on globally (classes without [AutoPage]).</summary>
    public static bool PageInferenceEnabled()
    {
        if (AppContext.TryGetSwitch(Page, out var on)) return on;
        if (AppContext.TryGetSwitch(LegacyPageDisabled, out var off))
        {
            WarnLegacy(LegacyPageDisabled, $"{Page}={(!off).ToString().ToLowerInvariant()}");
            return !off;
        }
        return true;
    }

    private static void WarnLegacy(string legacySwitch, string replacement)
    {
        if (Warned.TryAdd(legacySwitch, true))
        {
            MateuLogging.For("Mateu.Inference").LogWarning(
                "The switch '{Legacy}' is deprecated (since 3.0-alpha.412) and will be removed: use '{Replacement}' instead.",
                legacySwitch, replacement);
        }
    }
}
