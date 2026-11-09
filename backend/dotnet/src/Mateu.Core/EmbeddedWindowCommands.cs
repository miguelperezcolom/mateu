using Mateu.Dtos;

namespace Mateu.Core;

/// <summary>The answer to a request from an EMBEDDED micro frontend (<see cref="RunActionRqDto.EmbeddedChrome"/>:
/// a <see cref="Mateu.Uidl.MicroFrontend"/> with a <c>Chrome</c>) carries no window commands: the
/// island is a block of another page, and the window — its title, the address bar, the favicon —
/// belongs to that page. Stripped at the end of every response (loads, actions, stream steps), so no
/// producer of those commands has to know about it. (Mirrors Java's EmbeddedWindowCommands.)</summary>
internal static class EmbeddedWindowCommands
{
    /// <summary>What names or moves the window: never sent to an embedded island.</summary>
    public static readonly IReadOnlySet<string> WindowCommands =
        new HashSet<string> { "SetWindowTitle", "SetFavicon", "PushStateToHistory" };

    /// <summary>The increment without its window commands when the request is embedded; as it is otherwise.</summary>
    public static UIIncrementDto Strip(UIIncrementDto increment, RunActionRqDto? rq) =>
        rq is { Embedded: true } ? Strip(increment) : increment;

    /// <summary>The increment without its window commands.</summary>
    public static UIIncrementDto Strip(UIIncrementDto increment)
    {
        if (increment.Commands is not { Count: > 0 } commands) return increment;
        var kept = commands.Where(c => c is null || !WindowCommands.Contains(c.Type)).ToList();
        return kept.Count == commands.Count ? increment : increment with { Commands = kept };
    }
}
