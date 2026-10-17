import { css } from 'lit'
import { badge } from '@infra/ui/badgeStyles.ts'

/** The styles of mateu-field (moved out of the element, unchanged). */
export const mateuFieldStyles = css`
        /* the toggle stereotype: a native checkbox with role=switch (was a Polymer paper-toggle-button) */
        .mateu-switch { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
        .mateu-switch input { position: absolute; opacity: 0; width: 2.25rem; height: 1.25rem; margin: 0; cursor: pointer; }
        .mateu-switch .track { width: 2.25rem; height: 1.25rem; border-radius: 1rem; background: var(--lumo-contrast-30pct, #bbb);
            position: relative; transition: background .15s; }
        .mateu-switch .track::after { content: ''; position: absolute; top: .125rem; left: .125rem; width: 1rem; height: 1rem;
            border-radius: 50%; background: var(--lumo-base-color, #fff); transition: transform .15s; box-shadow: var(--mateu-switch-knob-shadow, 0 1px 2px rgba(0,0,0,.3)); }
        .mateu-switch input:checked + .track { background: var(--lumo-primary-color, #1676f3); }
        .mateu-switch input:checked + .track::after { transform: translateX(1rem); }
        .mateu-switch input:focus-visible + .track { box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct, #1676f380); }
        .mateu-switch input:disabled + .track { opacity: .5; }
        /* multi-valued @Searchable: the ids as chips, then «Add» */
        .searchable-multi {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--lumo-space-xs);
            min-height: var(--lumo-size-m);
        }
        .searchable-chip {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            padding: 2px var(--lumo-space-s);
            border-radius: var(--lumo-border-radius-l, 1em);
            background: var(--lumo-contrast-10pct);
            color: var(--lumo-body-text-color);
            font-size: var(--lumo-font-size-s);
            line-height: var(--lumo-line-height-s);
        }
        .searchable-chip vaadin-button {
            margin: 0;
            min-width: 0;
            padding: 0;
            height: auto;
        }
        ${badge}

        /* Fields fill the whole column width by default. Date, checkbox, numeric and money inputs
           are the exception — they keep their natural (narrower) width so a date/amount doesn't
           stretch across the column. (vaadin inputs default to a fixed width, hence the explicit
           width: 100% on the stretchy ones.) */
        :host {
            display: block;
            width: 100%;
        }
        :host vaadin-text-field,
        :host vaadin-text-area,
        :host vaadin-combo-box,
        :host vaadin-multi-select-combo-box,
        :host vaadin-select,
        :host vaadin-email-field,
        :host vaadin-password-field,
        :host vaadin-custom-field {
            width: 100%;
        }
        /* A field spanning several columns (host colspan attribute, set when colspan > 1) stretches
           every input — including the naturally-narrow date/numeric ones — to fill the columns. */
        :host([colspan]) vaadin-date-picker,
        :host([colspan]) vaadin-date-time-picker,
        :host([colspan]) vaadin-time-picker,
        :host([colspan]) vaadin-number-field,
        :host([colspan]) vaadin-integer-field {
            width: 100%;
        }

        /* Tree-select field wrapper (rendered without vaadin-custom-field — see the treeSelect
           branch). Its own label mimics the vaadin field label density. */
        .tree-field {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .tree-field__label {
            align-self: flex-start;
            font-size: var(--mateu-label-font-size, var(--lumo-font-size-s));
            line-height: var(--mateu-label-line-height, 1);
            padding-bottom: var(--mateu-label-padding-bottom, 7px);
            color: var(--lumo-secondary-text-color);
        }
        .tree-field__required {
            color: var(--lumo-required-field-indicator-color, var(--lumo-primary-text-color));
        }
        .tree-field__helper {
            padding-top: 0.25rem;
            font-size: var(--lumo-font-size-xs);
            color: var(--lumo-secondary-text-color);
        }

        .mateu-checkbox-group-multi-column::part(group-field) {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem 3rem;
        }

        /* Field-label density. Defaults reproduce the standard look; a page can compress all of
           them at once by setting the --mateu-label-* variables (e.g. via the @Compact preset). */
        vaadin-text-field::part(label),
        vaadin-text-area::part(label),
        vaadin-combo-box::part(label),
        vaadin-multi-select-combo-box::part(label),
        vaadin-select::part(label),
        vaadin-date-picker::part(label),
        vaadin-time-picker::part(label),
        vaadin-number-field::part(label),
        vaadin-email-field::part(label),
        vaadin-password-field::part(label),
        vaadin-custom-field::part(label) {
            font-size: var(--mateu-label-font-size, var(--lumo-font-size-s));
            padding-bottom: var(--mateu-label-padding-bottom, 7px);
            line-height: var(--mateu-label-line-height, 1.2);
            /* Let long labels wrap onto several lines instead of truncating with an ellipsis
               (e.g. "Tiempo esperando" / "Tipo hab. contratada" in a dense multi-column form). */
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            height: auto;
        }
  `
