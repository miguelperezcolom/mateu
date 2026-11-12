using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// [ActionOptions]: the per-action knobs of Java's @Action, as they reach ActionDto (Java's
// Action.of + ActionDtoMapper.mapAction).
internal sealed partial class ReflectionMapper
{
    internal static ActionDto ActionOptionsOf(ActionDto action, ActionOptionsAttribute options) => action with
    {
        TimeoutMillis = options.TimeoutMillis,
        Idempotent = options.Idempotent,
        Background = options.Background,
        Sse = action.Sse || options.Sse,
        ConfirmationRequired = action.ConfirmationRequired || options.ConfirmationRequired,
        // null unless at least one text is written: an all-blank record would paint an empty dialog
        ConfirmationTexts = new[] { options.ConfirmationTitle, options.ConfirmationMessage,
                options.ConfirmationText, options.ConfirmationDenialText }.All(string.IsNullOrEmpty)
            ? action.ConfirmationTexts
            : new ConfirmationTextsDto(options.ConfirmationTitle ?? "", options.ConfirmationMessage ?? "",
                options.ConfirmationText ?? "", options.ConfirmationDenialText ?? ""),
        Href = string.IsNullOrEmpty(options.Href) ? action.Href : options.Href,
        Js = string.IsNullOrEmpty(options.Js) ? action.Js : options.Js,
        CustomEvent = string.IsNullOrEmpty(options.CustomEventName) && string.IsNullOrEmpty(options.CustomEventDetail)
            ? action.CustomEvent
            : new CustomEventDto(options.CustomEventName ?? "", options.CustomEventDetail ?? ""),
        Offline = options.Offline == OfflinePolicy.Queue ? "queue" : action.Offline,
    };
}
