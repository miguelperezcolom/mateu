using System.Text.Json.Serialization;

namespace Mateu.Dtos;

/// <summary>The signed-in user the app's header shows in its user menu: the name, and when known
/// the e-mail and an http(s) picture URL (initials are drawn without one). Display only. (Mirrors
/// io.mateu.dtos.UserProfileDto.) EXPERIMENTAL.</summary>
public sealed record UserProfileDto(
    string Name,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Email,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Picture);
