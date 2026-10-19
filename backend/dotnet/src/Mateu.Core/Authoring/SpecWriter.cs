using System.Text;
using System.Text.RegularExpressions;
using Mateu.Uidl;

namespace Mateu.Core.Authoring;

/// <summary>Writes an authored definition into the specs directory — the <c>mateu_save_spec</c>
/// tool, only ever offered in development mode. The path rule is normative (the same in Java, Python
/// and the sidecar): a relative <c>.yaml</c>/<c>.yml</c> path with no <c>..</c>, <c>.</c> or empty
/// segment, no backslash, no drive letter, at most 255 characters, that stays inside the specs
/// directory once symbolic links are followed. C# twin of Java's <c>SpecWriter</c>.</summary>
internal static class SpecWriter
{
    private static readonly Regex Drive = new("^[A-Za-z]:", RegexOptions.CultureInvariant);

    /// <summary>Whether <paramref name="path"/> is acceptable before touching the disk.</summary>
    public static bool IsAcceptable(string? path)
    {
        if (string.IsNullOrWhiteSpace(path) || path.Length > 255) return false;
        if (path.Contains('\0') || path.Contains('\\') || path.StartsWith('/') || Drive.IsMatch(path)) return false;
        if (!(path.EndsWith(".yaml", StringComparison.Ordinal) || path.EndsWith(".yml", StringComparison.Ordinal))) return false;
        foreach (var segment in path.Split('/'))
            if (segment.Length == 0 || segment == "." || segment == "..") return false;
        return true;
    }

    /// <summary>The message of a refused path (shown as written).</summary>
    public static string Refusal(string? path) =>
        "Invalid path " + UidlValidator.Quote(path ?? "")
        + ": give a relative .yaml or .yml path inside the specs directory (no \"..\", no absolute path).";

    /// <summary>Writes <paramref name="yaml"/> at <paramref name="path"/> under <paramref name="root"/>,
    /// creating the folders it needs; the number of bytes written.</summary>
    /// <exception cref="UserFacingException">the path is refused</exception>
    public static int Write(string root, string path, string yaml)
    {
        if (!IsAcceptable(path)) throw new UserFacingException(Refusal(path));
        var @base = Path.TrimEndingDirectorySeparator(Path.GetFullPath(root));
        var target = Path.GetFullPath(Path.Combine(@base, path));
        if (!IsUnder(target, @base)) throw new UserFacingException(Refusal(path));
        var realBase = RealPath(@base);
        var existing = Path.GetDirectoryName(target);
        while (existing is not null && !Directory.Exists(existing) && !File.Exists(existing))
            existing = Path.GetDirectoryName(existing);
        if (existing is null || !IsUnder(RealPath(existing), realBase)) throw new UserFacingException(Refusal(path));
        if (new FileInfo(target).LinkTarget is not null && !IsUnder(RealPath(target), realBase))
            throw new UserFacingException(Refusal(path));
        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        var bytes = new UTF8Encoding(false).GetBytes(yaml);
        File.WriteAllBytes(target, bytes);
        return bytes.Length;
    }

    private static bool IsUnder(string child, string parent) =>
        child == parent
        || child.StartsWith(Path.TrimEndingDirectorySeparator(parent) + Path.DirectorySeparatorChar, StringComparison.Ordinal);

    /// <summary><paramref name="path"/> with every symbolic link along it followed (Java's
    /// <c>toRealPath</c>; a component that does not exist is kept as written).</summary>
    internal static string RealPath(string path, int depth = 0)
    {
        if (depth > 40) throw new IOException("Too many levels of symbolic links: " + path);
        path = Path.GetFullPath(path);
        var root = Path.GetPathRoot(path) ?? "/";
        var current = root;
        foreach (var part in path[root.Length..].Split(Path.DirectorySeparatorChar, StringSplitOptions.RemoveEmptyEntries))
        {
            var next = Path.Combine(current, part);
            FileSystemInfo info = Directory.Exists(next) ? new DirectoryInfo(next) : new FileInfo(next);
            if (info.LinkTarget is { } link)
            {
                var resolved = Path.IsPathRooted(link) ? link : Path.Combine(current, link);
                next = RealPath(resolved, depth + 1);
            }
            current = next;
        }
        return Path.TrimEndingDirectorySeparator(current) is { Length: > 0 } trimmed ? trimmed : current;
    }
}
