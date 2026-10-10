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

        switch (rq.ActionId)
        {
            case "back": step = Math.Max(1, step - 1); break;
            case "next" when step >= total: return MapResult(((Wizard)wizard).Complete());
            case "next": ((Wizard)wizard).OnNext(step, step + 1); step++; break;
            // The drawer step pager's jump-to-step: `_stepId` = the bullet id "step-N"; jump only
            // BACKWARD (to an already-visited step) so we never skip a step's validation forward.
            case "goToStep" when GoToStepTarget(rq) is { } t && t >= 1 && t < step: step = t; break;
        }
        return FragmentResponse(Title(type), _mapper.MapWizard(type, wizard, route, step), rq);
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
