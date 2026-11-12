namespace Mateu.Core;

/// <summary>The autocomplete token a form field carries (WCAG 1.3.5 Identify Input Purpose) — the
/// twin of Java's <c>FieldMapper.autocompleteOf</c>: the declared token, else "email" for an
/// editable email field (the only purpose the field itself tells), else none.</summary>
internal static class InputPurpose
{
    public static string? Of(string? declared, string? stereotype, bool readOnly)
    {
        if (!string.IsNullOrWhiteSpace(declared)) return declared.Trim();
        return stereotype == "email" && !readOnly ? "email" : null;
    }
}
