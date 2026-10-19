using Mateu.Core.AgentPush;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Live UI push (phase C): the UI's side of an agent session — its channel, its pairing codes.
// conformance/mcp/push.json + README "Live UI push" (mirrors Java's agentpush runners).
internal sealed partial class SyncHandler
{
    /// <summary>The app-level action that opens a UI session's channel (on the SSE endpoint).</summary>
    public const string AgentChannelAction = "_agent-channel";

    /// <summary>The app-level action that asks for a new one-time pairing code.</summary>
    public const string AgentPairAction = "_agent-pair";

    /// <summary>The app-level action that removes every pairing of the session.</summary>
    public const string AgentUnpairAction = "_agent-unpair";

    /// <summary>The data key the pairing answer travels under.</summary>
    public const string AgentPairingKey = "_agentPairing";

    /// <summary>The live UI sessions when live UI push is on (MCP enabled AND its push switch); null
    /// = off — the app metadata does not announce it and the three actions are refused.</summary>
    public AgentSessions? AgentPush { get; init; }

    /// <summary>The authenticated principal name of the request in flight (null = anonymous): who a
    /// UI session belongs to.</summary>
    public Func<string?>? Principal { get; init; }

    /// <summary><c>_agent-channel</c>: register (or re-check) the session and open its channel — the
    /// SSE endpoint streams it.</summary>
    public AgentChannel OpenAgentChannel(RunActionRqDto rq)
    {
        var sessions = AgentPush ?? throw new UserFacingException(AgentSessions.Disabled);
        return sessions.Open(Param(rq, "sessionId"), Param(rq, "secret"), Principal?.Invoke(),
            StateString(GetState(rq.Parameters, "route")), StateString(GetState(rq.Parameters, "renderer")));
    }

    private static bool IsAgentAction(string? actionId) =>
        actionId is AgentChannelAction or AgentPairAction or AgentUnpairAction;

    /// <summary><c>_agent-pair</c> → Data{_agentPairing: {code, expiresInSeconds}};
    /// <c>_agent-unpair</c> → Data{_agentPairing: null}. A channel asked on the sync endpoint is
    /// refused: it is a stream.</summary>
    private UIIncrementDto AgentAction(RunActionRqDto rq)
    {
        var sessions = AgentPush ?? throw new UserFacingException(AgentSessions.Disabled);
        object? pairing;
        switch (rq.ActionId)
        {
            case AgentPairAction:
                pairing = new Dictionary<string, object?>
                {
                    ["code"] = sessions.NewPairingCode(Param(rq, "sessionId"), Param(rq, "secret"), Principal?.Invoke()),
                    ["expiresInSeconds"] = (int)AgentSessions.CodeLifetime.TotalSeconds,
                };
                break;
            case AgentUnpairAction:
                sessions.Unpair(Param(rq, "sessionId"), Param(rq, "secret"), Principal?.Invoke());
                pairing = null;
                break;
            default:
                throw new UserFacingException("Open the agent channel on the SSE endpoint (/mateu/v3/sse/…).");
        }
        var data = new Dictionary<string, object?> { [AgentPairingKey] = pairing };
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
    }

    private static string Param(RunActionRqDto rq, string name) => StateString(GetState(rq.Parameters, name)) ?? "";
}
