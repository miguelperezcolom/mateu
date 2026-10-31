using Mateu.Core.MicroFrontends;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Server-side micro frontend resolution and content slots (docs/specs/microfrontend-server-resolution.md;
// mirrors Java's RunActionUseCase.resolveMicroFrontends, FragmentCachePolicies.stamp and the
// __content_slots__ reserved action).
internal sealed partial class SyncHandler
{
    /// <summary>The request header reader of the current request (case-insensitive) — what the
    /// remote identity strategies, the correlation id and a remote view's cache key read.</summary>
    public Func<string, string?>? RequestHeader { get; init; }

    /// <summary>The host framework's id of the current request (ASP.NET's TraceIdentifier).</summary>
    public Func<string?>? RequestTraceIdentifier { get; init; }

    /// <summary>This server's own base url as the adapter sees the local socket (never a request
    /// header) — where a remote registered as a path on this server is called, unless
    /// MateuOptions.SelfBaseUrl says otherwise.</summary>
    public Func<string?>? RequestSelfBaseUrl { get; init; }

    /// <summary>The resolver of Resolve.Server micro frontends and content slots (the adapter builds
    /// it from the services and options; null → Mateu's defaults, with no remote registered).</summary>
    public MicroFrontendServerResolver? MicroFrontendResolver { get; init; }

    /// <summary>Serve the reserved action <c>__content_slots__</c> (Java:
    /// mateu.content-slots.descriptor.enabled). Off by default: it describes the application's screens.</summary>
    public bool ContentSlotsDescriptorEnabled { get; init; }

    private MicroFrontendServerResolver? _defaultResolver;

    private MicroFrontendServerResolver Resolver =>
        MicroFrontendResolver ?? (_defaultResolver ??= MicroFrontendServerResolver.Default(_http));

    /// <summary>The incoming request as the extension points see it.</summary>
    internal IncomingRequest CurrentRequest() =>
        new(RequestHeader, Principal?.Invoke(), identity?.Invoke(), RequestTraceIdentifier?.Invoke());

    private Task<UIIncrementDto> ResolveMicroFrontendsAsync(UIIncrementDto increment, CancellationToken cancellationToken) =>
        Resolver.ResolveAsync(increment, CurrentRequest(), RequestSelfBaseUrl, cancellationToken);

    /// <summary>A view other hosts embed says on its LOAD answers whether they may cache it.</summary>
    private UIIncrementDto StampFragmentCache(UIIncrementDto increment, RunActionRqDto rq)
    {
        if (!string.IsNullOrEmpty(rq.ActionId)) return increment;
        Type? type;
        try
        {
            type = registry.Resolve(rq.ServerSideType, rq.Route);
        }
        catch (Exception)
        {
            return increment;
        }
        if (type is null || !FragmentCachePolicies.Declares(type) || type.IsAbstract
            || type.GetConstructor(Type.EmptyTypes) is null)
            return increment;
        var view = Activator.CreateInstance(type);
        if (view is not null) BindState(view, rq.ComponentState);
        return FragmentCachePolicies.Stamp(increment, rq.ActionId, CurrentRequest(), view);
    }

    private UIIncrementDto ContentSlotsResponse()
    {
        if (!ContentSlotsDescriptorEnabled)
            throw new MateuForbiddenException(
                ContentSlotDescriptors.Action + " is served only with MateuOptions.ContentSlotsDescriptorEnabled = true");
        return UIIncrementDto.Of() with
        {
            AppData = new Dictionary<string, object?>
            {
                [ContentSlotDescriptors.AppDataKey] = ContentSlotDescriptors.Descriptor(registry.ContentSlots),
            },
        };
    }
}
