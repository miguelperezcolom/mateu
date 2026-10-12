namespace Mateu.Uidl;

/// <summary>The navigation chrome values for <c>[App(Variant = …)]</c> / <c>AppShell.Variant</c> —
/// the C# mirror of Java's <c>AppVariant</c> enum (a string here, as the attribute property is).
/// <c>""</c> (<see cref="Auto"/>) lets Mateu pick from the menu shape.</summary>
public static class AppVariant
{
    /// <summary>Pick the chrome from the menu shape (Java's <c>AUTO</c>).</summary>
    public const string Auto = "";

    /// <summary>A hamburger button opening the whole menu in a drawer.</summary>
    public const string HamburgerMenu = "HAMBURGER_MENU";

    /// <summary>The hamburger holds the sections (first menu level), the band under the header the
    /// entries of the section on screen. Auto never picks it.</summary>
    public const string HamburgerSections = "HAMBURGER_SECTIONS";

    /// <summary>A persistent navigation panel on the left.</summary>
    public const string MenuOnLeft = "MENU_ON_LEFT";

    /// <summary>A navigation bar along the top.</summary>
    public const string MenuOnTop = "MENU_ON_TOP";

    /// <summary>Tab-based navigation (a flat menu of leaves).</summary>
    public const string Tabs = "TABS";

    /// <summary>Flat top-level navigation; entries with children open a tiles hub.</summary>
    public const string Tiles = "TILES";

    /// <summary>A compact icon rail on the left.</summary>
    public const string Rail = "RAIL";

    /// <summary>The value the variant travels under on the wire. Since 3.0-alpha.412 both
    /// <see cref="HamburgerMenu"/> and the old misspelling <c>HAMBURGUER_MENU</c> travel as
    /// <c>HAMBURGER_MENU</c> (the renderers accept both spellings), the same as Java's AppMapper;
    /// anything else travels unchanged.</summary>
    public static string ToWire(string variant) =>
        variant == "HAMBURGUER_MENU" ? HamburgerMenu : variant;
}
