using System.Text;

namespace Mateu.Core;

internal static class Naming
{
    /// <summary>"Name" → "name", "FirstName" → "firstName".</summary>
    public static string CamelCase(string s) =>
        string.IsNullOrEmpty(s) ? s : char.ToLowerInvariant(s[0]) + s[1..];

    /// <summary>"firstName" / "FirstName" → "First name".</summary>
    public static string Humanize(string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        var sb = new StringBuilder();
        for (var i = 0; i < s.Length; i++)
        {
            var c = s[i];
            if (i > 0 && char.IsUpper(c) && !char.IsUpper(s[i - 1])) sb.Append(' ');
            sb.Append(i == 0 ? char.ToUpperInvariant(c) : char.ToLowerInvariant(c));
        }
        return sb.ToString();
    }

    /// <summary>An identifier as Java's <c>Humanizer.toUpperCaseFirst</c> shows it — used for enum
    /// members so every backend calls them the same: '.', '_' and '-' are spaces, words split at
    /// case and letter/non-letter boundaries, then lower case with the first letter upper
    /// (CHECK_OUT → "Check out", CheckOut → "Check out", ROOM1 → "Room 1").</summary>
    public static string HumanizeConstant(string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        s = s.Replace('.', ' ').Replace('_', ' ').Replace('-', ' ');
        s = System.Text.RegularExpressions.Regex.Replace(
            s, "(?<=[A-Z])(?=[A-Z][a-z])|(?<=[^A-Z])(?=[A-Z])|(?<=[A-Za-z])(?=[^A-Za-z])", " ").ToLowerInvariant();
        s = System.Text.RegularExpressions.Regex.Replace(s, " +", " ");
        return s.Length > 1 ? char.ToUpperInvariant(s[0]) + s[1..] : s;
    }
}
