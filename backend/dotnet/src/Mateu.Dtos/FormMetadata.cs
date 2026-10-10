using System.Text.Json.Serialization;

namespace Mateu.Dtos;

public record ButtonMetadataDto(string Label, string ActionId) : ComponentMetadataDto
{
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }

    /// <summary>Extra parameters merged into the dispatched action request (e.g. the conflict
    /// dialog's <c>_forceOverwrite</c>).</summary>
    public IReadOnlyDictionary<string, object?>? Parameters { get; init; }
}

public record FormSectionMetadataDto(string Title) : ComponentMetadataDto;
