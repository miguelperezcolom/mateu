using System.Collections;
using System.Reflection;
using Mateu.Dtos;

namespace Mateu.Core;

internal sealed partial class SyncHandler
{
    /// <summary>The response with the catalogue entries its components name by <c>ref</c>
    /// (<see cref="UIIncrementDto.RestSources"/>): a page served with NO app shell never receives
    /// the app's catalogue, so a by-ref call could not be resolved in the browser. Nothing is added
    /// when the response already carries the app catalogue or names no source. (Mirrors Java's
    /// ReferencedRestSources.)</summary>
    private UIIncrementDto WithReferencedRestSources(UIIncrementDto increment)
    {
        var walk = new RefWalk();
        walk.Collect(increment.Commands);
        walk.Collect(increment.Fragments);
        if (walk.CarriesCatalogue || walk.Refs.Count == 0) return increment;
        var referenced = MateuCatalogs.MapCatalogue(MateuCatalogs.Sources, withSamples: SampleMode)
            .Where(e => walk.Refs.Contains(e.Name))
            .ToList();
        return referenced.Count == 0 ? increment : increment with { RestSources = referenced };
    }

    private sealed class RefWalk
    {
        public readonly HashSet<string> Refs = new(StringComparer.Ordinal);
        public bool CarriesCatalogue;
        private readonly HashSet<object> _visited = new(ReferenceEqualityComparer.Instance);

        public void Collect(object? node)
        {
            if (node is null or string || node.GetType().IsPrimitive || node.GetType().IsEnum) return;
            if (!node.GetType().IsValueType && !_visited.Add(node)) return;
            switch (node)
            {
                case IDictionary map:
                    foreach (var value in map.Values) Collect(value);
                    return;
                case IEnumerable items:
                    foreach (var item in items) Collect(item);
                    return;
                case AppMetadataDto { RestSources.Count: > 0 }:
                    CarriesCatalogue = true;
                    break;
                case RestDataSourceDto { Ref: { } r } when !string.IsNullOrWhiteSpace(r):
                    Refs.Add(r.Trim());
                    break;
            }
            var type = node.GetType();
            if (type.Namespace is null || !type.Namespace.StartsWith("Mateu.Dtos", StringComparison.Ordinal)) return;
            foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (property.GetIndexParameters().Length > 0 || property.Name == "EqualityContract") continue;
                object? value;
                try { value = property.GetValue(node); }
                catch (TargetInvocationException) { continue; }
                Collect(value);
            }
        }
    }
}
