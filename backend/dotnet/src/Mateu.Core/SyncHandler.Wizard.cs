using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Wizard navigation (Java: WizardActionDispatcher).
public sealed partial class SyncHandler
{
    private UIIncrementDto HandleWizard(Type type, RunActionRqDto rq)
    {
        var wizard = Activator.CreateInstance(type)!;
        BindState(wizard, rq.ComponentState);
        // A list field of the current step: its row-editing actions answer on the wizard state
        // (which carries __step, so the wizard stays on its step).
        if (FieldCrudTarget(type, rq.ActionId) is { } fieldCrud)
            return HandleFieldCrud(fieldCrud.Property, fieldCrud.FieldId, fieldCrud.Suffix, rq);
        var step = StepOf(rq);
        var total = ReflectionMapper.EditableProperties(type)
            .Select(p => p.Find<StepAttribute>()?.Step ?? 1).DefaultIfEmpty(1).Max();
        var route = "/" + (type.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");

        // A completed run (the result step of a CompletionActionLabel wizard) is final: no way
        // back into it, no second completion — even if the wire names back/next anyway.
        var w = (Wizard)wizard;
        var resultStep = w.CompletionActionLabel is not null;
        var completed = resultStep && step >= total;
        // A Draftable wizard opened afresh (no position in the state yet) resumes on the step the
        // user left (the Redwood guided-process resumeStepId) — never on a result step.
        if (string.IsNullOrEmpty(rq.ActionId) && !rq.ComponentState.ContainsKey("__step")
            && wizard is IDraftable resumable && resumable.ResumeStep() is { } resume
            && resume >= 1 && resume <= (resultStep ? total - 1 : total))
            step = resume;
        // The completion's target step: the result step, or past the last step for a classic Finish.
        var completionTarget = resultStep ? total : total + 1;
        // the last step from which a plain forward move (Next/Skip) is not the completion
        var lastPlain = resultStep ? total - 2 : total - 1;
        switch (rq.ActionId)
        {
            case "back" or "next" or "goToStep" or "skip" or "complete" or "saveDraft" or "saveAndClose" when completed: break;
            case "back" when step > 1:
                if (w.BeforeStepNavigate(step, step - 1) is { } backVeto) return MapResult(backVeto, rq);
                step--;
                break;
            case "next" when step >= total:
                if (w.BeforeStepNavigate(step, completionTarget) is { } finishVeto) return MapResult(finishVeto, rq);
                return MapResult(w.Complete());
            case "next":
                if (w.BeforeStepNavigate(step, step + 1) is { } nextVeto) return MapResult(nextVeto, rq);
                w.OnNext(step, step + 1);
                step++;
                break;
            // "Skip" (Wizard.StepSkippable + WizardDisplay.Skip): moves on WITHOUT requiring the
            // step — never from the completion step, and not when the skip is Off/Disabled (a
            // disabled affordance cannot be forced from the client either).
            case "skip" when step <= lastPlain && w.StepSkippable(step) && w.Display.Skip.Enabled():
                if (w.BeforeStepNavigate(step, step + 1) is { } skipVeto) return MapResult(skipVeto, rq);
                w.OnNext(step, step + 1);
                step++;
                break;
            // Early completion (CompletionAvailableFromStep): offered beside Next from that step on.
            case "complete" when w.CompletionAvailableFromStep is { } from && step >= from && step < total:
                if (w.BeforeStepNavigate(step, completionTarget) is { } completeVeto)
                    return MapResult(completeVeto, rq);
                if (!resultStep) return MapResult(w.Complete());
                w.OnNext(step, total);
                step = total;
                break;
            // Drafts (IDraftable): the state is bound, never validated — a draft may be incomplete.
            case "saveDraft" or "saveAndClose" when wizard is IDraftable draftable:
                var toggle = rq.ActionId == "saveDraft" ? w.Display.SaveDraft : w.Display.SaveAndClose;
                if (!toggle.Enabled()) break;
                var saved = draftable.SaveDraft();
                if (rq.ActionId == "saveDraft") return MapResult(saved ?? new Message("Draft saved"), rq);
                var close = draftable.CloseDraft();
                return MapResult(new object[]
                {
                    saved as Message ?? new Message("Draft saved"),
                    UICommandDto.MarkAsClean(),
                    close as UICommandDto ?? UICommandDto.NavigateTo(close?.ToString() ?? "/"),
                }, rq);
            // The drawer step pager's jump-to-step: `_stepId` = the bullet id "step-N"; jump only
            // BACKWARD (to an already-visited step) so we never skip a step's validation forward.
            case "goToStep" when GoToStepTarget(rq) is { } t && t >= 1 && t < step:
                if (w.BeforeStepNavigate(step, t) is { } jumpVeto) return MapResult(jumpVeto, rq);
                step = t;
                break;
        }
        return FragmentResponse(w.WizardTitle ?? Title(type), _mapper.MapWizard(type, wizard, route, step), rq);
    }

    private static int? GoToStepTarget(RunActionRqDto rq)
    {
        if (!rq.Parameters.TryGetValue("_stepId", out var v)) return null;
        var s = v is JsonElement { ValueKind: JsonValueKind.String } je ? je.GetString() : v?.ToString();
        return s is not null && s.StartsWith("step-") && int.TryParse(s.AsSpan(5), out var n) ? n : null;
    }

    private static int StepOf(RunActionRqDto rq) =>
        rq.ComponentState.TryGetValue("__step", out var v) && v is JsonElement { ValueKind: JsonValueKind.Number } el
            ? el.GetInt32() : 1;
}
