using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Editable views (Java: EditableView / AutoEditableView) and master-detail views (Java:
// MasterDetailView). Java's MultiView mediators flip their inner route; this port answers the same
// action ids directly: a top-level page NAVIGATES (like its Crud<T>), an embedded island re-renders
// in place.
internal sealed partial class SyncHandler
{
    /// <summary>An editable / master-detail view named by the request: by serverSideType, else by the
    /// route (its own <c>[UI]</c> route, or a sub-route of it: <c>/edit</c>, <c>/view</c>, <c>/__md/x</c>).</summary>
    private (Type Type, string BaseRoute)? ResolveOrchestratedView(RunActionRqDto rq)
    {
        static bool Orchestrated(Type t) =>
            ReflectionMapper.IsEditableView(t) || (typeof(IMasterDetailView).IsAssignableFrom(t) && !t.IsAbstract);
        if (!string.IsNullOrEmpty(rq.ServerSideType) && registry.Resolve(rq.ServerSideType, null) is { } byName
            && Orchestrated(byName))
            return (byName, "/" + (byName.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? ""));
        if (registry.ResolveByPrefix(rq.Route) is { } pref && Orchestrated(pref.Type))
            return (pref.Type, "/" + pref.BaseRoute);
        return null;
    }

    /// <summary>The route below the view's own (<c>edit</c>, <c>view</c>, <c>__md/x</c>…), "" when none.</summary>
    private static string SubRoute(string baseRoute, string? route)
    {
        var r = "/" + MateuRegistry.Normalize(route);
        var bp = baseRoute.TrimEnd('/');
        return r.Length > bp.Length && r.StartsWith(bp + "/", StringComparison.Ordinal) ? r[(bp.Length + 1)..] : "";
    }

    private UIIncrementDto HandleOrchestratedView(Type type, string baseRoute, RunActionRqDto rq)
    {
        ActionGuard.EnsureViewVisible(type);
        var instance = Activator.CreateInstance(type)!;
        BindState(instance, rq.ComponentState);
        return instance is IEditableView editable
            ? HandleEditableView(type, editable, baseRoute, rq)
            : HandleMasterDetail(type, (IMasterDetailView)instance, baseRoute, rq);
    }

    // ── Editable views ─────────────────────────────────────────────────────────

    /// <summary>A read-only view refuses the edit route and the edit/save actions — not only undrawn
    /// (mirrors Java's EditableView.checkEditable → 403).</summary>
    private static void EnsureEditable(Type type, IEditableView view)
    {
        if (ReflectionMapper.EditableViewReadOnly(type, view))
            throw new MateuForbiddenException($"edit: {type.FullName} is read-only");
    }

    private UIIncrementDto HandleEditableView(Type type, IEditableView view, string baseRoute, RunActionRqDto rq)
    {
        var (embedded, inline) = IslandFlags(rq);
        var editing = SubRoute(baseRoute, rq.Route).Split('/')[0] == "edit";
        var viewRoute = baseRoute.TrimEnd('/') + "/view";
        var editRoute = baseRoute.TrimEnd('/') + "/edit";
        switch (rq.ActionId)
        {
            case null or "":
                if (editing) EnsureEditable(type, view);
                return EditableViewPage(type, view, editing ? "edit" : "view", rq, embedded, inline);
            case "edit":
                EnsureEditable(type, view);
                return embedded
                    ? EditableViewPage(type, view, "edit", rq, embedded, inline)
                    : Navigate(editRoute, null, rq);
            case "save":
            {
                EnsureEditable(type, view);
                var editor = view.LoadEditor();
                BindState(editor, rq.ComponentState);
                // save is advertised validationRequired: re-check on the server what the client was
                // told to check (Java's AutoEditableView.save → ServerConstraintCheck)
                if (_mapper.Violations(editor.GetType(), editor) is { Count: > 0 } broken)
                    throw new UserFacingException(ReflectionMapper.ValidationTitle, string.Join("\n", broken));
                view.SaveEditor(editor);
                return embedded
                    ? LandOnView(type, view, rq, inline, "Saved successfully")
                    : Navigate(viewRoute, "Saved successfully", rq);
            }
            case "cancel-edit":
                return embedded ? LandOnView(type, view, rq, inline, null) : Navigate(viewRoute, null, rq);
            default:
            {
                // any other action is the shown model's own ([Button]/[Toolbar] of the view or the editor)
                var model = editing ? view.LoadEditor() : view.LoadView();
                BindState(model, rq.ComponentState);
                return RunAction(model.GetType(), model, rq, null);
            }
        }
    }

    /// <summary>An embedded island back on its view page: re-rendered in place, its unsaved changes
    /// cleared (the editor it leaves was unmounted, never reloaded — Java's EditableView.navigate).</summary>
    private UIIncrementDto LandOnView(Type type, IEditableView view, RunActionRqDto rq, bool inline, string? message)
    {
        var page = EditableViewPage(type, view, "view", rq, true, inline);
        return page with
        {
            Commands = [.. page.Commands, new UICommandDto(Target(rq), "MarkAsClean", null)],
            Messages = message is null ? page.Messages : [.. page.Messages, new MessageDto("success", "middle", "", message, 3000)],
        };
    }

    private UIIncrementDto EditableViewPage(Type type, IEditableView view, string mode, RunActionRqDto rq, bool embedded,
        bool inline)
    {
        var model = mode == "edit" ? view.LoadEditor() : view.LoadView();
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        var component = _mapper.MapEditableViewPage(type, view, model, mode, route, embedded, inline);
        return FragmentResponse(_mapper.TitleOf(model.GetType(), model), component, rq,
            LookupLabels(model.GetType(), model, model), emitWindowTitle: !embedded);
    }

    // ── Master-detail views ────────────────────────────────────────────────────

    private UIIncrementDto HandleMasterDetail(Type type, IMasterDetailView view, string baseRoute, RunActionRqDto rq)
    {
        var (embedded, inline) = IslandFlags(rq);
        var parts = _mapper.DetailParts(type);
        string? Known(string? key) => key is not null && parts.Any(p => p.Key == key) ? key : null;
        // the selection: the reload's event detail, else the page state, else the route, else the first
        var sub = SubRoute(baseRoute, rq.Route);
        var fromRoute = sub.StartsWith("__md/", StringComparison.Ordinal) ? sub["__md/".Length..].Split('/')[0] : null;
        var selected = Known(StateString(GetState(rq.ComponentState, ReflectionMapper.MasterDetailStateKey)))
                       ?? Known(fromRoute)
                       ?? (view.WhenNothingSelected == NoSelection.First ? parts.FirstOrDefault()?.Key : null);
        if (rq.ActionId is { } pick && pick.StartsWith(ReflectionMapper.MasterDetailPick, StringComparison.Ordinal))
        {
            var key = pick[ReflectionMapper.MasterDetailPick.Length..];
            if (Known(key) is null) throw ActionGuard.NoSuchAction(pick);
            // the pick is an event the page subscribes to (Java's indirection; the same wire here)
            return UIIncrementDto.Of(commands:
                [new UICommandDto(Target(rq), "DispatchEvent", new CustomEventDto(ReflectionMapper.MasterDetailEvent,
                    new Dictionary<string, object?> { ["key"] = key }))]);
        }
        if (rq.ActionId == ReflectionMapper.MasterDetailReload)
            selected = Known(StateString(GetState(rq.Parameters, "key"))) ?? selected;
        else if (!string.IsNullOrEmpty(rq.ActionId))
        {
            view.LoadParts();
            return RunAction(type, view, rq, null);
        }
        view.LoadParts();
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        var component = _mapper.MapMasterDetail(type, view, selected, route, embedded, inline);
        return FragmentResponse(view.PageTitle() ?? _mapper.TitleOf(type, view), component, rq,
            LookupLabels(type, view, view), emitWindowTitle: !embedded);
    }
}
