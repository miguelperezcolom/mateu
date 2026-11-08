using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>AppContext switches are process-wide and cannot be unset: the test flips them, so it
/// must not run next to the rest of the suite.</summary>
[CollectionDefinition("InferenceSwitches", DisableParallelization = true)]
public class InferenceSwitchesCollection;

public class SwitchPlain { public string? Name { get; set; } }

[AutoLayout(false)]
public class SwitchOptedOut { public string? Name { get; set; } }

/// <summary>One naming scheme for the global inference switches (mirror of Java's
/// InferenceSwitchesTest): "Mateu.LayoutInference.Enabled" / "Mateu.PageInference.Enabled" (the
/// alpha-era names were removed for 3.0). One sequential test: a switch, once set, stays set for
/// the process.</summary>
[Collection("InferenceSwitches")]
public class InferenceSwitchesTests
{
    [Fact]
    public void Switches_decide_and_attributes_win_over_them()
    {
        try
        {
            // nothing configured: layout off, page on
            Assert.False(InferenceSwitches.LayoutInferenceEnabled());
            Assert.True(InferenceSwitches.PageInferenceEnabled());

            // the alpha-era names are no longer read
            AppContext.SetSwitch("Mateu.LayoutInference", true);
            AppContext.SetSwitch("Mateu.PageInference.Disabled", true);
            Assert.False(InferenceSwitches.LayoutInferenceEnabled());
            Assert.True(InferenceSwitches.PageInferenceEnabled());

            // the switches decide
            AppContext.SetSwitch(InferenceSwitches.Layout, true);
            AppContext.SetSwitch(InferenceSwitches.Page, false);
            Assert.True(InferenceSwitches.LayoutInferenceEnabled());
            Assert.False(InferenceSwitches.PageInferenceEnabled());
            AppContext.SetSwitch(InferenceSwitches.Page, true);

            // an attribute on the class wins over the switch
            AppContext.SetSwitch(InferenceSwitches.Layout, true);
            Assert.True(LayoutInference.Enabled(typeof(SwitchPlain)));
            Assert.False(LayoutInference.Enabled(typeof(SwitchOptedOut)));
        }
        finally
        {
            // back to the defaults
            AppContext.SetSwitch("Mateu.LayoutInference", false);
            AppContext.SetSwitch("Mateu.PageInference.Disabled", false);
            AppContext.SetSwitch(InferenceSwitches.Layout, false);
            AppContext.SetSwitch(InferenceSwitches.Page, true);
        }
    }
}
