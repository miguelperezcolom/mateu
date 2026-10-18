using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Wizards (Java: Wizard + WizardButtonBuilder).
internal sealed partial class ReflectionMapper
{
    public ServerSideComponentDto MapWizard(Type type, object instance, string route, int step)
    {
        var stepProps = EditableProperties(type)
            .Select(p => (p, step: p.Find<StepAttribute>()?.Step ?? 1))
            .ToList();
        var total = stepProps.Count == 0 ? 1 : stepProps.Max(x => x.step);
        var current = Math.Clamp(step, 1, total);
        var currentProps = stepProps.Where(x => x.step == current).Select(x => x.p).ToList();
        var fields = currentProps.Select(p => MapField(p, instance)).ToList();

        // Opt-in result step (Java's @WizardCompletionAction): the penultimate step's forward
        // button is the completion, the last step a read-only result with no navigation.
        var wizard = instance as Wizard;
        var completion = wizard?.CompletionActionLabel;
        var onResult = completion is not null && current == total;
        var title = wizard?.WizardTitle ?? type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);
        // The heading, progress, step form and buttons are laid out exactly as Java's
        // Wizard.component() (pinned by the conformance corpus, case "wizard").
        var titleText = Client(new TextMetadataDto(title) { Container = "h2" }, null, []) with { Style = "margin: 0;" };
        var progressStyle = type.Find<WizardProgressAttribute>()?.Style;
        StepDto Bullet(int i) => new($"step-{i}", wizard?.StepTitle(i) ?? $"Step {i}", null,
            i < current || onResult ? "done" : i == current ? "current" : "upcoming");
        // [WizardProgress("steps")]: connected step bullets instead of the progress bar
        // (mirrors Java's @WizardProgress(WizardProgressStyle.STEPS)).
        var progress = progressStyle == "steps"
            ? Client(new ProgressStepsMetadataDto(Enumerable.Range(1, total).Select(Bullet).ToList()), "fieldId", [])
                with { Style = "width: 100%;" }
            // Java's ProgressBar: value = the steps already done (0 on the first one), max = every
            // step, full on the result step; the current step's title as its text.
            : Client(new ProgressBarMetadataDto(onResult ? total : current - 1)
                { Max = total, Text = wizard?.StepTitle(current) }, null, []) with { Style = "width: 100%;" };
        // The current step's form: the regular section card of a form (Java's stepForm), under a
        // spacer Div.
        var card = Client(new DivMetadataDto(), null,
            [SectionCard(null, fields, formType: type, props: currentProps)]) with
            {
                Style = "width: 100%; margin-top: 1rem;",
            };
        // no Back on the first step: there is nowhere to go back to (Java's WizardButtonBuilder)
        // every wizard button is colour "normal" on the wire, like Java's (ButtonMapper's default)
        ComponentDto? back = current > 1
            ? Client(new ButtonMetadataDto("Back", "back") { Color = "normal" }, null, [])
            : null;
        var completing = completion is not null && current == total - 1;
        var nextLabel = completing ? completion! : current == total ? "Finish" : "Next";
        // the completion button dispatches the wizard's CompletionActionId (Java: the
        // @WizardCompletionAction method's name); "next" by default
        var nextId = completing ? wizard!.CompletionActionId : "next";
        var next = Client(new ButtonMetadataDto(nextLabel, nextId) { ButtonStyle = "primary", Color = "normal" }, null, []);
        // The transactional affordances (Java's WizardButtonBuilder), between Back and Next:
        // Skip on a skippable step, the draft buttons of an IDraftable wizard and the early
        // completion — each switchable through WizardDisplay (Off = absent, Disabled = inert).
        var barButtons = back is null ? new List<ComponentDto>() : [back];
        var extraActions = new List<ActionDto>();
        if (!onResult && wizard is not null)
        {
            var display = wizard.Display;
            var lastPlain = completion is not null ? total - 2 : total - 1;
            if (current <= lastPlain && wizard.StepSkippable(current) && display.Skip.Shown())
            {
                barButtons.Add(Client(new ButtonMetadataDto(T("Skip"), "skip")
                    { ButtonStyle = "tertiary", Disabled = !display.Skip.Enabled() }, "skip", []));
                extraActions.Add(new ActionDto("skip", ValidationRequired: false));
            }
            if (wizard is IDraftable)
            {
                if (display.SaveDraft.Shown())
                {
                    barButtons.Add(Client(new ButtonMetadataDto(T("Save"), "saveDraft")
                        { Disabled = !display.SaveDraft.Enabled() }, "saveDraft", []));
                    extraActions.Add(new ActionDto("saveDraft", ValidationRequired: false));
                }
                if (display.SaveAndClose.Shown())
                {
                    barButtons.Add(Client(new ButtonMetadataDto(T("Save and close"), "saveAndClose")
                        { Disabled = !display.SaveAndClose.Enabled() }, "saveAndClose", []));
                    extraActions.Add(new ActionDto("saveAndClose", ValidationRequired: false));
                }
            }
            // a user with nothing more to add can finish early, beside Next (not instead of it)
            var completionStep = completion is not null ? total - 1 : total;
            if (wizard.CompletionAvailableFromStep is { } from && current >= from && current < completionStep)
            {
                barButtons.Add(Client(new ButtonMetadataDto(T(completion ?? "Finish"), "complete"), "complete", []));
                extraActions.Add(new ActionDto("complete"));
            }
        }
        barButtons.Add(next);
        var bar = Client(new HorizontalLayoutMetadataDto { Justification = "END" }, null, onResult ? [] : barButtons);
        ComponentDto layout;
        if (progressStyle == "rail")
        {
            // [WizardProgress("rail")]: the Redwood Guided Process rail — the step form on the
            // left, a sticky right band with a big current|total counter over the vertical step
            // list (mirrors Java's WizardProgressStyle.RAIL).
            var counter = Client(new TextMetadataDto($"{current} | {total}"), null, []) with
                { Style = "font-size: 2rem; font-weight: 300; margin: 0 0 1rem; letter-spacing: .1em;" };
            var steps = Client(new ProgressStepsMetadataDto(
                Enumerable.Range(1, total).Select(Bullet).ToList(), Vertical: true), "fieldId", []);
            var rail = Client(new VerticalLayoutMetadataDto(), null, [counter, steps]) with
            {
                Style = "flex: 0 0 15rem; align-self: flex-start; position: sticky; top: 1rem;"
                    + " border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));"
                    + " padding-left: 1.5rem;",
            };
            var main = Client(new VerticalLayoutMetadataDto(), null,
                [Client(new VerticalLayoutMetadataDto(), null, [titleText, card, bar]) with { Style = "width: 100%" }]) with
                { Style = "flex: 1; min-width: 0;" };
            layout = Client(new HorizontalLayoutMetadataDto(), null, [main, rail]) with
                { Style = "align-items: flex-start; gap: 2rem; width: 100%;" };
        }
        else
        {
            layout = Client(new VerticalLayoutMetadataDto(), null, [titleText, progress, card, bar]) with { Style = "width: 100%" };
        }

        var initial = new Dictionary<string, object?> { ["__step"] = current };
        foreach (var (p, _) in stepProps)
            // Grid (list-of-rows) fields ride as row dicts and scalars keep their JSON type
            // (numbers/booleans as-is, dates ISO, enums by name — the grid-cell convention), so
            // every step field round-trips through the componentState (Java parity: the wizard
            // state is typed, not stringified).
            initial[Naming.CamelCase(p.Name)] = GridRowType(p) is { } rowType
                ? GridRows(p, rowType, instance)
                : CellValueOf(p.GetValue(instance));

        return new ServerSideComponentDto(
            // the current step's list fields advertise their row-editing actions (Java resolves the
            // list on the step the user is on: FieldCrudActionRunner.getViewModelClass)
            Guid.NewGuid().ToString(), type.FullName!, route, [layout], initial,
            // Next validates the step on the client first and Back leaves it as it is (Java's
            // Wizard.actions + its catch-all): unadvertised, neither did anything in the web client.
            [.. FieldActions(currentProps), .. extraActions,
                .. (onResult ? Array.Empty<ActionDto>()
                    : [new ActionDto("next", ValidationRequired: true), new ActionDto("back", ValidationRequired: false),
                        .. (completion is not null && current == total - 1 && wizard!.CompletionActionId != "next"
                            ? [new ActionDto(wizard.CompletionActionId, ValidationRequired: true)]
                            : Array.Empty<ActionDto>())])],
            // a wizard is a component tree in Java: the tree envelope's default container style
            [], "max-width:900px;margin: auto;", null, null)
        {
            PageType = PageTypeOf(type),
            // only the CURRENT step's constraints: the others are not on screen (Java's
            // WizardStepInspector)
            Validations = onResult ? [] : MapValidations(type, currentProps),
        };
    }
}
