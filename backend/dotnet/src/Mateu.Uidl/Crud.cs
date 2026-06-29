namespace Mateu.Uidl;

/// <summary>
/// Base for a listing view of <typeparamref name="T"/>. The framework renders a searchable table and
/// calls <see cref="Fetch"/> to populate it. (C# analogue of Java's AutoCrud&lt;T&gt;.)
/// </summary>
public abstract class Crud<T>
{
    /// <summary>Returns the rows to show, optionally filtered by the search box text.</summary>
    public abstract IEnumerable<T> Fetch(string? search);
}
