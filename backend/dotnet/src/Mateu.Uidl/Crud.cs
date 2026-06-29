using System.Reflection;

namespace Mateu.Uidl;

/// <summary>
/// Base for a CRUD view of <typeparamref name="T"/>. The framework renders a searchable listing and
/// detail/edit/new forms, calling these methods. (C# analogue of Java's AutoCrud&lt;T&gt;.)
/// </summary>
public abstract class Crud<T> where T : class, new()
{
    /// <summary>Rows to show, optionally filtered by the search box text.</summary>
    public abstract IEnumerable<T> Fetch(string? search);

    /// <summary>Loads one entity by id (default: linear scan of <see cref="Fetch"/>).</summary>
    public virtual T? Get(string id) => Fetch(null).FirstOrDefault(e => IdOf(e) == id);

    /// <summary>Persists a created/edited entity. Override to store it.</summary>
    public virtual void Save(T entity) { }

    /// <summary>Removes an entity by id. Override to store it.</summary>
    public virtual void Delete(string id) { }

    /// <summary>The value of the entity's <c>Id</c> property as a string.</summary>
    public static string? IdOf(T entity) =>
        typeof(T).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance)?.GetValue(entity)?.ToString();
}
