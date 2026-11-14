using Mateu.Uidl;

namespace Workshop;

/// <summary>The app shell, at the app root: the title and the menu around every screen. Each
/// [MenuItem] method is a menu entry returning that screen; <see cref="HomeRoute"/> names the one
/// the app opens on.</summary>
[App("Workshop")]
public class Shell : IHomeRouteSupplier
{
    [MenuItem("Home")] public Home Home() => new();
    [MenuItem("Products")] public Products Products() => new();

    // Workshop, lab 01: one method, one menu entry.
    [MenuItem("Quote")] public Quote Quote() => new();

    public string HomeRoute() => "home";
}
