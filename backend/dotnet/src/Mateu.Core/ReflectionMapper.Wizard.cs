using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Wizards (Java: Wizard + WizardButtonBuilder).
public sealed partial class ReflectionMapper
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

        var title = type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);
        var titleText = Client(new TextMetadataDto(title), null, []);
        var progressStyle = type.Find<WizardProgressAttribute>()?.Style;
        StepDto Bullet(int i) => new($"step-{i}", $"Step {i}", null,
            i < current ? "done" : i == current ? "current" : "upcoming");
        // [WizardProgress("steps")]: connected step bullets instead of the progress bar
        // (mirrors Java's @WizardProgress(WizardProgressStyle.STEPS)).
        var progress = progressStyle == "steps"
            ? Client(new ProgressStepsMetadataDto(Enumerable.Range(1, total).Select(Bullet).ToList()), "fieldId", [])
            : Client(new ProgressBarMetadataDto((double)current / total), "fieldId", []);
        var columns = FormColumns(type);
        var card = Client(new CardMetadataDto(Client(new FormLayoutMetadataDto
        {
            MaxColumns = columns,
            LabelsAside = LabelsAsideInference.LabelsAside(currentProps, columns, type, T),
        }, null, FormRows(fields, columns))), "fieldId", []);
        var back = Client(new ButtonMetadataDto("Back", "back") { Disabled = current == 1 }, null, []);
        var next = Client(new ButtonMetadataDto(current == total ? "Finish" : "Next", "next") { ButtonStyle = "Primary" }, null, []);
        var bar = Client(new HorizontalLayoutMetadataDto(), null, [back, next]);
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
            var main = Client(new VerticalLayoutMetadataDto { Spacing = true }, null, [titleText, card, bar]) with
                { Style = "flex: 1; min-width: 0;" };
            layout = Client(new HorizontalLayoutMetadataDto(), null, [main, rail]) with
                { Style = "align-items: flex-start; gap: 2rem; width: 100%;" };
        }
        else
        {
            layout = Client(new VerticalLayoutMetadataDto { Spacing = true }, null, [titleText, progress, card, bar]);
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
            Guid.NewGuid().ToString(), type.FullName!, route, [layout], initial, [], [], null, null, null)
        {
            PageType = PageTypeOf(type),
        };
    }
}
