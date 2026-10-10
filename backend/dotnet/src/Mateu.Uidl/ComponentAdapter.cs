namespace Mateu.Uidl;

/// <summary>What a <see cref="IComponentAdapter"/> turns a domain object into: the components to
/// render, the state and data that back them (state keys = the field ids of the components), and the
/// action ids the view exposes — an action reaches the server only if its component advertises it.
/// (C# analogue of io.mateu.uidl.data.AdaptedView.)</summary>
public sealed record AdaptedView(
    IReadOnlyList<IComponent> Components,
    IReadOnlyDictionary<string, object?>? State = null,
    IReadOnlyDictionary<string, object?>? Data = null,
    IReadOnlyList<string>? Actions = null)
{
    public static AdaptedView Of(IComponent component, IReadOnlyDictionary<string, object?>? state = null,
        IReadOnlyList<string>? actions = null, IReadOnlyDictionary<string, object?>? data = null) =>
        new([component], state, data, actions);
}

/// <summary>Renders an arbitrary domain object — one that is NOT a Mateu view and carries no Mateu
/// attributes — and rebuilds it from the state that comes back on an action. Prefer
/// <see cref="ComponentAdapter{T}"/>. Adapters are found by scanning the registered assemblies
/// (concrete classes with a parameterless constructor), registered explicitly with
/// <c>MateuRegistry.RegisterAdapter</c>, or registered as <c>IComponentAdapter</c> services (picked
/// up by <c>AddMateu</c>). (C# analogue of io.mateu.uidl.interfaces.ComponentAdapter.)
///
/// <para>A top-level adapted type gets its route from a <c>[UI]</c> on the domain class; a property of
/// an adapted type on a normal form renders as an independent island that round-trips through the
/// adapter on its own actions. An action id the <see cref="AdaptedView.Actions"/> lists runs the
/// method of that (camelCase) name on the rebuilt model.</para></summary>
public interface IComponentAdapter
{
    /// <summary>The domain type this adapter handles (subtypes are matched too).</summary>
    Type Type { get; }

    AdaptedView Adapt(object model);

    /// <summary>Rebuilds the model from the incoming state. Values arrive unwrapped (string, long,
    /// double, bool, null; nested objects/arrays as JsonElement). The initial load passes an EMPTY
    /// state, so only overwrite the keys present — the model's initializers then survive.</summary>
    object Deserialize(IReadOnlyDictionary<string, object?> state);
}

/// <summary>Typed base of <see cref="IComponentAdapter"/>.</summary>
public abstract class ComponentAdapter<T> : IComponentAdapter where T : class
{
    public Type Type => typeof(T);

    public abstract AdaptedView Adapt(T model);

    public abstract T Deserialize(IReadOnlyDictionary<string, object?> state);

    AdaptedView IComponentAdapter.Adapt(object model) => Adapt((T)model);

    object IComponentAdapter.Deserialize(IReadOnlyDictionary<string, object?> state) => Deserialize(state);
}

/// <summary>On a property whose type is a routed view (a <c>[UI]</c> class), the view is embedded as
/// an independent island WITHOUT its own page chrome: no badges/KPIs, a demoted title, and no card
/// around a single-section form — so it blends into the host section or tab. (C# analogue of
/// Java's @Inline on an embedded orchestrator field.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class InlineAttribute : Attribute;
