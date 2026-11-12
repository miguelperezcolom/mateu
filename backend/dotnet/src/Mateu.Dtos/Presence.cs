namespace Mateu.Dtos;

/// <summary>The data of a <c>PresenceChanged</c> command: the OTHER people who have the record
/// <c>Key</c> open (the recipient is never listed), the oldest first. (Mirrors
/// io.mateu.dtos.PresenceDto.) EXPERIMENTAL.</summary>
public sealed record PresenceDto(string Key, IReadOnlyList<PresenceEntryDto> Entries);

/// <summary>One person who has a record open: the name to show, whether they edit it and since
/// when (ISO-8601 instant). (Mirrors io.mateu.dtos.PresenceEntryDto.) EXPERIMENTAL.</summary>
public sealed record PresenceEntryDto(string Name, bool Editing, string? Since);
