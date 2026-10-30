
import{A as e,D as t,E as n,F as r,I as i,L as a,M as o,R as s,a as c,c as l,d as u,f as d,i as f,j as p,k as m,l as h,n as g,o as _,p as v,r as y,s as b,t as x,u as S,w as C,x as w}from"./vendor-vaadin.js";import{O as T}from"./vendor-lit.js";import{s as E}from"./vendor.js";s(`vcf-date-range-picker-overlay`,T`
      [part="overlay"] {
        /*
        Width:
            date cell widths (added a couple more for presets)
          + month calendar side padding
          + year scroller width
        */
        width:
          calc(
              var(--lumo-size-m) * 9
            + var(--lumo-space-xs) * 2
            + 57px
          );
        height: 100%;
        max-height: calc(var(--lumo-size-m) * 14);
        overflow: hidden;
        -webkit-tap-highlight-color: transparent;
      }

      [part="overlay"] {
        flex-direction: column;
      }

      [part="content"] {
        padding: 0;
        height: 100%;
        overflow: hidden;
        -webkit-mask-image: none;
        mask-image: none;
      }

      @media (max-width: 420px), (max-height: 420px) {
        [part="overlay"] {
          width: 100vw;
          height: 70vh;
          max-height: 70vh;
        }
      }
      `,{include:[`lumo-menu-overlay`],moduleId:`lumo-vcf-date-range-picker-overlay`}),s(`vcf-date-range-picker-overlay-content`,T`
      :host {
        position: relative;
        background-color: transparent;
        /* Background for the year scroller, placed here as we are using a mask image on the actual years part */
        background-image: linear-gradient(var(--lumo-shade-5pct), var(--lumo-shade-5pct));
        background-size: 57px 100%;
        background-position: top right;
        background-repeat: no-repeat;
        cursor: default;
      }

      /* Month scroller */

      [part="months"] {
        /* Month calendar height:
              header height + margin-bottom
            + weekdays height + margin-bottom
            + date cell heights
            + small margin between month calendars
        */
        --vaadin-infinite-scroller-item-height:
          calc(
              var(--lumo-font-size-l) + var(--lumo-space-m)
            + var(--lumo-font-size-xs) + var(--lumo-space-s)
            + var(--lumo-size-m) * 6
            + var(--lumo-space-s)
          );
        --vaadin-infinite-scroller-buffer-offset: 20%;
        -webkit-mask-image: linear-gradient(transparent, #000 10%, #000 85%, transparent);
        mask-image: linear-gradient(transparent, #000 10%, #000 85%, transparent);
        position: relative;
        margin-right: 57px;
      }

      /* Year scroller */

      [part="years"] {
        /* TODO get rid of fixed magic number */
        --vaadin-infinite-scroller-buffer-width: 97px;
        width: 57px;
        height: auto;
        top: 0;
        bottom: 0;
        font-size: var(--lumo-font-size-s);
        box-shadow: inset 2px 0 4px 0 var(--lumo-shade-5pct);
        -webkit-mask-image: linear-gradient(transparent, #000 35%, #000 65%, transparent);
        mask-image: linear-gradient(transparent, #000 35%, #000 65%, transparent);
      }

      [part="year-number"],
      [part="year-separator"] {
        opacity: 0.5;
        transition: 0.2s opacity;
      }

      [part="years"]:hover [part="year-number"],
      [part="years"]:hover [part="year-separator"] {
        opacity: 1;
      }

      /* TODO unsupported selector */
      #scrollers {
        position: static;
        display: block;
      }

      /* TODO unsupported selector, should fix this in vcf-date-range-picker that it adapts to the
       * width of the year scroller */
      #scrollers[desktop] [part="months"] {
        right: auto;
      }

      /* Year scroller position indicator */
      [part="years"]::before {
        border: none;
        width: 1em;
        height: 1em;
        background-color: var(--lumo-base-color);
        background-image: linear-gradient(var(--lumo-tint-5pct), var(--lumo-tint-5pct));
        transform: translate(-75%, -50%) rotate(45deg);
        border-top-right-radius: calc(var(--lumo-border-radius-m) / 2);
        box-shadow: 2px -2px 6px 0 var(--lumo-shade-5pct);
        z-index: 1;
      }

      [part="year-number"],
      [part="year-separator"] {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50%;
        transform: translateY(-50%);
      }

      [part="years"] [part="year-separator"]::after {
        color: var(--lumo-disabled-text-color);
        content: "•";
      }

      /* Current year */

      [part="years"] [part="year-number"][current] {
        color: var(--lumo-primary-text-color);
      }

      /* Toolbar (footer) */

      [part="toolbar"] {
        padding: var(--lumo-space-s);
        box-shadow: 0 -1px 0 0 var(--lumo-contrast-10pct);
        border-bottom-left-radius: var(--lumo-border-radius-m);
        margin-right: 0px;
      }

      [part="toolbar"][hidden] {
        display:none;
      }

      @supports (mask-image: linear-gradient(#000, #000)) or (-webkit-mask-image: linear-gradient(#000, #000)) {
        [part="toolbar"] {
          box-shadow: none;
        }
      }

      [part="toolbar"] [part$="button"] {
        margin: 0;
      }

      /* Narrow viewport mode (fullscreen) */

      :host([fullscreen]) [part="toolbar"] {
        order: -3;
        background-color: var(--lumo-base-color);
      }

      :host([fullscreen]) [part="overlay-header"] {
        order: -2;
        height: var(--lumo-size-m);
        padding: var(--lumo-space-s);
        left: 0;
        right: 0;
        justify-content: end;
        padding-top: 0px;
        padding-right: 3px;
        padding-bottom: 1px;
        height: 0px;
      }

      :host([fullscreen]) [part="toggle-button"],
      :host([fullscreen]) [part="clear-button"],
      [part="overlay-header"] [part="label"] {
        display: none;
      }

      /* Very narrow screen (year scroller initially hidden) */

      [part="years-toggle-button"] {
        font-size: var(--lumo-font-size-s);
        position: relative;
        top: -7px;
        right: auto;
        display: flex;
        align-items: center;
        height: var(--lumo-size-s);
        padding: 0 0.5em;
        border-radius: var(--lumo-border-radius-m);
        z-index: 3;
        color: var(--lumo-primary-text-color);
        font-weight: 500;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      :host([years-visible]) [part="years-toggle-button"] {
        background-color: var(--lumo-primary-color);
        color: var(--lumo-primary-contrast-color);
      }

      [part="years-toggle-button"]::before {
        content: none;
      }

      /* TODO magic number (same as used for iron-media-query in vcf-date-range-picker-overlay-content) */
      @media screen and (max-width: 374px) {
        :host {
          background-image: none;
        }

        [part="years"] {
          background-color: var(--lumo-shade-5pct);
        }

        [part="toolbar"],
        [part="months"] {
          margin-right: 0;
        }

        /* TODO make date-range-picker adapt to the width of the years part */
        [part="years"] {
          --vaadin-infinite-scroller-buffer-width: 90px;
          width: 50px;
        }

        :host([years-visible]) [part="months"] {
          padding-left: 50px;
        }
      }
    `,{moduleId:`lumo-vcf-date-range-picker-overlay-content`}),s(`vcf-date-range-month-calendar`,T`
      :host {
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        font-size: var(--lumo-font-size-m);
        color: var(--lumo-body-text-color);
        text-align: center;
        padding: 0 var(--lumo-space-xs);
      }

      /* Month header */

      [part="month-header"] {
        color: var(--lumo-header-text-color);
        font-size: var(--lumo-font-size-l);
        line-height: 1;
        font-weight: 500;
        margin-bottom: var(--lumo-space-m);
      }

      /* Week days and numbers */

      [part="weekdays"],
      [part="weekday"],
      [part="week-numbers"] {
        font-size: var(--lumo-font-size-xs);
        line-height: 1;
        color: var(--lumo-tertiary-text-color);
      }

      [part="weekdays"] {
        margin-bottom: var(--lumo-space-s);
      }

      /* TODO should have part="week-number" for the cell in weekdays-container */
      [part="weekday"]:empty,
      [part="week-numbers"] {
        width: var(--lumo-size-xs);
      }

      /* Date and week number cells */

      [part="date"],
      [part="week-number"] {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: var(--lumo-size-m);
        position: relative;
      }

      [part="date"] {
        transition: color 0.1s;
      }

      /* Today date */

      [part="date"][today] {
        color: var(--lumo-primary-text-color);
      }

      /* Focused date */

      [part="date"]::before {
        content: "";
        position: absolute;
        z-index: -1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        min-width: 2em;
        min-height: 2em;
        width: 80%;
        height: 80%;
        max-height: 100%;
        max-width: 100%;
        border-radius: var(--lumo-border-radius-m);
      }

      [part="date"][focused]::before {
        box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
      }

      :host(:not([focused])) [part="date"][focused]::before {
        animation: vcf-date-range-picker-month-calendar-focus-date 1.4s infinite;
      }

      @keyframes vcf-date-range-picker-month-calendar-focus-date {
        50% {
          box-shadow: 0 0 0 2px transparent;
        }
      }

      /* TODO should not rely on the role attribute */
      [part="date"][role="button"]:not([disabled]):not([selected]):hover::before {
        background-color: var(--lumo-primary-color-10pct);
      }

      [part="date"][selected] {
        color: var(--lumo-primary-contrast-color);
      }

      [part="date"][selected]::before {
        background-color: var(--lumo-primary-color-50pct);
        border-radius: 0px;
        min-width: 0px;
        width: 100%;
      }

      [part="date"][start] {
        color: var(--lumo-primary-contrast-color);
      }

      [part="date"][start]::before {
        background-color: var(--lumo-primary-color);
        border-radius: var(--lumo-border-radius-m) 0px 0px var(--lumo-border-radius-m);
        padding-left: 0px;
        padding-right: 0px;
      }

      [part="date"][end] {
        color: var(--lumo-primary-contrast-color);
      }

      [part="date"][end]::before {
        background-color: var(--lumo-primary-color);
        border-radius: 0px var(--lumo-border-radius-m) var(--lumo-border-radius-m) 0px;
        padding-left: 0px;
        padding-right: 0px;
      }

      [part="date"][disabled] {
        color: var(--lumo-disabled-text-color);
      }

      @media (pointer: coarse) {
        [part="date"][role="button"]:not([disabled]):active::before {
          display: block;
        }

        [part="date"][selected]::before {
          box-shadow: none;
        }
      }

      /* Disabled */

      :host([disabled]) * {
        color: var(--lumo-disabled-text-color) !important;
      }
      `,{moduleId:`lumo-vcf-date-range-month-calendar`});var D=document.createElement(`template`);D.innerHTML=`
  <style>
    @keyframes vcf-date-range-picker-month-calendar-focus-date {
      50% {
        box-shadow: 0 0 0 2px transparent;
      }
    }
  </style>
  `,document.head.appendChild(D.content),s(`vcf-date-range-picker`,T`
      :host {
        outline: none;
      }

      [part="dash"] {
        display: inline-block;
        align-self: flex-end;
        width: 26px;
      }

      [part="toggle-button"]::before {
        content: var(--lumo-icons-calendar);
      }

      [part="clear-button"]::before {
        content: var(--lumo-icons-cross);
      }

      @media (max-width: 420px), (max-height: 420px) {
        [part="overlay-content"] {
          height: 70vh;
        }
      }
      `,{include:[`lumo-field-button`],moduleId:`lumo-vcf-date-range-picker`}),s(`vcf-date-range-picker-text-field`,T`
      :not(*):placeholder-shown, /* to prevent broken styles on IE */
      :host([dir="rtl"]) [part="value"]:placeholder-shown,
      :host([dir="rtl"]) [part="input-field"] ::slotted(input:placeholder-shown) {
        --_lumo-text-field-overflow-mask-image: none;
      }

      :host([dir="rtl"]) [part="value"],
      :host([dir="rtl"]) [part="input-field"] ::slotted(input) {
        --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent, #000 1.25em);
      }

      [part="label"] {
        max-width: 100%;
        overflow: visible;
      }

      [part="error-message"] {
        width: 100%;
        max-width: 100%;
        overflow: visible;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      [part="value"] {
        --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent, #000 0.25em);
      }
      
      :host(.dash) [part="input-field"] {
        border-radius: 0;
      }
      :host(:not([disabled]):not([invalid]):not([readonly]).dash) [part="input-field"] {
        background-color: var(--lumo-contrast-10pct);
      }

      :host(.dash) [part="input-field"]::after {
        border: none;
      }

      :host([id="startInput"]) [part="input-field"] {
        padding-right:0px;
      }
      :host([id="endInput"][focus-ring]) [part="value"] {
        margin-left:-2px;
      }
      :host([id="startInput"]) [part="value"] {
        padding-right:0px;
      }
      :host([id="endInput"]) [part="input-field"] {
        padding-left:0px;
      }
      :host([id="endInput"]) [part="value"] {
        padding-left:0px;
      }
      `,{moduleId:`lumo-vcf-date-range-picker-text-field`}),s(`vcf-date-range-picker-text-field`,T`
      :host([dir="rtl"]) [part="input-field"] {
        direction: ltr;
      }

      :host([dir="rtl"]) [part="value"]::placeholder {
        direction: rtl;
        text-align: left;
      }

      :host([dir="rtl"]) [part="input-field"] ::slotted(input)::placeholder {
        direction: rtl;
        text-align: left;
      }

      :host([dir="rtl"]) [part="value"]:-ms-input-placeholder,
      :host([dir="rtl"]) [part="input-field"] ::slotted(input):-ms-input-placeholder {
        direction: rtl;
        text-align: left;
      }

      :host(.endDate) [part="input-field"] {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
      }
      :host(.startDate) [part="input-field"] {
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
      }
      ::slotted(input) {
        --_lumo-text-field-overflow-mask-image: none;
      }
      `,{moduleId:`vcf-date-range-picker-text-field-styles`});var O=class extends C{static get is(){return`vcf-date-range-picker-text-field`}_onClearButtonClick(e){e.preventDefault(),this.inputElement.focus(),this.__clear()}__clear(){this.clear();let e=new Event(`input`,{bubbles:!0,composed:!0});e.__fromClearButton=!0;let t=new Event(`change`,{bubbles:!0});t.__fromClearButton=!0,this.inputElement.dispatchEvent(e),this.inputElement.dispatchEvent(t)}};customElements.define(O.is,O);function k(e){var t=e.getDay();t===0&&(t=7);var n=4-t,r=new Date(e.getTime()+n*24*3600*1e3),i=new Date(0,0);i.setFullYear(r.getFullYear());var a=r.getTime()-i.getTime(),o=Math.round(a/864e5);return Math.floor(o/7+1)}function A(e,t){return e instanceof Date&&t instanceof Date&&e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function j(e,t,n){return e instanceof Date&&t instanceof Date&&n instanceof Date&&e.getTime()>=t.getTime()&&e.getTime()<=n.getTime()}function M(e,t,n){return(!t||e>=t)&&(!n||e<=n)}function N(e,t){return t.filter(e=>e!==void 0).reduce((t,n)=>n?t?Math.abs(e.getTime()-n.getTime())<Math.abs(t.getTime()-e.getTime())?n:t:n:t)}function P(e){return{day:e.getDate(),month:e.getMonth(),year:e.getFullYear()}}var F=class extends a(b(u)){static get template(){return d`
    <style>
      :host {
        display: block;
      }

      [part="weekdays"],
      #days {
        display: flex;
        flex-wrap: wrap;
        flex-grow: 1;
      }

      #days-container,
      #weekdays-container {
        display: flex;
      }

      [part="week-numbers"] {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-shrink: 0;
      }

      [part="week-numbers"][hidden],
      [part="weekday"][hidden] {
        display: none;
      }

      [part="weekday"],
      [part="date"] {
        /* Would use calc(100% / 7) but it doesn't work nice on IE */
        width: 14.285714286%;
      }

      [part="weekday"]:empty,
      [part="week-numbers"] {
        width: 12.5%;
        flex-shrink: 0;
      }
    </style>

    <div part="month-header" role="heading">[[_getTitle(month, i18n.monthNames)]]</div>
    <div id="monthGrid" on-tap="_handleTap" on-touchend="_preventDefault" on-touchstart="_onMonthGridTouchStart">
      <div id="weekdays-container">
        <div hidden$="[[!_showWeekSeparator(showWeekNumbers, i18n.firstDayOfWeek)]]" part="weekday"></div>
        <div part="weekdays">
          <template is="dom-repeat" items="[[_getWeekDayNames(i18n.weekdays, i18n.weekdaysShort, showWeekNumbers, i18n.firstDayOfWeek)]]">
            <div part="weekday" role="heading" aria-label$="[[item.weekDay]]">[[item.weekDayShort]]</div>
          </template>
        </div>
      </div>
      <div id="days-container">
        <div part="week-numbers" hidden$="[[!_showWeekSeparator(showWeekNumbers, i18n.firstDayOfWeek)]]">
          <template is="dom-repeat" items="[[_getWeekNumbers(_days)]]">
            <div part="week-number" role="heading" aria-label$="[[i18n.week]] [[item]]">[[item]]</div>
          </template>
        </div>
        <div id="days">
          <template is="dom-repeat" items="[[_days]]">
            <div
                part="date"
                today$="[[_isToday(item)]]"
                selected$="[[_dateBetween(item, selectedStartDate, selectedEndDate)]]"
                start$="[[_dateEquals(item, selectedStartDate)]]"
                end$="[[_dateEquals(item, selectedEndDate)]]"
                focused$="[[_dateEquals(item, focusedDate)]]"
                class$="[[_calculateClassNames(item)]]"
                date="[[item]]"
                disabled$="[[!_dateAllowed(item, minDate, maxDate)]]"
                role$="[[_getRole(item)]]"
                aria-label$="[[_getAriaLabel(item)]]"
                aria-disabled$="[[_getAriaDisabled(item, minDate, maxDate)]]">[[_getDate(item)]]</div>
          </template>
        </div>
      </div>
    </div>
    `}static get is(){return`vcf-date-range-month-calendar`}static get properties(){return{month:{type:Date,value:new Date},selectedStartDate:{type:Date,notify:!0},selectedEndDate:{type:Date,notify:!0},selectingStartDate:{type:Boolean,value:!0},classNamesForDates:{type:String,notify:!0},_classNamesForDates:{type:Object,value:{}},focusedDate:Date,showWeekNumbers:{type:Boolean,value:!1},i18n:{type:Object},ignoreTaps:Boolean,_notTapping:Boolean,minDate:{type:Date,value:null},maxDate:{type:Date,value:null},_days:{type:Array,computed:`_getDays(month, i18n.firstDayOfWeek, minDate, maxDate)`},disabled:{type:Boolean,reflectToAttribute:!0,computed:`_isDisabled(month, minDate, maxDate)`}}}static get observers(){return[`_showWeekNumbersChanged(showWeekNumbers, i18n.firstDayOfWeek)`,`_classNamesForDatesChanged(classNamesForDates)`]}_dateBetween(e,t,n){return j(e,t,n)}_dateEquals(e,t){return A(e,t)}_dateAllowed(e,t,n){return M(e,t,n)}_isDisabled(e,t,n){var r=new Date(0,0);r.setFullYear(e.getFullYear()),r.setMonth(e.getMonth()),r.setDate(1);var i=new Date(0,0);return i.setFullYear(e.getFullYear()),i.setMonth(e.getMonth()+1),i.setDate(0),t&&n&&t.getMonth()===n.getMonth()&&t.getMonth()===e.getMonth()&&n.getDate()-t.getDate()>=0?!1:!this._dateAllowed(r,t,n)&&!this._dateAllowed(i,t,n)}_getTitle(e,t){if(e!==void 0&&t!==void 0)return this.i18n.formatTitle(t[e.getMonth()],e.getFullYear())}_onMonthGridTouchStart(){this._notTapping=!1,setTimeout(()=>this._notTapping=!0,300)}_dateAdd(e,t){e.setDate(e.getDate()+t)}_applyFirstDayOfWeek(e,t){if(e!==void 0&&t!==void 0)return e.slice(t).concat(e.slice(0,t))}_getWeekDayNames(e,t,n,r){if(e!==void 0&&t!==void 0&&n!==void 0&&r!==void 0)return e=this._applyFirstDayOfWeek(e,r),t=this._applyFirstDayOfWeek(t,r),e=e.map((e,n)=>({weekDay:e,weekDayShort:t[n]})),e}_getDate(e){return e?e.getDate():``}_showWeekNumbersChanged(e,t){e&&t===1?this.setAttribute(`week-numbers`,``):this.removeAttribute(`week-numbers`)}_classNamesForDatesChanged(e){this._classNamesForDates=JSON.parse(e)}_calculateClassNames(e){var t=``;for(let[n,r]of Object.entries(this._classNamesForDates))r.forEach(function(r,i){var a=this._parseDate(r);this._dateEquals(e,a)&&(t=t+` `+n)}.bind(this));return t}_parseDate(e){var t=/^([-+]\d{1}|\d{2,4}|[-+]\d{6})-(\d{1,2})-(\d{1,2})$/.exec(e);if(t){var n=new Date(0,0);return n.setFullYear(parseInt(t[1],10)),n.setMonth(parseInt(t[2],10)-1),n.setDate(parseInt(t[3],10)),n}}_showWeekSeparator(e,t){return e&&t===1}_isToday(e){return this._dateEquals(new Date,e)}_getDays(e,t){if(e!==void 0&&t!==void 0){var n=new Date(0,0);for(n.setFullYear(e.getFullYear()),n.setMonth(e.getMonth()),n.setDate(1);n.getDay()!==t;)this._dateAdd(n,-1);for(var r=[],i=n.getMonth(),a=e.getMonth();n.getMonth()===a||n.getMonth()===i;)r.push(n.getMonth()===a?new Date(n.getTime()):null),this._dateAdd(n,1);return r}}_getWeekNumber(e,t){if(e!==void 0&&t!==void 0)return e||=t.reduce((e,t)=>!e&&t?t:e),k(e)}_getWeekNumbers(e){return e.map(t=>this._getWeekNumber(t,e)).filter((e,t,n)=>n.indexOf(e)===t)}_handleTap(e){!this.ignoreTaps&&!this._notTapping&&e.target.date&&!e.target.hasAttribute(`disabled`)&&(this.selectingStartDate?this.selectedStartDate=e.target.date:this.selectedEndDate=e.target.date,this.dispatchEvent(new CustomEvent(`date-tap`,{bubbles:!0,composed:!0})))}_preventDefault(e){e.preventDefault()}_getRole(e){return e?`button`:`presentation`}_getAriaLabel(e){if(!e)return``;var t=this._getDate(e)+` `+this.i18n.monthNames[e.getMonth()]+` `+e.getFullYear()+`, `+this.i18n.weekdays[e.getDay()];return this._isToday(e)&&(t+=`, `+this.i18n.today),t}_getAriaDisabled(e,t,n){if(e!==void 0&&t!==void 0&&n!==void 0)return this._dateAllowed(e,t,n)?`false`:`true`}};customElements.define(F.is,F);var I=class e extends u{static get template(){return d`
      <style>
        :host {
          display: block;
          overflow: hidden;
          height: 500px;
        }

        #scroller {
          position: relative;
          height: 100%;
          overflow: auto;
          outline: none;
          margin-right: -40px;
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: none;
          overflow-x: hidden;
        }

        #scroller.notouchscroll {
          -webkit-overflow-scrolling: auto;
        }

        #scroller::-webkit-scrollbar {
          display: none;
        }

        .buffer {
          position: absolute;
          width: var(--vaadin-infinite-scroller-buffer-width, 100%);
          box-sizing: border-box;
          padding-right: 40px;
          top: var(--vaadin-infinite-scroller-buffer-offset, 0);
          animation: fadein 0.2s;
        }

        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>

      <div id="scroller" on-scroll="_scroll">
        <div class="buffer"></div>
        <div class="buffer"></div>
        <div id="fullHeight"></div>
      </div>
    </template>
  </dom-module>
  `}static get is(){return`vcf-date-range-infinite-scroller`}static get properties(){return{bufferSize:{type:Number,value:20},_initialScroll:{value:5e5},_initialIndex:{value:0},_buffers:Array,_preventScrollEvent:Boolean,_mayHaveMomentum:Boolean,_initialized:Boolean,active:{type:Boolean,observer:`_activated`}}}ready(){super.ready(),this._buffers=Array.prototype.slice.call(this.root.querySelectorAll(`.buffer`)),this.$.fullHeight.style.height=this._initialScroll*2+`px`;var e=this.querySelector(`template`);this._TemplateClass=c(e,this,{forwardHostProp:function(e,t){e!==`index`&&this._buffers.forEach(n=>{[].forEach.call(n.children,n=>{n._itemWrapper.instance[e]=t})})}}),navigator.userAgent.toLowerCase().indexOf(`firefox`)>-1&&(this.$.scroller.tabIndex=-1)}_activated(e){e&&!this._initialized&&(this._createPool(),this._initialized=!0)}_finishInit(){this._initDone||=(this._buffers.forEach(e=>{[].forEach.call(e.children,e=>this._ensureStampedInstance(e._itemWrapper))},this),this._buffers[0].translateY||this._reset(),!0)}_translateBuffer(e){var t=+!!e;this._buffers[t].translateY=this._buffers[+!t].translateY+this._bufferHeight*(t?-1:1),this._buffers[t].style.transform=`translate3d(0, `+this._buffers[t].translateY+`px, 0)`,this._buffers[t].updated=!1,this._buffers.reverse()}_scroll(){if(!this._scrollDisabled){var e=this.$.scroller.scrollTop;(e<this._bufferHeight||e>this._initialScroll*2-this._bufferHeight)&&(this._initialIndex=~~this.position,this._reset());var t=this.root.querySelector(`.buffer`).offsetTop,n=e>this._buffers[1].translateY+this.itemHeight+t,r=e<this._buffers[0].translateY+this.itemHeight+t;(n||r)&&(this._translateBuffer(r),this._updateClones()),this._preventScrollEvent||(this.dispatchEvent(new CustomEvent(`custom-scroll`,{bubbles:!1,composed:!0})),this._mayHaveMomentum=!0),this._preventScrollEvent=!1,this._debouncerScrollFinish=S.debounce(this._debouncerScrollFinish,v.after(200),()=>{var e=this.$.scroller.getBoundingClientRect();!this._isVisible(this._buffers[0],e)&&!this._isVisible(this._buffers[1],e)&&(this.position=this.position)})}}set position(e){this._preventScrollEvent=!0,e>this._firstIndex&&e<this._firstIndex+this.bufferSize*2?this.$.scroller.scrollTop=this.itemHeight*(e-this._firstIndex)+this._buffers[0].translateY:(this._initialIndex=~~e,this._reset(),this._scrollDisabled=!0,this.$.scroller.scrollTop+=e%1*this.itemHeight,this._scrollDisabled=!1),this._mayHaveMomentum&&(this.$.scroller.classList.add(`notouchscroll`),this._mayHaveMomentum=!1,setTimeout(()=>{this.$.scroller.classList.remove(`notouchscroll`)},10))}get position(){return(this.$.scroller.scrollTop-this._buffers[0].translateY)/this.itemHeight+this._firstIndex}get itemHeight(){if(!this._itemHeightVal){window.ShadyCSS&&window.ShadyCSS.nativeCss||this.updateStyles();let e=window.ShadyCSS?window.ShadyCSS.getComputedStyleValue(this,`--vaadin-infinite-scroller-item-height`):getComputedStyle(this).getPropertyValue(`--vaadin-infinite-scroller-item-height`),t=`background-position`;this.$.fullHeight.style.setProperty(t,e);let n=getComputedStyle(this.$.fullHeight).getPropertyValue(t);this.$.fullHeight.style.removeProperty(t),this._itemHeightVal=parseFloat(n)}return this._itemHeightVal}get _bufferHeight(){return this.itemHeight*this.bufferSize}_reset(){this._scrollDisabled=!0,this.$.scroller.scrollTop=this._initialScroll,this._buffers[0].translateY=this._initialScroll-this._bufferHeight,this._buffers[1].translateY=this._initialScroll,this._buffers.forEach(e=>{e.style.transform=`translate3d(0, `+e.translateY+`px, 0)`}),this._buffers[0].updated=this._buffers[1].updated=!1,this._updateClones(!0),this._debouncerUpdateClones=S.debounce(this._debouncerUpdateClones,v.after(200),()=>{this._buffers[0].updated=this._buffers[1].updated=!1,this._updateClones()}),this._scrollDisabled=!1}_createPool(){var t=this.getBoundingClientRect();this._buffers.forEach(n=>{for(var r=0;r<this.bufferSize;r++){let r=document.createElement(`div`);r.style.height=this.itemHeight+`px`,r.instance={};let i=`vaadin-infinite-scroller-item-content-`+(e._contentIndex=e._contentIndex+1||0),a=document.createElement(`slot`);a.setAttribute(`name`,i),a._itemWrapper=r,n.appendChild(a),r.setAttribute(`slot`,i),this.appendChild(r),setTimeout(()=>{this._isVisible(r,t)&&this._ensureStampedInstance(r)},1)}},this),setTimeout(()=>{_(this,this._finishInit.bind(this))},1)}_ensureStampedInstance(e){if(!e.firstElementChild){var t=e.instance;e.instance=new this._TemplateClass({}),e.appendChild(e.instance.root),Object.keys(t).forEach(n=>{e.instance.set(n,t[n])})}}_updateClones(e){this._firstIndex=~~((this._buffers[0].translateY-this._initialScroll)/this.itemHeight)+this._initialIndex;var t=e?this.$.scroller.getBoundingClientRect():void 0;this._buffers.forEach((n,r)=>{if(!n.updated){var i=this._firstIndex+this.bufferSize*r;[].forEach.call(n.children,(n,r)=>{let a=n._itemWrapper;(!e||this._isVisible(a,t))&&(a.instance.index=i+r)}),n.updated=!0}},this)}_isVisible(e,t){var n=e.getBoundingClientRect();return n.bottom>t.top&&n.top<t.bottom}};customElements.define(I.is,I),s(`vcf-date-range-picker-overlay`,T`
      :host {
        align-items: flex-start;
        justify-content: flex-start;
      }

      :host([bottom-aligned]) {
        justify-content: flex-end;
      }

      :host([right-aligned]) {
        align-items: flex-end;
      }

      :host([dir="rtl"]) {
        align-items: flex-end;
      }

      :host([dir="rtl"][right-aligned]) {
        align-items: flex-start;
      }

      [part="overlay"] {
        display: flex;
        flex: auto;
        width: auto;
      }

      [part~="content"] {
        flex: auto;
      }
      `,{moduleId:`vcf-date-range-picker-overlay-styles`});var L=class extends a(i(b(u))){static get template(){return d`
    <style>
      :host {
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 100%;
        outline: none;
        background: #fff;
      }

      [part="overlay-header"] {
        display: flex;
        flex-shrink: 0;
        flex-wrap: nowrap;
        align-items: center;
      }

      :host(:not([fullscreen])) [part="overlay-header"] {
        display: none;
      }

      [part="label"] {
        flex-grow: 1;
      }

      [part="clear-button"]:not([showclear]) {
        display: none;
      }

      [part="years-toggle-button"] {
        display: flex;
      }

      [part="overlay-header"][desktop] {
        display: none;
      }

      :host(:not([years-visible])) [part="years-toggle-button"]::before {
        transform: rotate(180deg);
      }

      :host([fullscreen]) {
        flex-direction: column-reverse;
      }

      #scrollers {
        display: flex;
        height: 100%;
        width: 100%;
        position: relative;
        overflow: hidden;
      }

      [part="months"],
      [part="years"] {
        height: 100%;
      }

      [part="months"] {
        --vaadin-infinite-scroller-item-height: 270px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        min-width: 250px;
      }

      #scrollers[desktop] [part="months"] {
        right: 50px;
        transform: none !important;
      }

      [part="years"] {
        --vaadin-infinite-scroller-item-height: 80px;
        width: 50px;
        position: absolute;
        right: 0;
        transform: translateX(100%);
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        /* Center the year scroller position. */
        --vaadin-infinite-scroller-buffer-offset: 50%;
      }

      #scrollers[desktop] [part="years"] {
        position: absolute;
        transform: none !important;
      }

      [part="years"]::before {
        content: '';
        display: block;
        background: transparent;
        width: 0;
        height: 0;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        border-width: 6px;
        border-style: solid;
        border-color: transparent;
        border-left-color: #000;
      }

      :host(.animate) [part="months"],
      :host(.animate) [part="years"] {
        transition: all 200ms;
      }

      [part="toolbar"] {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        z-index: 2;
        flex-shrink: 0;
        flex-direction: column;
        margin-right: 0px;
      }

      :host([fullscreen]) [part="toolbar"] {
        flex-direction: row;
        flex-wrap: wrap;
      }

      [part~="overlay-header"]:not([desktop]) {
        padding-bottom: 40px;
      }

      [part~="years-toggle-button"] {
        position: absolute;
        top: auto;
        right: 8px;
        bottom: 0;
        z-index: 1;
        padding: 8px;
      }

      #announcer {
        display: inline-block;
        position: fixed;
        clip: rect(0, 0, 0, 0);
        clip-path: inset(100%);
      }
    </style>

    <div id="announcer" role="alert" aria-live="polite">
      [[i18n.calendar]]
    </div>

    <div part="overlay-header" on-touchend="_preventDefault" desktop$="[[_desktopMode]]" aria-hidden="true">
      <div part="label">[[_formatDisplayed(selectedStartDate, i18n.formatDate, label)]]</div>
      <div part="clear-button" on-tap="_clear" showclear$="[[_showClear(selectedStartDate, selectedEndDate)]]"></div>
      <div part="toggle-button" on-tap="_cancel"></div>

      <div part="years-toggle-button" desktop$="[[_desktopMode]]" on-tap="_toggleYearScroller" aria-hidden="true">
        [[_yearAfterXMonths(_visibleMonthIndex)]]
      </div>
    </div>
    <div on-touchend="_preventDefault" role="toolbar" part="toolbar" id="toolbarDiv" hidden="[[hideSidePanel]]">
      <vaadin-button id="todayButton" theme="tertiary" part="today-button" disabled="[[!_isTodayAllowed(minDate, maxDate)]]" on-tap="_onTodayTap">
        [[i18n.today]]
      </vaadin-button>
      <vaadin-button id="yesterdayButton" theme="tertiary" part="preset-button" on-tap="_onYesterdayTap">
        [[i18n.yesterday]]
      </vaadin-button>
      <vaadin-button id="thisWeekButton" theme="tertiary" part="preset-button" on-tap="_onThisWeekTap">
        [[i18n.thisWeek]]
      </vaadin-button>
      <vaadin-button id="lastWeekButton" theme="tertiary" part="preset-button" on-tap="_onLastWeekTap">
        [[i18n.lastWeek]]
      </vaadin-button>
      <vaadin-button id="thisMonthButton" theme="tertiary" part="preset-button" on-tap="_onThisMonthTap">
        [[i18n.thisMonth]]
      </vaadin-button>
      <vaadin-button id="lastMonthButton" theme="tertiary" part="preset-button" on-tap="_onLastMonthTap">
        [[i18n.lastMonth]]
      </vaadin-button>
      <vaadin-button id="thisYearButton" theme="tertiary" part="preset-button" on-tap="_onThisYearTap">
        [[i18n.thisYear]]
      </vaadin-button>
      <vaadin-button id="lastYearButton" theme="tertiary" part="preset-button" on-tap="_onLastYearTap">
        [[i18n.lastYear]]
      </vaadin-button>
      <vaadin-button id="cancelButton" theme="tertiary" part="cancel-button" on-tap="_cancel">
        [[i18n.cancel]]
      </vaadin-button>
    </div>

    <div id="scrollers" desktop$="[[_desktopMode]]" on-track="_track">
      <vcf-date-range-infinite-scroller id="monthScroller" on-custom-scroll="_onMonthScroll" on-touchstart="_onMonthScrollTouchStart" buffer-size="3" active="[[initialPosition]]" part="months">
        <template>
          <vcf-date-range-month-calendar
            i18n="[[i18n]]"
            month="[[_dateAfterXMonths(index)]]"
            selected-start-date="{{selectedStartDate}}"
            selected-end-date="{{selectedEndDate}}"
            selecting-start-date="{{selectingStartDate}}"
            class-names-for-dates="[[classNamesForDatesString]]"
            focused-date="[[focusedDate]]"
            ignore-taps="[[_ignoreTaps]]"
            show-week-numbers="[[showWeekNumbers]]"
            min-date="[[minDate]]"
            max-date="[[maxDate]]"
            focused$="[[_focused]]"
            part="month"
            theme$="[[theme]]">
          </vcf-date-range-month-calendar>
        </template>
      </vcf-date-range-infinite-scroller>
      <vcf-date-range-infinite-scroller id="yearScroller" on-tap="_onYearTap" on-custom-scroll="_onYearScroll" on-touchstart="_onYearScrollTouchStart" buffer-size="12" active="[[initialPosition]]" part="years">
        <template>
          <div part="year-number" role="button" current$="[[_isCurrentYear(index)]]" selected$="[[_isSelectedYear(index, selectedStartDate)]]">
            [[_yearAfterXYears(index)]]
          </div>
          <div part="year-separator" aria-hidden="true"></div>
        </template>
      </vcf-date-range-infinite-scroller>
    </div>


    <iron-media-query query="(min-width: 375px)" query-matches="{{_desktopMode}}"></iron-media-query>
    `}static get is(){return`vcf-date-range-picker-overlay-content`}static get properties(){return{selectedStartDate:{type:Date,notify:!0},selectedEndDate:{type:Date,notify:!0},selectingStartDate:{type:Boolean,value:!0,notify:!0},hideSidePanel:{type:Boolean,value:!1,reflectToAttribute:!0},focusedDate:{type:Date,notify:!0,observer:`_focusedDateChanged`},classNamesForDatesString:{type:String,notify:!0},classNamesForDates:{type:Object,value:{},notify:!0},_focusedMonthDate:Number,initialPosition:{type:Date,observer:`_initialPositionChanged`},_originDate:{value:new Date},_visibleMonthIndex:Number,_desktopMode:Boolean,_translateX:{observer:`_translateXChanged`},_yearScrollerWidth:{value:50},i18n:{type:Object},showWeekNumbers:{type:Boolean},_ignoreTaps:Boolean,_notTapping:Boolean,minDate:Date,maxDate:Date,_focused:Boolean,label:String}}get __isRTL(){return this.getAttribute(`dir`)===`rtl`}ready(){super.ready(),this.setAttribute(`tabindex`,0),this.addEventListener(`keydown`,this._onKeydown.bind(this)),l(this,`tap`,this._stopPropagation),this.addEventListener(`focus`,this._onOverlayFocus.bind(this)),this.addEventListener(`blur`,this._onOverlayBlur.bind(this))}setClassNameForDates(e){this.classNamesForDates=e,this.classNamesForDatesString=JSON.stringify(this.classNamesForDates)}connectedCallback(){super.connectedCallback(),this._closeYearScroller(),this._toggleAnimateClass(!0),h(this.$.scrollers,`pan-y`),x.requestAvailability()}announceFocusedDate(){var e=this._currentlyFocusedDate(),t=[];A(e,new Date)&&t.push(this.i18n.today),t=t.concat([this.i18n.weekdays[e.getDay()],e.getDate(),this.i18n.monthNames[e.getMonth()],e.getFullYear()]),this.showWeekNumbers&&this.i18n.firstDayOfWeek===1&&(t.push(this.i18n.week),t.push(k(e))),this.dispatchEvent(new CustomEvent(`iron-announce`,{bubbles:!0,composed:!0,detail:{text:t.join(` `)}}))}focusCancel(){this.$.cancelButton.focus()}scrollToDate(e,t){this._scrollToPosition(this._differenceInMonths(e,this._originDate),t)}_focusedDateChanged(e){this.revealDate(e)}_isCurrentYear(e){return e===0}_isSelectedYear(e,t){if(t)return t.getFullYear()===this._originDate.getFullYear()+e}revealDate(e){if(e){var t=this._differenceInMonths(e,this._originDate),n=this.$.monthScroller.position>t,r=this.$.monthScroller.clientHeight/this.$.monthScroller.itemHeight,i=this.$.monthScroller.position+r-1<t;n?this._scrollToPosition(t,!0):i&&this._scrollToPosition(t-r+1,!0)}}removePreselectionById(e){this.shadowRoot.getElementById(e).remove()}addToolbarContent(e){var t=this.shadowRoot;e.forEach(function(e,n){t.getElementById(`toolbarDiv`).appendChild(e)})}_onOverlayFocus(){this._focused=!0}_onOverlayBlur(){this._focused=!1}_initialPositionChanged(e){this.scrollToDate(e)}_repositionYearScroller(){this._visibleMonthIndex=Math.floor(this.$.monthScroller.position),this.$.yearScroller.position=(this.$.monthScroller.position+this._originDate.getMonth())/12}_repositionMonthScroller(){this.$.monthScroller.position=this.$.yearScroller.position*12-this._originDate.getMonth(),this._visibleMonthIndex=Math.floor(this.$.monthScroller.position)}_onMonthScroll(){this._repositionYearScroller(),this._doIgnoreTaps()}_onYearScroll(){this._repositionMonthScroller(),this._doIgnoreTaps()}_onYearScrollTouchStart(){this._notTapping=!1,setTimeout(()=>this._notTapping=!0,300),this._repositionMonthScroller()}_onMonthScrollTouchStart(){this._repositionYearScroller()}_doIgnoreTaps(){this._ignoreTaps=!0,this._debouncer=S.debounce(this._debouncer,v.after(300),()=>this._ignoreTaps=!1)}_formatDisplayed(e,t,n){return e?t(P(e)):n}_onTodayTap(){var e=new Date;Math.abs(this.$.monthScroller.position-this._differenceInMonths(e,this._originDate))<.001?(this.selectedStartDate=e,this.selectedEndDate=e,this._close()):this._scrollToCurrentMonth()}_onYesterdayTap(){let e=new Date(new Date);e.setDate(e.getDate()-1),Math.abs(this.$.monthScroller.position-this._differenceInMonths(e,this._originDate))<.001?(this.selectedStartDate=e,this.selectedEndDate=e,this._close()):this._scrollToCurrentMonth()}_onThisWeekTap(){var e=this.i18n.firstDayOfWeek===1?this._getLastMonday(new Date):this._getLastSunday(new Date);this.selectedStartDate=e;var t=new Date(e);t.setDate(new Date(e.getDate()+6)),this.selectedEndDate=t,this._close()}_onLastWeekTap(){var e=this.i18n.firstDayOfWeek===1?this._getLastMonday(new Date):this._getLastSunday(new Date);e.setDate(e.getDate()-7),this.selectedStartDate=e;var t=new Date(e);t.setDate(new Date(e.getDate()+6)),this.selectedEndDate=t,this._close()}_onThisMonthTap(){var e=new Date(new Date().getFullYear(),new Date().getMonth(),1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear(),new Date().getMonth()+1,0);this.selectedEndDate=t,this._close()}_onLastMonthTap(){var e=new Date(new Date().getFullYear(),new Date().getMonth()-1,1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear(),new Date().getMonth(),0);this.selectedEndDate=t,this._close()}_onThisYearTap(){var e=new Date(new Date().getFullYear(),0,1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear()+1,0,0);this.selectedEndDate=t,this._close()}_onLastYearTap(){var e=new Date(new Date().getFullYear()-1,0,1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear(),0,0);this.selectedEndDate=t,this._close()}_getLastSunday(e){var t=new Date(e);return t.setDate(t.getDate()-t.getDay()),t}_getLastMonday(e){var t=new Date(e);return t.setDate(t.getDate()-t.getDay()+1),t}_scrollToCurrentMonth(){this.focusedDate&&=new Date,this.scrollToDate(new Date,!0)}_showClear(e,t){return!!(e|t)}_onYearTap(e){if(!this._ignoreTaps&&!this._notTapping){var t=(e.detail.y-(this.$.yearScroller.getBoundingClientRect().top+this.$.yearScroller.clientHeight/2))/this.$.yearScroller.itemHeight;this._scrollToPosition(this.$.monthScroller.position+t*12,!0)}}_scrollToPosition(e,t){if(this._targetPosition!==void 0)this._targetPosition=e;else if(!t)this.$.monthScroller.position=e,this._targetPosition=void 0,this._repositionYearScroller();else{this._targetPosition=e;var n=(e,t,n,r)=>(e/=r/2,e<1?n/2*e*e+t:(e--,-n/2*(e*(e-2)-1)+t)),r=t?300:0,i=0,a=this.$.monthScroller.position,o=e=>{i||=e;var t=e-i;if(t<r){var s=n(t,a,this._targetPosition-a,r);this.$.monthScroller.position=s,window.requestAnimationFrame(o)}else this.dispatchEvent(new CustomEvent(`scroll-animation-finished`,{bubbles:!0,composed:!0,detail:{position:this._targetPosition,oldPosition:a}})),this.$.monthScroller.position=this._targetPosition,this._targetPosition=void 0;setTimeout(this._repositionYearScroller.bind(this),1)};window.requestAnimationFrame(o)}}_limit(e,t){return Math.min(t.max,Math.max(t.min,e))}_handleTrack(e){if(!(Math.abs(e.detail.dx)<10||Math.abs(e.detail.ddy)>10)){Math.abs(e.detail.ddx)>this._yearScrollerWidth/3&&this._toggleAnimateClass(!0);var t=this._translateX+e.detail.ddx;this._translateX=this._limit(t,{min:0,max:this._yearScrollerWidth})}}_track(e){if(!this._desktopMode)switch(e.detail.state){case`start`:this._toggleAnimateClass(!1);break;case`track`:this._handleTrack(e);break;case`end`:this._toggleAnimateClass(!0),this._translateX>=this._yearScrollerWidth/2?this._closeYearScroller():this._openYearScroller()}}_toggleAnimateClass(e){e?this.classList.add(`animate`):this.classList.remove(`animate`)}_toggleYearScroller(){this._isYearScrollerVisible()?this._closeYearScroller():this._openYearScroller()}_openYearScroller(){this._translateX=0,this.setAttribute(`years-visible`,``)}_closeYearScroller(){this.removeAttribute(`years-visible`),this._translateX=this._yearScrollerWidth}_isYearScrollerVisible(){return this._translateX<this._yearScrollerWidth/2}_translateXChanged(e){this._desktopMode||(this.$.monthScroller.style.transform=`translateX(`+(e-this._yearScrollerWidth)+`px)`,this.$.yearScroller.style.transform=`translateX(`+e+`px)`)}_yearAfterXYears(e){var t=new Date(this._originDate);return t.setFullYear(parseInt(e)+this._originDate.getFullYear()),t.getFullYear()}_yearAfterXMonths(e){return this._dateAfterXMonths(e).getFullYear()}_dateAfterXMonths(e){var t=new Date(this._originDate);return t.setDate(1),t.setMonth(parseInt(e)+this._originDate.getMonth()),t}_differenceInMonths(e,t){return(e.getFullYear()-t.getFullYear())*12-t.getMonth()+e.getMonth()}_differenceInYears(e,t){return this._differenceInMonths(e,t)/12}_clear(){this.selectedStartDate=``,this.selectedEndDate=``}_close(e){let t=this.getRootNode().host,n=t?t.getRootNode().host:null;n&&(n.opened=!1),this.dispatchEvent(new CustomEvent(`close`,{bubbles:!0,composed:!0,detail:{cancel:!!e}}))}_cancel(){this.focusedDate=this.selectedStartDate,this._close(!0)}_preventDefault(e){e.preventDefault()}_eventKey(e){for(var t=[`down`,`up`,`right`,`left`,`enter`,`space`,`home`,`end`,`pageup`,`pagedown`,`tab`,`esc`],n=0;n<t.length;n++){var r=t[n];if(g.keyboardEventMatchesKeys(e,r))return r}}_onKeydown(e){var t=this._currentlyFocusedDate();let n=e.composedPath().indexOf(this.$.todayButton)>=0,r=e.composedPath().indexOf(this.$.cancelButton)>=0,i=!n&&!r;var a=this._eventKey(e);if(a===`tab`){e.stopPropagation();let t=this.hasAttribute(`fullscreen`),a=e.shiftKey;t?e.preventDefault():a&&i||!a&&r?(e.preventDefault(),this.dispatchEvent(new CustomEvent(`focus-input`,{bubbles:!0,composed:!0}))):a&&n?(this._focused=!0,setTimeout(()=>this.revealDate(this.focusedDate),1)):this._focused=!1}else if(a)switch(e.preventDefault(),e.stopPropagation(),a){case`down`:this._moveFocusByDays(7),this.focus();break;case`up`:this._moveFocusByDays(-7),this.focus();break;case`right`:i&&this._moveFocusByDays(this.__isRTL?-1:1);break;case`left`:i&&this._moveFocusByDays(this.__isRTL?1:-1);break;case`enter`:i||r?this._close():n&&this._onTodayTap();break;case`space`:if(r)this._close();else if(n)this._onTodayTap();else{var o=this.focusedDate;this.selectingStartDate?A(o,this.selectedStartDate)?(this.selectedStartDate=``,this.focusedDate=o):(this.selectedStartDate=o,this.selectingStartDate=!1):A(o,this.selectedEndDate)?(this.selectedEndDate=``,this.focusedDate=o):(this.selectedEndDate=o,this._close())}break;case`home`:this._moveFocusInsideMonth(t,`minDate`);break;case`end`:this._moveFocusInsideMonth(t,`maxDate`);break;case`pagedown`:this._moveFocusByMonths(e.shiftKey?12:1);break;case`pageup`:this._moveFocusByMonths(e.shiftKey?-12:-1);break;case`esc`:this._cancel()}}_currentlyFocusedDate(){return this.focusedDate||this.selectedStartDate||this.initialPosition||new Date}_focusDate(e){this.focusedDate=e,this._focusedMonthDate=e.getDate()}_focusClosestDate(e){this._focusDate(N(e,[this.minDate,this.maxDate]))}_moveFocusByDays(e){var t=this._currentlyFocusedDate(),n=new Date(0,0);n.setFullYear(t.getFullYear()),n.setMonth(t.getMonth()),n.setDate(t.getDate()+e),this._dateAllowed(n,this.minDate,this.maxDate)?this._focusDate(n):this._dateAllowed(t,this.minDate,this.maxDate)?e>0?this._focusDate(this.maxDate):this._focusDate(this.minDate):this._focusClosestDate(t)}_moveFocusByMonths(e){var t=this._currentlyFocusedDate(),n=new Date(0,0);n.setFullYear(t.getFullYear()),n.setMonth(t.getMonth()+e);var r=n.getMonth();n.setDate(this._focusedMonthDate||=t.getDate()),n.getMonth()!==r&&n.setDate(0),this._dateAllowed(n,this.minDate,this.maxDate)?this.focusedDate=n:this._dateAllowed(t,this.minDate,this.maxDate)?e>0?this._focusDate(this.maxDate):this._focusDate(this.minDate):this._focusClosestDate(t)}_moveFocusInsideMonth(e,t){var n=new Date(0,0);n.setFullYear(e.getFullYear()),t===`minDate`?(n.setMonth(e.getMonth()),n.setDate(1)):(n.setMonth(e.getMonth()+1),n.setDate(0)),this._dateAllowed(n,this.minDate,this.maxDate)?this._focusDate(n):this._dateAllowed(e,this.minDate,this.maxDate)?this._focusDate(this[t]):this._focusClosestDate(e)}_dateAllowed(e,t,n){return(!t||e>=t)&&(!n||e<=n)}_isTodayAllowed(e,t){var n=new Date,r=new Date(0,0);return r.setFullYear(n.getFullYear()),r.setMonth(n.getMonth()),r.setDate(n.getDate()),this._dateAllowed(r,e,t)}_stopPropagation(e){e.stopPropagation()}};customElements.define(L.is,L);var R=class extends p(y){static get is(){return`vcf-date-range-picker-overlay`}};customElements.define(R.is,R);var z=E(e=>typeof e.prototype.addController==`function`?e:class extends e{constructor(){super(),this.__controllers=new Set}connectedCallback(){super.connectedCallback(),this.__controllers.forEach(e=>{e.hostConnected&&e.hostConnected()})}disconnectedCallback(){super.disconnectedCallback(),this.__controllers.forEach(e=>{e.hostDisconnected&&e.hostDisconnected()})}addController(e){this.__controllers.add(e),this.$!==void 0&&this.isConnected&&e.hostConnected&&e.hostConnected()}removeController(e){this.__controllers.delete(e)}}),B=r=>class extends n(z(m(t(o(r))))){static get properties(){return{_selectedStartDate:{type:Date},_selectedEndDate:{type:Date},_selectingStartDate:{type:Boolean},_focusedDate:Date,value:{type:String,observer:`_valueChanged`,notify:!0,value:``},required:{type:Boolean,value:!1},name:{type:String},initialPosition:String,label:String,opened:{type:Boolean,reflectToAttribute:!0,notify:!0,observer:`_openedChanged`},autoOpenDisabled:Boolean,showWeekNumbers:{type:Boolean},_fullscreen:{type:Boolean,value:!1,observer:`_fullscreenChanged`},_fullscreenMediaQuery:{value:`(max-width: 420px), (max-height: 420px)`},_touchPrevented:Array,i18n:{type:Object,value:()=>({monthNames:[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`],weekdays:[`Sunday`,`Monday`,`Tuesday`,`Wednesday`,`Thursday`,`Friday`,`Saturday`],weekdaysShort:[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],firstDayOfWeek:0,week:`Week`,calendar:`Calendar`,clear:`Clear`,today:`Today`,yesterday:`Yesterday`,thisWeek:`This week`,lastWeek:`Last week`,thisMonth:`This month`,lastMonth:`Last month`,thisYear:`This Year`,lastYear:`Last Year`,cancel:`Cancel`,formatDate:e=>{let t=String(e.year).replace(/\d+/,e=>`0000`.substr(e.length)+e);return[e.month+1,e.day,t].join(`/`)},parseDate:e=>{let t=e.split(`/`),n=new Date,r,i=n.getMonth(),a=n.getFullYear();if(t.length===3?(a=parseInt(t[2]),t[2].length<3&&a>=0&&(a+=a<50?2e3:1900),i=parseInt(t[0])-1,r=parseInt(t[1])):t.length===2?(i=parseInt(t[0])-1,r=parseInt(t[1])):t.length===1&&(r=parseInt(t[0])),r!==void 0)return{day:r,month:i,year:a}},formatTitle:(e,t)=>e+` `+t})},min:{type:String,observer:`_minChanged`},max:{type:String,observer:`_maxChanged`},_minDate:{type:Date,value:``},_maxDate:{type:Date,value:``},_startXPosition:{type:Number,value:null},_startYPosition:{type:Number,value:null},_noInput:{type:Boolean,computed:`_isNoInput(_fullscreen, _ios, i18n, i18n.*)`},_ios:{type:Boolean,value:navigator.userAgent.match(/iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/)},_webkitOverflowScroll:{type:Boolean,value:document.createElement(`div`).style.webkitOverflowScrolling===``},_ignoreAnnounce:{value:!0},_focusOverlayOnOpen:Boolean,_overlayContent:{type:Object,sync:!0},_overlayInitialized:Boolean}}static get observers(){return[`_selectedStartDateChanged(_selectedStartDate, i18n.formatDate)`,`_selectedEndDateChanged(_selectedEndDate, i18n.formatDate)`,`_focusedDateChanged(_focusedDate, i18n.formatDate)`,`_announceFocusedDate(_focusedDate, opened, _ignoreAnnounce)`,`__updateOverlayContent(_overlayContent, i18n, label, _minDate, _maxDate, _focusedDate, showWeekNumbers, _selectedStartDate, _selectedEndDate, _selectingStartDate, hideSidePanel)`,`__updateOverlayContentTheme(_overlayContent, _theme)`,`__updateOverlayContentFullScreen(_overlayContent, _fullscreen)`]}__updateOverlayContent(e,t,n,r,i,a,o,s,c,l,u){e&&(e.i18n=t,e.label=n,e.minDate=r,e.maxDate=i,e.focusedDate=a,e.showWeekNumbers=o,e.selectedStartDate=s,e.selectedEndDate=c,e.selectingStartDate=l,e.hideSidePanel=u)}__updateOverlayContentTheme(e,t){e&&(t?e.setAttribute(`theme`,t):e.removeAttribute(`theme`))}__updateOverlayContentFullScreen(e,t){e&&e.toggleAttribute(`fullscreen`,t)}constructor(){super(),this._boundOnClick=this._onClick.bind(this),this._boundOnScroll=this._onScroll.bind(this),this._boundFocus=this._focus.bind(this),this._boundUpdateAlignmentAndPosition=this._updateAlignmentAndPosition.bind(this),this._boundOverlayRenderer=this._overlayRenderer.bind(this)}ready(){super.ready(),this.addController(new e(this._fullscreenMediaQuery,e=>{this._fullscreen=e})),this.addController(new w(this));let t=this.$.overlay;this._overlayElement=t,t.renderer=this._boundOverlayRenderer;let n=e=>e.composedPath()[0].id===`clearButton`;l(this,`tap`,e=>{!n(e)&&(!this.autoOpenDisabled||this._noInput)&&this.open()}),this.addEventListener(`touchend`,e=>{n(e)||e.preventDefault()}),this.addEventListener(`keydown`,this._onKeydown.bind(this)),this._inputStartElement.addEventListener(`input`,this._onUserInputStart.bind(this)),this._inputEndElement.addEventListener(`input`,this._onUserInputEnd.bind(this)),this.addEventListener(`focus`,e=>this._noInput&&e.target.blur()),this.addEventListener(`blur`,e=>{if(!this.opened){if(this.autoOpenDisabled){let e=this._getParsedDate(this._inputStartValue);this._isValidDate(e)&&(this._selectedStartDate=e);let t=this._getParsedDate(this._inputEndValue);this._isValidDate(t)&&(this._selectedEndDate=t)}this._inputStartElement.value===``&&this.__dispatchChange?(this.validateStart(),this.value=`;`,this.__dispatchChange=!1):this.validateStart()}})}_initOverlay(){this.$.overlay.removeAttribute(`disable-upgrade`),this._overlayInitialized=!0,this.$.overlay.addEventListener(`opened-changed`,e=>this.opened=e.detail.value),this._overlayContent.addEventListener(`close`,this._close.bind(this)),this._overlayContent.addEventListener(`focus-input`,this._focusAndSelect.bind(this)),this.$.overlay.addEventListener(`vaadin-overlay-escape-press`,this._boundFocus),this._overlayContent.addEventListener(`focus`,()=>this._onFocusElement()),this._overlayContent.setClassNameForDates(this._classNamesForDates),this.$.overlay.addEventListener(`vaadin-overlay-close`,this._onVaadinOverlayClose.bind(this));let e=e=>{this.$.overlay.bringToFront&&requestAnimationFrame(()=>{this.$.overlay.bringToFront()})};this.addEventListener(`mousedown`,e),this.addEventListener(`touchstart`,e)}_onFocusElement(){this.focusElement&&this.focusElement._setFocused&&this.focusElement._setFocused(!0)}disconnectedCallback(){super.disconnectedCallback(),this._overlayInitialized&&this.$.overlay.removeEventListener(`vaadin-overlay-escape-press`,this._boundFocus),this.opened=!1}open(){!this.disabled&&!this.readonly&&(this.opened=!0)}openOnPosition(e,t){this._startXPosition=e,this._startYPosition=t,!this.disabled&&!this.readonly&&(this.opened=!0)}_closeOnTap(e){this._selectingStartDate?(this._selectingStartDate=!1,this._selectedEndDate&&this._selectedStartDate>=this._selectedEndDate&&(this._selectedEndDate=void 0)):(e&&e.stopPropagation(),this._selectedStartDate&&this._selectedStartDate<=this._selectedEndDate?(this._selectingStartDate=!0,this._focus(),this.close()):(this._selectingStartDate=!1,this._selectedStartDate=this._selectedEndDate,this._selectedEndDate=void 0))}_close(e){e&&(e.stopPropagation(),e.detail&&(this._cancelled=e.detail.cancel)),this._focus(),this.close()}close(){(this._overlayInitialized||this.autoOpenDisabled)&&this.$.overlay.close()}_overlayRenderer(e){if(e.firstElementChild)return;let t=document.createElement(`vcf-date-range-picker-overlay-content`);e.appendChild(t),this._overlayContent=t,this._initOverlay(),this._updateAlignmentAndPosition(),t.addEventListener(`close`,()=>{this._close()}),t.addEventListener(`focus-input`,this._focusAndSelect.bind(this)),t.addEventListener(`date-tap`,e=>this._closeOnTap(e)),t.addEventListener(`selected-start-date-changed`,e=>{this._selectedStartDate=e.detail.value}),t.addEventListener(`selected-end-date-changed`,e=>{this._selectedEndDate=e.detail.value}),t.addEventListener(`selecting-start-date-changed`,e=>{this._selectingStartDate=e.detail.value}),t.addEventListener(`focused-date-changed`,e=>{this._focusedDate=e.detail.value})}get _inputStartElement(){return this._inputStart()}get _inputEndElement(){return this._inputEnd()}get _nativeInput(){if(this._inputStartElement)return this._inputStartElement.focusElement?this._inputStartElement.focusElement:this._inputStartElement.inputElement?this._inputStartElement.inputElement:window.unwrap?window.unwrap(this._inputStartElement):this._inputStartElement}_parseDate(e){var t=/^([-+]\d{1}|\d{2,4}|[-+]\d{6})-(\d{1,2})-(\d{1,2})$/.exec(e);if(t){var n=new Date(0,0);return n.setFullYear(parseInt(t[1],10)),n.setMonth(parseInt(t[2],10)-1),n.setDate(parseInt(t[3],10)),n}}_isNoInput(e,t,n){return!this._inputStartElement||!this._inputEndElement||e||t||!n.parseDate}_formatISO(e){if(!(e instanceof Date))return``;let t=(e,t=`00`)=>(t+e).substr((t+e).length-t.length),n=``,r=`0000`,i=e.getFullYear();return i<0?(i=-i,n=`-`,r=`000000`):e.getFullYear()>=1e4&&(n=`+`,r=`000000`),[n+t(i,r),t(e.getMonth()+1),t(e.getDate())].join(`-`)}_openedChanged(e){this._selectingStartDate=!0,this.inputElement&&this.inputElement.setAttribute(`aria-expanded`,e)}_selectedStartDateChanged(e,t){e!==void 0&&t!==void 0&&(this.__userInputOccurred&&(this.__dispatchChange=!0),this._formatISO(e),this.__keepInputValue||this._applyStartInputValue(e),this.__userInputOccurred=!1,this.__dispatchChange=!1,this._ignoreFocusedDateChange=!0,this._focusedDate=e,this._ignoreFocusedDateChange=!1)}_selectedEndDateChanged(e,t){e!==void 0&&t!==void 0&&(this.__userInputOccurred&&(this.__dispatchChange=!0),this._formatISO(e),this.__keepInputValue||this._applyEndInputValue(e),this.__userInputOccurred=!1,this.__dispatchChange=!1,this._ignoreFocusedDateChange=!0,this._focusedDate=e,this._ignoreFocusedDateChange=!1)}_focusedDateChanged(e,t){e!==void 0&&t!==void 0&&(this.__userInputOccurred=!0,this._selectingStartDate!==void 0&&!this._ignoreFocusedDateChange&&!this._noInput&&this.opened&&(this._selectingStartDate?this._applyStartInputValue(e):this._applyEndInputValue(e)))}get _hasValue(){return this._selectedStartDate!=null&&this._selectedStartDate!==``||this._selectedEndDate!=null&&this._selectedEndDate!==``}_updateHasValue(e){this.toggleAttribute(`has-value`,e)}__getOverlayTheme(e,t){if(t)return e}_handleDateChange(e,t,n){if(!t)this[e]=``;else{var r=this._parseDate(t);return r?(A(this[e],r)||(this[e]=r,this.value&&this.validateStart()&&this.validateEnd()),!0):!1}}_valueChanged(e,t){this.__dispatchChange&&this.dispatchEvent(new CustomEvent(`change`,{bubbles:!0}));var n=this._extractStartDate(e),r=this._extractEndDate(e);n&&!this._handleDateChange(`_selectedStartDate`,n,t)?(n=``,this._selectedStartDate=null):this._selectedStartDate=this._parseDate(n),r&&!this._handleDateChange(`_selectedEndDate`,r,t)?(r=``,this._selectedEndDate=null):this._selectedEndDate=this._parseDate(r),this.value=n+`;`+r,this._updateHasValue(this._hasValue)}_extractStartDate(e){return e.split(`;`)[0]??``}_extractEndDate(e){return e.split(`;`)[1]??``}_minChanged(e,t){this._handleDateChange(`_minDate`,e,t)||(this.min=t)}_maxChanged(e,t){this._handleDateChange(`_maxDate`,e,t)||(this.max=t)}_updateAlignmentAndPosition(){if(this._overlayInitialized){if(!this._fullscreen){if(this._startXPosition&&this._startYPosition)this.$.overlay.removeAttribute(`right-aligned`),this.$.overlay.removeAttribute(`bottom-aligned`),this.$.overlay.style.setProperty(`top`,this._startYPosition+`px`),this.$.overlay.style.setProperty(`left`,this._startXPosition+`px`);else{let e=this._inputStartElement.getBoundingClientRect(),t=e.top>window.innerHeight/2;if(e.left+this.clientWidth/2>window.innerWidth/2){let t=Math.min(window.innerWidth,document.documentElement.clientWidth);this.$.overlay.setAttribute(`right-aligned`,``),this.$.overlay.style.removeProperty(`left`),this.$.overlay.style.right=t-e.right+`px`}else this.$.overlay.removeAttribute(`right-aligned`),this.$.overlay.style.removeProperty(`right`),this.$.overlay.style.left=e.left+`px`;if(t){let t=Math.min(window.innerHeight,document.documentElement.clientHeight);this.$.overlay.setAttribute(`bottom-aligned`,``),this.$.overlay.style.removeProperty(`top`),this.$.overlay.style.bottom=t-e.top+`px`}else this.$.overlay.removeAttribute(`bottom-aligned`),this.$.overlay.style.removeProperty(`bottom`),this.$.overlay.style.top=e.bottom+`px`}}this.$.overlay.setAttribute(`dir`,getComputedStyle(this._inputStartElement).getPropertyValue(`direction`)),this._overlayContent._repositionYearScroller()}}_fullscreenChanged(){this._overlayInitialized&&this.$.overlay.opened&&this._updateAlignmentAndPosition()}_onOverlayOpened(){this._openedWithFocusRing=this.hasAttribute(`focus-ring`)||this.focusElement&&this.focusElement.hasAttribute(`focus-ring`);var e=this._parseDate(this.initialPosition),t=this._selectedStartDate||this._overlayContent.initialPosition||e||new Date;e||M(t,this._minDate,this._maxDate)?this._overlayContent.initialPosition=t:this._overlayContent.initialPosition=N(t,[this._minDate,this._maxDate]),this._overlayContent.scrollToDate(this._overlayContent.focusedDate||this._overlayContent.initialPosition),this._ignoreFocusedDateChange=!0,this._overlayContent.focusedDate=this._overlayContent.focusedDate||this._overlayContent.initialPosition,this._ignoreFocusedDateChange=!1,window.addEventListener(`scroll`,this._boundOnScroll,!0),this.addEventListener(`iron-resize`,this._boundUpdateAlignmentAndPosition),this._webkitOverflowScroll&&(this._touchPrevented=this._preventWebkitOverflowScrollingTouch(this.parentElement)),this._focusOverlayOnOpen?(this._overlayContent.focus(),this._focusOverlayOnOpen=!1):this._focus(),this._noInput&&this.focusElement&&this.focusElement.blur();var n=this.shadowRoot.querySelector(`slot[name='presets']`).assignedNodes();this._overlayContent.addToolbarContent(n),this.updateStyles(),this._ignoreAnnounce=!1}_preventWebkitOverflowScrollingTouch(e){for(var t=[];e;){if(window.getComputedStyle(e).webkitOverflowScrolling===`touch`){var n=e.style.webkitOverflowScrolling;e.style.webkitOverflowScrolling=`auto`,t.push({element:e,oldInlineValue:n})}e=e.parentElement}return t}_selectParsedOrFocusedDate(){if(this._ignoreFocusedDateChange=!0,this.i18n.parseDate){let e=this._inputStartValue||``,t=this._getParsedDate(e);this._isValidDate(t)?(this._selectedStartDate<t||this._selectedStartDate>t)&&(this._selectedStartDate=t):(this.__keepInputValue=!0,this._selectedStartDate=null,this.__keepInputValue=!1)}else this._focusedDate&&(this._selectedStartDate=this._focusedDate);if(this.i18n.parseDate){let e=this._inputEndValue||``,t=this._getParsedDate(e);this._isValidDate(t)?this._selectedEndDate=t:(this.__keepInputValue=!0,this._selectedEndDate=null,this.__keepInputValue=!1)}else this._focusedDate&&(this._selectedEndDate=this._focusedDate);this._ignoreFocusedDateChange=!1}_onOverlayClosed(){this._ignoreAnnounce=!0,window.removeEventListener(`scroll`,this._boundOnScroll,!0),this.removeEventListener(`iron-resize`,this._boundUpdateAlignmentAndPosition),this._touchPrevented&&=(this._touchPrevented.forEach(e=>e.element.style.webkitOverflowScrolling=e.oldInlineValue),[]),this.updateStyles(),this._selectParsedOrFocusedDate(),this._nativeInput&&this._nativeInput.selectionStart&&(this._nativeInput.selectionStart=this._nativeInput.selectionEnd),this.value||(this.validateStart(),this.validateEnd())}validateStart(){return!(this.invalid=!this.checkStartValidity(this._inputStartValue))}validateEnd(){return!(this.invalid=!this.checkEndValidity(this._inputEndValue))}checkStartValidity(){let e=!this._inputStartValue||this._selectedStartDate&&this._inputStartValue===this._getFormattedDate(this.i18n.formatDate,this._selectedStartDate),t=!this._selectedStartDate||M(this._selectedStartDate,this._minDate,this._maxDate),n=!0;return this._inputStartElement&&(this._inputStartElement.checkValidity?(this._inputStartElement.__forceCheckValidity=!0,n=this._inputStartElement.checkValidity(),this._inputStartElement.__forceCheckValidity=!1):this._inputStartElement.validate&&(n=this._inputStartElement.validate())),e&&t&&n}checkEndValidity(){let e=!this._inputEndValue||this._selectedEndDate&&this._inputEndValue===this._getFormattedDate(this.i18n.formatDate,this._selectedEndDate),t=!this._selectedEndDate||M(this._selectedEndDate,this._minDate,this._maxDate),n=!0;return this._inputEndElement&&(this._inputEndElement.checkValidity?(this._inputEndElement.__forceCheckValidity=!0,n=this._inputEndElement.checkValidity(),this._inputEndElement.__forceCheckValidity=!1):this._inputEndElement.validate&&(n=this._inputEndElement.validate())),e&&t&&n}removePreselectionById(e){var t=()=>{this.opened&&this._overlayContent.removePreselectionById(e),this.$.overlay.removeEventListener(`vaadin-overlay-open`,t)};this.$.overlay.addEventListener(`vaadin-overlay-open`,t)}_onScroll(e){(e.target===window||!this._overlayContent.contains(e.target))&&this._updateAlignmentAndPosition()}_focusStart(){this._noInput?this._overlayInitialized&&this._overlayContent.focus():this._inputStartElement.focus()}_focusEnd(){this._noInput?this._overlayInitialized&&this._overlayContent.focus():this._inputEndElement.focus()}_clearStartTextField(e){e.detail.sourceEvent.__fromClearButton&&this._inputStartElement.clear()}_focusAndSelect(){this._focus(),this._setSelectionRange(0,this._inputValue.length)}_applyStartInputValue(e){this._inputStartValue=e?this._getFormattedDate(this.i18n.formatDate,e):``}_applyEndInputValue(e){this._inputEndValue=e?this._getFormattedDate(this.i18n.formatDate,e):``}_getFormattedDate(e,t){return e(P(t))}_setSelectionRange(e,t){this._nativeInput&&this._nativeInput.setSelectionRange&&this._nativeInput.setSelectionRange(e,t)}_onClick(e){this._isClearButton(e)||this._onHostClick(e)}_onHostClick(e){(!this.autoOpenDisabled||this._noInput)&&(e.preventDefault(),this.open())}_eventKey(e){for(var t=[`down`,`up`,`enter`,`esc`,`tab`],n=0;n<t.length;n++){var r=t[n];if(g.keyboardEventMatchesKeys(e,r))return r}}_isValidDate(e){return e&&!isNaN(e.getTime())}_onKeydown(e){switch(this._noInput&&[9].indexOf(e.keyCode)===-1&&e.preventDefault(),this._eventKey(e)){case`down`:case`up`:e.preventDefault(),this.opened?(this._overlayContent.focus(),this._overlayContent._onKeydown(e)):(this._focusOverlayOnOpen=!0,this.open());break;case`enter`:if(this.shadowRoot.activeElement===this._inputEndElement.inputElement&&(this._selectingStartDate=!1),this._selectingStartDate){let e=this._getParsedDate(this._inputStartValue),t=this._isValidDate(e);if(this.opened)this._overlayInitialized&&this._overlayContent.focusedDate&&t&&(this._selectedStartDate=this._overlayContent.focusedDate),this.close();else if(!t&&this._inputStartElement.value!==``)this.validateStart();else{let e=this.value;this._selectParsedOrFocusedDate(),e===this.value&&this.validateStart()}}else{let e=this._getParsedDate(this._inputEndValue),t=this._isValidDate(e);if(this.opened)this._overlayInitialized&&this._overlayContent.focusedDate&&t&&(this._selectedEndDate=this._overlayContent.focusedDate),this.close();else if(!t&&this._inputEndElement.value!==``)this.validateEnd();else{let e=this.value;this._selectParsedOrFocusedDate(),e===this.value&&this.validateEnd()}}break;case`esc`:this.opened?(this._focusedDate=this._selectedStartDate,this._close()):this.autoOpenDisabled?(this._inputStartElement.value===``&&(this._selectedStartDate=null),this._applyStartInputValue(this._selectedStartDate),this._inputEndElement.value===``&&(this._selectedEndDate=null),this._applyInputEndValue(this._selectedEndDate)):(this._focusedDate=this._selectedStartDate,this._selectParsedOrFocusedDate());break;case`tab`:if(this.shadowRoot.activeElement===this._inputStartElement.inputElement){if(e.shiftKey)this.close(),this.blur();else{let t=this._getParsedDate(this._inputStartValue);this._isValidDate(t)&&(this._selectedStartDate=t),e.preventDefault(),this._selectingStartDate=!1,this._inputEndElement.focus()}}else if(this.shadowRoot.activeElement===this._inputEndElement.inputElement){if(e.shiftKey){let t=this._getParsedDate(this._inputEndValue);this._isValidDate(t)&&(this._selectedEndDate=t),e.preventDefault(),this._selectingStartDate=!0,this._inputStartElement.focus()}else this.close()}}}_getParsedDate(e=this._inputStartValue){let t=this.i18n.parseDate&&this.i18n.parseDate(e);return t&&this._parseDate(t.year+`-`+(t.month+1)+`-`+t.day)}_onUserInputStart(e){!this.opened&&this._inputStartElement.value&&!this.autoOpenDisabled&&this.open(),this._userInputStartValueChanged(),e.__fromClearButton&&(this.validateStart(),this.__dispatchChange=!0,this.value=`;`,this.__dispatchChange=!1)}_onUserInputEnd(e){!this.opened&&this._inputEndElement.value&&!this.autoOpenDisabled&&this.open(),this._userInputEndValueChanged(),e.__fromClearButton&&(this.validateEnd(),this.__dispatchChange=!0,this.value=`;`,this.__dispatchChange=!1)}_userInputStartValueChanged(e){if(this.opened&&this._inputStartValue){let e=this._getParsedDate(this._inputStartValue);this._isValidDate(e)&&(this._ignoreFocusedDateChange=!0,A(e,this._focusedDate)||(this._focusedDate=e),this._ignoreFocusedDateChange=!1)}}_userInputEndValueChanged(e){if(this.opened&&this._inputEndValue){let e=this._getParsedDate(this._inputEndValue);this._isValidDate(e)&&(this._ignoreFocusedDateChange=!0,A(e,this._focusedDate)||(this._focusedDate=e),this._ignoreFocusedDateChange=!1)}}_announceFocusedDate(e,t,n){t&&!n&&this._overlayContent.announceFocusedDate()}},V=class extends r(f(a(B(b(u))))){static get template(){return d`
    <style>
      :host {
        display: inline-flex;
        white-space: nowrap;
      }

      :host([hidden]) {
        display: none !important;
      }

      :host([opened]) {
        pointer-events: auto;
      }

      [part="start-text-field"] {
        align-self: flex-end;
        flex-grow: 1;
        width: 11ch;
      }
      [part="end-text-field"] {
        align-self: flex-end;
        flex-grow: 1;
        width: 16ch;
        overflow: hidden;
      }
      [focus-ring][part="end-text-field"] {
        padding-left: 2px;
        padding-right: 2px;
      }
      [focus-ring][part="end-text-field"] [part="toggle-button"] {
        margin-right: -2px;
      }
      [part="dash"][hidden] {
        display: none;
      }
      [part="drp-container"] {
        display:flex; 
        min-width:100%; 
        max-width:100%; 
        line-height: normal;
      }
      [part="end-text-field"] [part="toggle-button"] {
        position: absolute;
        right: 6px;
      }
      [part="end-text-field"]::part(clear-button) {
        margin-right: 24px;
      }
    </style>

    <div part="drp-container">
      <vcf-date-range-picker-text-field id="startInput"
          role="application"
          autocomplete="off"
          on-focus="_focusStart"
          value="{{_userInputStartValue}}"
          invalid="[[invalid]]"
          label="[[label]]"
          name="[[name]]"
          placeholder="[[placeholder]]"
          required="[[required]]"
          disabled="[[disabled]]"
          readonly="[[readonly]]"
          error-message="[[errorMessage]]"
          aria-label$="[[label]]"
          part="start-text-field"
          helper-text="[[helperText]]"
          theme$="[[theme]]"
          class="startDate"
          autoselect="true"
          hidden="[[hideTextFields]]"
        >
        <slot name="prefix" slot="prefix"></slot>        
        <div part="helper-text" slot="helper" name="helper-text">[[helperText]]</div>
      </vcf-date-range-picker-text-field
      ><vcf-date-range-picker-text-field 
          disabled="[[disabled]]" 
          class="dash" 
          value="—" 
          invalid="[[invalid]]"
          readonly="[[readonly]]"
          hidden="[[hideTextFields]]" 
          part="dash"></vcf-date-range-picker-text-field
      ><vcf-date-range-picker-text-field id="endInput"
          role="application"
          autocomplete="off"
          on-focus="_focusEnd"
          on-change="_clearStartTextField"
          value="{{_userInputEndValue}}"
          invalid="[[invalid]]"
          name="[[name]]"
          placeholder="[[endPlaceholder]]"
          required="[[required]]"
          disabled="[[disabled]]"
          readonly="[[readonly]]"
          clear-button-visible$="[[clearButtonVisible]]"
          part="end-text-field"
          helper-end-text="[[helperEndText]]"
          theme$="[[theme]]"
          class="endDate"
          autoselect="true"
          hidden="[[hideTextFields]]"
        >
        <slot name="prefix" slot="prefix"></slot>
        <div part="helper-end-text" slot="helper" name="helper-end-text">[[helperEndText]]</div>
        <div part="toggle-button" slot="suffix" on-tap="_toggle" role="button" aria-label$="[[i18n.calendar]]" aria-expanded$="[[_getAriaExpanded(opened)]]"></div>
      </vcf-date-range-picker-text-field>
    </div>
    <vcf-date-range-picker-overlay
        id="overlay"
        fullscreen$="[[_fullscreen]]"
        opened="{{opened}}"
        theme$="[[__getOverlayTheme(theme, _overlayInitialized)]]"
        on-vaadin-overlay-open="_onOverlayOpened"
        on-vaadin-overlay-close="_onOverlayClosed"
        disable-upgrade>
      
    </vcf-date-range-picker-overlay>
    <div style="display:none">
      <slot name="presets"></slot>
    </div>
      
    <iron-media-query
        query="[[_fullscreenMediaQuery]]"
        query-matches="{{_fullscreen}}">
    </iron-media-query>
    `}static get is(){return`vcf-date-range-picker`}static get version(){return`6.0.0`}static get properties(){return{clearButtonVisible:{type:Boolean,value:!1},disabled:{type:Boolean,value:!1,reflectToAttribute:!0},errorMessage:String,placeholder:String,endPlaceholder:String,helperText:String,helperEndText:String,readonly:{type:Boolean,value:!1,reflectToAttribute:!0},hideSidePanel:{type:Boolean,value:!1,reflectToAttribute:!0},hideTextFields:{type:Boolean,value:!1,reflectToAttribute:!0},invalid:{type:Boolean,reflectToAttribute:!0,notify:!0,value:!1},_classNamesForDates:{type:Object,value:{},notify:!0},_userInputStartValue:String,_userInputEndValue:String}}static get observers(){return[`_userInputStartValueChanged(_userInputStartValue)`,`_userInputEndValueChanged(_userInputEndValue)`,`_setClearButtonLabel(i18n.clear)`]}ready(){super.ready(),_(this,()=>this._inputStartElement.validate=()=>{}),_(this,()=>this._inputEndElement.validate=()=>{}),this._inputStartElement.addEventListener(`change`,e=>{this._inputStartElement.value===``&&!e.__fromClearButton&&(this.__dispatchChange=!0)}),this._inputEndElement.addEventListener(`change`,e=>{this._inputEndElement.value===``&&!e.__fromClearButton&&(this.__dispatchChange=!0)});let e=this;new ResizeObserver(t=>{requestAnimationFrame(()=>{for(let r of t)if(r.contentBoxSize){var n=e.shadowRoot.host.offsetWidth;e._inputStartElement.shadowRoot.querySelector(`[part="label"]`).setAttribute(`style`,`width: `+n+`px; max-width: max-content; overflow: hidden;`),e._inputStartElement.shadowRoot.querySelector(`[part="error-message"]`).setAttribute(`style`,`width: `+n+`px; max-width: max-content; overflow: hidden;`)}})}).observe(this)}setClassNameForDates(e,t){var n=JSON.parse(JSON.stringify(this._classNamesForDates));n[e]=t,this._classNamesForDates=n}_openedChanged(e){super._openedChanged(e),this.$.overlay.positionTarget=this.shadowRoot.querySelector(`[part="input-field"]`),this.$.overlay.noVerticalOverlap=!0}_onVaadinOverlayClose(e){if(this._openedWithFocusRing&&this.hasAttribute(`focused`)?this.focusElement.setAttribute(`focus-ring`,``):this.hasAttribute(`focused`)||this.focusElement.blur(),e.detail.sourceEvent&&e.detail.sourceEvent.composedPath().indexOf(this)!==-1&&e.preventDefault(),this._cancelled){this._cancelled=!1;let e=this._parseDate(this._extractStartDate(this.value)),t=this._parseDate(this._extractEndDate(this.value));this._selectedStartDate=e,this._selectedEndDate=t}else this._selectedStartDate&&this._selectedEndDate&&(this._selectedStartDate>=this._selectedEndDate&&(this._selectedEndDate=null),this.value=this._formatISO(this._selectedStartDate)+`;`+this._formatISO(this._selectedEndDate))}_toggle(e){e.stopPropagation(),this[this._overlayInitialized&&this.$.overlay.opened?`close`:`open`]()}_inputStart(){return this.$.startInput}_inputEnd(){return this.$.endInput}set _inputStartValue(e){this._inputStartElement.value=e}get _inputStartValue(){return this._inputStartElement.value}set _inputEndValue(e){this._inputEndElement.value=e}get _inputEndValue(){return this._inputEndElement.value}_getAriaExpanded(e){return(!!e).toString()}get focusElement(){return this.shadowRoot.activeElement||this._inputStart()||this}_setClearButtonLabel(e){let t=this._inputStartElement.shadowRoot.querySelector(`[part="clear-button"]`);t&&t.setAttribute(`aria-label`,e)}};customElements.define(V.is,V),window.Vaadin.DateRangePickerElement=V;