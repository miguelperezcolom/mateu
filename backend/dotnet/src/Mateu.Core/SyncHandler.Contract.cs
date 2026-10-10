using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Visual-builder contract and structure hash (Java: the __contract__ reserved action).
public sealed partial class SyncHandler
{
    // ── ModelView contract ─────────────────────────────────────────────────────
    private UIIncrementDto ContractResponse(Type type, RunActionRqDto rq)
    {
        var instance = Activator.CreateInstance(type)!;
        BindState(instance, rq.ComponentState);
        var component = _mapper.MapView(type, instance, rq.ConsumedRoute ?? "_empty");
        var fields = new List<ModelViewContractDto.Field>();
        CollectFields(component, fields);
        var actions = component.Actions
            .Select(a => a.Id)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .Select(id => new ModelViewContractDto.Action(id))
            .ToList();
        var contract = new ModelViewContractDto(type.FullName ?? "", fields, actions);
        return new UIIncrementDto([], [], [], [], false, new Dictionary<string, object?> { ["_contract"] = contract }, null);
    }

    // A form field is the metadata of a ClientSideComponentDto — but the components themselves nest
    // inside METADATA records (a Page/Form/Card holds its content there), not always in Children, so
    // descend into metadata reflectively too (mirrors Java's walk + walkMetadata).
    private static void CollectFields(ComponentDto? component, List<ModelViewContractDto.Field> fields)
    {
        switch (component)
        {
            case ClientSideComponentDto client:
                if (client.Metadata is FormFieldMetadataDto f && !string.IsNullOrEmpty(f.FieldId)
                    && fields.All(x => x.Id != f.FieldId))
                    fields.Add(new ModelViewContractDto.Field(f.FieldId, f.DataType, f.Stereotype, f.Label, f.Required, f.ReadOnly));
                if (client.Metadata is { } md) WalkMetadata(md, fields);
                foreach (var child in client.Children) CollectFields(child, fields);
                break;
            case ServerSideComponentDto server:
                foreach (var child in server.Children) CollectFields(child, fields);
                break;
        }
    }

    private static void WalkMetadata(object metadata, List<ModelViewContractDto.Field> fields)
    {
        foreach (var prop in metadata.GetType().GetProperties())
        {
            object? value;
            try { value = prop.GetValue(metadata); }
            catch { continue; }
            if (value is ComponentDto dto)
                CollectFields(dto, fields);
            else if (value is System.Collections.IEnumerable seq and not string)
                foreach (var item in seq)
                    if (item is ComponentDto d) CollectFields(d, fields);
        }
    }

    // Structure ETag / template-ref (phase b of the client structure cache): stamp a routed
    // component with a stable hash of its structure and, when the client echoed a still-matching
    // hash, omit the component so only state/data travel (the frontend merges them onto its cached
    // structure). knownStructureHash is only ever sent on a route load, so an action re-render can
    // never accidentally strip. Mirrors io.mateu StructureHashPostProcessor.
    private static ComponentDto? StampOrStripStructure(ComponentDto component, RunActionRqDto rq)
    {
        if (component is not ServerSideComponentDto ss) return component;
        var hash = StructureHashOf(ss);
        // A [StaticView] is never omitted: the client caches its FULL response the first time it
        // sees it each session and then skips the round-trip entirely, so it must always receive
        // the component (carrying staticView=true) to learn that.
        if (!ss.StaticView && rq.KnownStructureHash is { Length: > 0 } known && known == hash) return null;
        return ss with { StructureHash = hash };
    }

    private static string StructureHashOf(ServerSideComponentDto component)
    {
        // Normalize away the two per-request fields before hashing so the SAME structure always
        // hashes the same: the top-level id is a fresh Guid every request (an instance id, not
        // structure) and the hash slot must not feed itself. Nested/structural ids are kept. The
        // client only ever echoes the server's hash, so nulling id here is symmetric.
        var normalized = component with { Id = "", StructureHash = null };
        var json = JsonSerializer.SerializeToUtf8Bytes<ComponentDto>(normalized, WebJson);
        return Convert.ToHexString(SHA256.HashData(json)).ToLowerInvariant();
    }
}
