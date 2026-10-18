import{Ft as e,Ot as t,wt as n}from"./index-ZTn0iXbr.js";import{d as r,f as i,l as a,n as o,p as s,r as c,x as l}from"./slot-styles-mixin-Bt1vTmQg.js";import{a as u,c as d,d as f,f as p,i as ee,l as te,n as ne,o as re,r as ie,s as ae,t as oe,u as se}from"./vaadinCanvasRenderer-B3Stt79t.js";p(`Lumo .js mixins are deprecated and will be removed in V26`);var ce=e`
  :host {
    inset: var(--vaadin-overlay-viewport-inset, var(--lumo-space-m));
    /* Workaround for Edge issue (only on Surface), where an overflowing vaadin-list-box inside vaadin-select-overlay makes the overlay transparent */
    /* stylelint-disable-next-line */
    outline: 0px solid transparent;
  }

  [part='overlay'] {
    background-color: var(--lumo-base-color);
    background-image: linear-gradient(var(--lumo-tint-5pct), var(--lumo-tint-5pct));
    border-radius: var(--lumo-border-radius-m);
    box-shadow:
      0 0 0 1px var(--lumo-shade-5pct),
      var(--lumo-box-shadow-m);
    color: var(--lumo-body-text-color);
    font-family: var(--lumo-font-family);
    font-size: var(--lumo-font-size-m);
    font-weight: 400;
    line-height: var(--lumo-line-height-m);
    letter-spacing: 0;
    text-transform: none;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  [part='content'] {
    padding: var(--lumo-space-xs);
  }

  [part='backdrop'] {
    background-color: var(--lumo-shade-20pct);
    animation: 0.2s lumo-overlay-backdrop-enter both;
  }

  @keyframes lumo-overlay-backdrop-enter {
    0% {
      opacity: 0;
    }
  }

  :host([closing]) [part='backdrop'] {
    animation: 0.2s lumo-overlay-backdrop-exit both;
  }

  @keyframes lumo-overlay-backdrop-exit {
    100% {
      opacity: 0;
    }
  }

  @keyframes lumo-overlay-dummy-animation {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 1;
    }
  }
`;c(``,ce,{moduleId:`lumo-overlay`}),p(`Lumo .js mixins are deprecated and will be removed in V26`);var le=e`
  :host([opening]),
  :host([closing]) {
    animation: 0.14s lumo-overlay-dummy-animation;
  }

  :host([opening]) [part='overlay'] {
    animation: 0.1s lumo-menu-overlay-enter ease-out both;
  }

  @keyframes lumo-menu-overlay-enter {
    0% {
      opacity: 0;
      transform: translateY(-4px);
    }
  }

  :host([closing]) [part='overlay'] {
    animation: 0.1s lumo-menu-overlay-exit both;
  }

  @keyframes lumo-menu-overlay-exit {
    100% {
      opacity: 0;
    }
  }
`;c(``,le,{moduleId:`lumo-menu-overlay-core`});var ue=[ce,le,e`
  /* Small viewport (bottom sheet) styles */
  /* Use direct media queries instead of the state attributes ([phone] and [fullscreen]) provided by the elements */
  @media (max-width: 450px), (max-height: 450px) {
    :host {
      inset: 0 0 var(--vaadin-overlay-viewport-bottom, 0) 0 !important;
      align-items: stretch !important;
      justify-content: flex-end !important;
    }

    [part='overlay'] {
      max-height: 50vh;
      width: 100vw;
      border-radius: 0;
      box-shadow: var(--lumo-box-shadow-xl);
    }

    /* The content part scrolls instead of the overlay part, because of the gradient fade-out */
    [part='content'] {
      padding: 30px var(--lumo-space-m);
      max-height: inherit;
      box-sizing: border-box;
      overflow: auto;
      mask-image: linear-gradient(transparent, #000 40px, #000 calc(100% - 40px), transparent);
    }

    [part='backdrop'] {
      display: block;
    }

    /* Animations */

    :host([opening]) [part='overlay'] {
      animation: 0.2s lumo-mobile-menu-overlay-enter cubic-bezier(0.215, 0.61, 0.355, 1) both;
    }

    :host([closing]),
    :host([closing]) [part='backdrop'] {
      animation-delay: 0.14s;
    }

    :host([closing]) [part='overlay'] {
      animation: 0.14s 0.14s lumo-mobile-menu-overlay-exit cubic-bezier(0.55, 0.055, 0.675, 0.19) both;
    }
  }

  @keyframes lumo-mobile-menu-overlay-enter {
    0% {
      transform: translateY(150%);
    }
  }

  @keyframes lumo-mobile-menu-overlay-exit {
    100% {
      transform: translateY(150%);
    }
  }
`];c(``,ue,{moduleId:`lumo-menu-overlay`}),c(`vcf-date-range-picker-overlay`,e`
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
      `,{include:[`lumo-menu-overlay`],moduleId:`lumo-vcf-date-range-picker-overlay`}),c(`vcf-date-range-picker-overlay-content`,e`
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
    `,{moduleId:`lumo-vcf-date-range-picker-overlay-content`}),c(`vcf-date-range-month-calendar`,e`
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
      `,{moduleId:`lumo-vcf-date-range-month-calendar`});var de=document.createElement(`template`);de.innerHTML=`
  <style>
    @keyframes vcf-date-range-picker-month-calendar-focus-date {
      50% {
        box-shadow: 0 0 0 2px transparent;
      }
    }
  </style>
  `,document.head.appendChild(de.content),p(`Lumo .js mixins are deprecated and will be removed in V26`);var fe=e`
  [part$='button'] {
    flex: none;
    width: 1em;
    height: 1em;
    line-height: 1;
    font-size: var(--lumo-icon-size-m);
    text-align: center;
    color: var(--lumo-contrast-60pct);
    transition: 0.2s color;
    cursor: var(--lumo-clickable-cursor);
  }

  [part$='button']:hover {
    color: var(--lumo-contrast-90pct);
  }

  :host([disabled]) [part$='button'],
  :host([readonly]) [part$='button'] {
    color: var(--lumo-contrast-20pct);
    cursor: default;
  }

  [part$='button']::before {
    font-family: 'lumo-icons';
    display: block;
  }
`;c(``,fe,{moduleId:`lumo-field-button`}),c(`vcf-date-range-picker`,e`
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
      `,{include:[`lumo-field-button`],moduleId:`lumo-vcf-date-range-picker`}),c(`vcf-date-range-picker-text-field`,e`
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
      `,{moduleId:`lumo-vcf-date-range-picker-text-field`}),c(`vcf-date-range-picker-text-field`,e`
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
      `,{moduleId:`vcf-date-range-picker-text-field-styles`});var pe=class extends oe{static get is(){return`vcf-date-range-picker-text-field`}_onClearButtonClick(e){e.preventDefault(),this.inputElement.focus(),this.__clear()}__clear(){this.clear();let e=new Event(`input`,{bubbles:!0,composed:!0});e.__fromClearButton=!0;let t=new Event(`change`,{bubbles:!0});t.__fromClearButton=!0,this.inputElement.dispatchEvent(e),this.inputElement.dispatchEvent(t)}};customElements.define(pe.is,pe),window.JSCompiler_renameProperty=function(e,t){return e};var me=/(url\()([^)]*)(\))/g,he=/(^\/[^\/])|(^#)|(^[\w-\d]*:)/,ge,m;function _e(e,t){if(e&&he.test(e)||e===`//`)return e;if(ge===void 0){ge=!1;try{let e=new URL(`b`,`http://a`);e.pathname=`c%20d`,ge=e.href===`http://a/c%20d`}catch{}}if(t||=document.baseURI||window.location.href,ge)try{return new URL(e,t).href}catch{return e}return m||(m=document.implementation.createHTMLDocument(`temp`),m.base=m.createElement(`base`),m.head.appendChild(m.base),m.anchor=m.createElement(`a`),m.body.appendChild(m.anchor)),m.base.href=t,m.anchor.href=e,m.anchor.href||e}function ve(e,t){return e.replace(me,function(e,n,r,i){return n+`'`+_e(r.replace(/["']/g,``),t)+`'`+i})}function ye(e){return e.substring(0,e.lastIndexOf(`/`)+1)}var be=!window.ShadyDOM||!window.ShadyDOM.inUse;!window.ShadyCSS||window.ShadyCSS.nativeCss,window.customElements.polyfillWrapFlushCallback;var xe=be&&`adoptedStyleSheets`in Document.prototype&&`replaceSync`in CSSStyleSheet.prototype&&(()=>{try{let e=new CSSStyleSheet;e.replaceSync(``);let t=document.createElement(`div`);return t.attachShadow({mode:`open`}),t.shadowRoot.adoptedStyleSheets=[e],t.shadowRoot.adoptedStyleSheets[0]===e}catch{return!1}})(),Se=window.Polymer&&window.Polymer.rootPath||ye(document.baseURI||window.location.href),Ce=window.Polymer&&window.Polymer.sanitizeDOMValue||void 0,we=window.Polymer&&window.Polymer.setPassiveTouchGestures||!1,h=window.Polymer&&window.Polymer.strictTemplatePolicy||!1,Te=window.Polymer&&window.Polymer.allowTemplateFromDomModule||!1,g=window.Polymer&&window.Polymer.legacyOptimizations||!1,Ee=window.Polymer&&window.Polymer.legacyWarnings||!1,De=window.Polymer&&window.Polymer.syncInitialRender||!1,Oe=window.Polymer&&window.Polymer.legacyUndefined||!1,ke=window.Polymer&&window.Polymer.orderedComputed||!1,Ae=!0,je=window.Polymer&&window.Polymer.removeNestedTemplates||!1,Me=window.Polymer&&window.Polymer.fastDomIf||!1,Ne=window.Polymer&&window.Polymer.suppressTemplateNotifications||!1,Pe=window.Polymer&&window.Polymer.legacyNoObservedAttributes||!1,Fe=window.Polymer&&window.Polymer.useAdoptedStyleSheetsWithBuiltCSS||!1,Ie=0;function Le(){}Le.prototype.__mixinApplications,Le.prototype.__mixinSet;var _=function(e){let t=e.__mixinApplications;t||(t=new WeakMap,e.__mixinApplications=t);let n=Ie++;function r(r){let i=r.__mixinSet;if(i&&i[n])return r;let a=t,o=a.get(r);if(!o){o=e(r),a.set(r,o);let t=Object.create(o.__mixinSet||i||null);t[n]=!0,o.__mixinSet=t}return o}return r},Re={},ze={};function Be(e,t){Re[e]=ze[e.toLowerCase()]=t}function Ve(e){return Re[e]||ze[e.toLowerCase()]}function He(e){e.querySelector(`style`)&&console.warn(`dom-module %s has style outside template`,e.id)}var v=class extends HTMLElement{static get observedAttributes(){return[`id`]}static import(e,t){if(e){let n=Ve(e);return n&&t?n.querySelector(t):n}return null}attributeChangedCallback(e,t,n,r){t!==n&&this.register()}get assetpath(){if(!this.__assetpath){let e=window.HTMLImports&&HTMLImports.importForElement?HTMLImports.importForElement(this)||document:this.ownerDocument,t=_e(this.getAttribute(`assetpath`)||``,e.baseURI);this.__assetpath=ye(t)}return this.__assetpath}register(e){if(e||=this.id,e){if(h&&Ve(e)!==void 0)throw Be(e,null),Error(`strictTemplatePolicy: dom-module ${e} re-registered`);this.id=e,Be(e,this),He(this)}}};v.prototype.modules=Re,customElements.define(`dom-module`,v);var Ue=`link[rel=import][type~=css]`,We=`include`,Ge=`shady-unscoped`;function Ke(e){return v.import(e)}function qe(e){let t=ve((e.body?e.body:e).textContent,e.baseURI),n=document.createElement(`style`);return n.textContent=t,n}function Je(e){let t=e.trim().split(/\s+/),n=[];for(let e=0;e<t.length;e++)n.push(...Ye(t[e]));return n}function Ye(e){let t=Ke(e);if(!t)return console.warn(`Could not find style data in module named`,e),[];if(t._styles===void 0){let e=[];e.push(...Qe(t));let n=t.querySelector(`template`);n&&e.push(...Xe(n,t.assetpath)),t._styles=e}return t._styles}function Xe(e,t){if(!e._styles){let n=[],r=e.content.querySelectorAll(`style`);for(let e=0;e<r.length;e++){let i=r[e],a=i.getAttribute(We);a&&n.push(...Je(a).filter(function(e,t,n){return n.indexOf(e)===t})),t&&(i.textContent=ve(i.textContent,t)),n.push(i)}e._styles=n}return e._styles}function Ze(e){let t=Ke(e);return t?Qe(t):[]}function Qe(e){let t=[],n=e.querySelectorAll(Ue);for(let e=0;e<n.length;e++){let r=n[e];if(r.import){let e=r.import,n=r.hasAttribute(Ge);if(n&&!e._unscopedStyle){let t=qe(e);t.setAttribute(Ge,``),e._unscopedStyle=t}else e._style||=qe(e);t.push(n?e._unscopedStyle:e._style)}}return t}function $e(e){let t=e.trim().split(/\s+/),n=``;for(let e=0;e<t.length;e++)n+=et(t[e]);return n}function et(e){let t=Ke(e);if(t&&t._cssText===void 0){let e=nt(t),n=t.querySelector(`template`);n&&(e+=tt(n,t.assetpath)),t._cssText=e||null}return t||console.warn(`Could not find style data in module named`,e),t&&t._cssText||``}function tt(e,t){let n=``,r=Xe(e,t);for(let e=0;e<r.length;e++){let t=r[e];t.parentNode&&t.parentNode.removeChild(t),n+=t.textContent}return n}function nt(e){let t=``,n=Qe(e);for(let e=0;e<n.length;e++)t+=n[e].textContent;return t}var y=window.ShadyDOM&&window.ShadyDOM.noPatch&&window.ShadyDOM.wrap?window.ShadyDOM.wrap:window.ShadyDOM?e=>ShadyDOM.patch(e):e=>e;function rt(e){return e.indexOf(`.`)>=0}function b(e){let t=e.indexOf(`.`);return t===-1?e:e.slice(0,t)}function it(e,t){return e.indexOf(t+`.`)===0}function at(e,t){return t.indexOf(e+`.`)===0}function x(e,t,n){return t+n.slice(e.length)}function ot(e,t){return e===t||it(e,t)||at(e,t)}function st(e){if(Array.isArray(e)){let t=[];for(let n=0;n<e.length;n++){let r=e[n].toString().split(`.`);for(let e=0;e<r.length;e++)t.push(r[e])}return t.join(`.`)}return e}function ct(e){return Array.isArray(e)?st(e).split(`.`):e.toString().split(`.`)}function S(e,t,n){let r=e,i=ct(t);for(let e=0;e<i.length;e++){if(!r)return;let t=i[e];r=r[t]}return n&&(n.path=i.join(`.`)),r}function lt(e,t,n){let r=e,i=ct(t),a=i[i.length-1];if(i.length>1){for(let e=0;e<i.length-1;e++){let t=i[e];if(r=r[t],!r)return}r[a]=n}else r[t]=n;return i.join(`.`)}var ut={},dt=/-[a-z]/g,ft=/([A-Z])/g;function pt(e){return ut[e]||(ut[e]=e.indexOf(`-`)<0?e:e.replace(dt,e=>e[1].toUpperCase()))}function mt(e){return ut[e]||(ut[e]=e.replace(ft,`-$1`).toLowerCase())}var ht=0,gt=0,C=[],_t=0,vt=!1,yt=document.createTextNode(``);new window.MutationObserver(bt).observe(yt,{characterData:!0});function bt(){vt=!1;let e=C.length;for(let t=0;t<e;t++){let e=C[t];if(e)try{e()}catch(e){setTimeout(()=>{throw e})}}C.splice(0,e),gt+=e}for(var w={after(e){return{run(t){return window.setTimeout(t,e)},cancel(e){window.clearTimeout(e)}}},run(e,t){return window.setTimeout(e,t)},cancel(e){window.clearTimeout(e)}},T={run(e){return vt||(vt=!0,yt.textContent=_t++),C.push(e),ht++},cancel(e){let t=e-gt;if(t>=0){if(!C[t])throw Error(`invalid async handle: `+e);C[t]=null}}},xt=T,St=_(e=>{class t extends e{static createProperties(e){let t=this.prototype;for(let n in e)n in t||t._createPropertyAccessor(n)}static attributeNameForProperty(e){return e.toLowerCase()}static typeForProperty(e){}_createPropertyAccessor(e,t){this._addPropertyToAttributeMap(e),this.hasOwnProperty(JSCompiler_renameProperty(`__dataHasAccessor`,this))||(this.__dataHasAccessor=Object.assign({},this.__dataHasAccessor)),this.__dataHasAccessor[e]||(this.__dataHasAccessor[e]=!0,this._definePropertyAccessor(e,t))}_addPropertyToAttributeMap(e){this.hasOwnProperty(JSCompiler_renameProperty(`__dataAttributes`,this))||(this.__dataAttributes=Object.assign({},this.__dataAttributes));let t=this.__dataAttributes[e];return t||(t=this.constructor.attributeNameForProperty(e),this.__dataAttributes[t]=e),t}_definePropertyAccessor(e,t){Object.defineProperty(this,e,{get(){return this.__data[e]},set:t?function(){}:function(t){this._setPendingProperty(e,t,!0)&&this._invalidateProperties()}})}constructor(){super(),this.__dataEnabled=!1,this.__dataReady=!1,this.__dataInvalid=!1,this.__data={},this.__dataPending=null,this.__dataOld=null,this.__dataInstanceProps=null,this.__dataCounter=0,this.__serializing=!1,this._initializeProperties()}ready(){this.__dataReady=!0,this._flushProperties()}_initializeProperties(){for(let e in this.__dataHasAccessor)this.hasOwnProperty(e)&&(this.__dataInstanceProps=this.__dataInstanceProps||{},this.__dataInstanceProps[e]=this[e],delete this[e])}_initializeInstanceProperties(e){Object.assign(this,e)}_setProperty(e,t){this._setPendingProperty(e,t)&&this._invalidateProperties()}_getProperty(e){return this.__data[e]}_setPendingProperty(e,t,n){let r=this.__data[e],i=this._shouldPropertyChange(e,t,r);return i&&(this.__dataPending||(this.__dataPending={},this.__dataOld={}),this.__dataOld&&!(e in this.__dataOld)&&(this.__dataOld[e]=r),this.__data[e]=t,this.__dataPending[e]=t),i}_isPropertyPending(e){return!!(this.__dataPending&&this.__dataPending.hasOwnProperty(e))}_invalidateProperties(){!this.__dataInvalid&&this.__dataReady&&(this.__dataInvalid=!0,xt.run(()=>{this.__dataInvalid&&(this.__dataInvalid=!1,this._flushProperties())}))}_enableProperties(){this.__dataEnabled||(this.__dataEnabled=!0,this.__dataInstanceProps&&=(this._initializeInstanceProperties(this.__dataInstanceProps),null),this.ready())}_flushProperties(){this.__dataCounter++;let e=this.__data,t=this.__dataPending,n=this.__dataOld;this._shouldPropertiesChange(e,t,n)&&(this.__dataPending=null,this.__dataOld=null,this._propertiesChanged(e,t,n)),this.__dataCounter--}_shouldPropertiesChange(e,t,n){return!!t}_propertiesChanged(e,t,n){}_shouldPropertyChange(e,t,n){return n!==t&&(n===n||t===t)}attributeChangedCallback(e,t,n,r){t!==n&&this._attributeToProperty(e,n),super.attributeChangedCallback&&super.attributeChangedCallback(e,t,n,r)}_attributeToProperty(e,t,n){if(!this.__serializing){let r=this.__dataAttributes,i=r&&r[e]||e;this[i]=this._deserializeValue(t,n||this.constructor.typeForProperty(i))}}_propertyToAttribute(e,t,n){this.__serializing=!0,n=arguments.length<3?this[e]:n,this._valueToNodeAttribute(this,n,t||this.constructor.attributeNameForProperty(e)),this.__serializing=!1}_valueToNodeAttribute(e,t,n){let r=this._serializeValue(t);(n===`class`||n===`name`||n===`slot`)&&(e=y(e)),r===void 0?e.removeAttribute(n):e.setAttribute(n,r===``&&window.trustedTypes?window.trustedTypes.emptyScript:r)}_serializeValue(e){switch(typeof e){case`boolean`:return e?``:void 0;default:return e?.toString()}}_deserializeValue(e,t){switch(t){case Boolean:return e!==null;case Number:return Number(e);default:return e}}}return t}),Ct={},wt=HTMLElement.prototype;wt;){let e=Object.getOwnPropertyNames(wt);for(let t=0;t<e.length;t++)Ct[e[t]]=!0;wt=Object.getPrototypeOf(wt)}var Tt=window.trustedTypes?e=>trustedTypes.isHTML(e)||trustedTypes.isScript(e)||trustedTypes.isScriptURL(e):()=>!1;function Et(e,t){if(!Ct[t]){let n=e[t];n!==void 0&&(e.__data?e._setPendingProperty(t,n):(e.__dataProto?e.hasOwnProperty(JSCompiler_renameProperty(`__dataProto`,e))||(e.__dataProto=Object.create(e.__dataProto)):e.__dataProto={},e.__dataProto[t]=n))}}var Dt=_(e=>{let t=St(e);class n extends t{static createPropertiesForAttributes(){let e=this.observedAttributes;for(let t=0;t<e.length;t++)this.prototype._createPropertyAccessor(pt(e[t]))}static attributeNameForProperty(e){return mt(e)}_initializeProperties(){this.__dataProto&&=(this._initializeProtoProperties(this.__dataProto),null),super._initializeProperties()}_initializeProtoProperties(e){for(let t in e)this._setProperty(t,e[t])}_ensureAttribute(e,t){let n=this;n.hasAttribute(e)||this._valueToNodeAttribute(n,t,e)}_serializeValue(e){switch(typeof e){case`object`:if(e instanceof Date)return e.toString();if(e){if(Tt(e))return e;try{return JSON.stringify(e)}catch{return``}}default:return super._serializeValue(e)}}_deserializeValue(e,t){let n;switch(t){case Object:try{n=JSON.parse(e)}catch{n=e}break;case Array:try{n=JSON.parse(e)}catch{n=null,console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${e}`)}break;case Date:n=isNaN(e)?String(e):Number(e),n=new Date(n);break;default:n=super._deserializeValue(e,t)}return n}_definePropertyAccessor(e,t){Et(this,e),super._definePropertyAccessor(e,t)}_hasAccessor(e){return this.__dataHasAccessor&&this.__dataHasAccessor[e]}_isPropertyPending(e){return!!(this.__dataPending&&e in this.__dataPending)}}return n}),Ot={"dom-if":!0,"dom-repeat":!0},kt=!1,At=!1;function jt(){if(!kt){kt=!0;let e=document.createElement(`textarea`);e.placeholder=`a`,At=e.placeholder===e.textContent}return At}function Mt(e){jt()&&e.localName===`textarea`&&e.placeholder&&e.placeholder===e.textContent&&(e.textContent=null)}var Nt=(()=>{let e=window.trustedTypes&&window.trustedTypes.createPolicy(`polymer-template-event-attribute-policy`,{createScript:e=>e});return(t,n,r)=>{let i=n.getAttribute(r);if(e&&r.startsWith(`on-`)){t.setAttribute(r,e.createScript(i,r));return}t.setAttribute(r,i)}})();function Pt(e){let t=e.getAttribute(`is`);if(t&&Ot[t]){let n=e;for(n.removeAttribute(`is`),e=n.ownerDocument.createElement(t),n.parentNode.replaceChild(e,n),e.appendChild(n);n.attributes.length;){let{name:t}=n.attributes[0];Nt(e,n,t),n.removeAttribute(t)}}return e}function Ft(e,t){let n=t.parentInfo&&Ft(e,t.parentInfo);if(n){for(let e=n.firstChild,r=0;e;e=e.nextSibling)if(t.parentIndex===r++)return e}else return e}function It(e,t,n,r){r.id&&(t[r.id]=n)}function Lt(e,t,n){if(n.events&&n.events.length)for(let r=0,i=n.events,a;r<i.length&&(a=i[r]);r++)e._addMethodEventListenerToNode(t,a.name,a.value,e)}function Rt(e,t,n,r){n.templateInfo&&(t._templateInfo=n.templateInfo,t._parentTemplateInfo=r)}function zt(e,t,n){return e=e._methodHost||e,function(t){e[n]?e[n](t,t.detail):console.warn("listener method `"+n+"` not defined")}}var Bt=_(e=>{class t extends e{static _parseTemplate(e,t){if(!e._templateInfo){let n=e._templateInfo={};n.nodeInfoList=[],n.nestedTemplate=!!t,n.stripWhiteSpace=t&&t.stripWhiteSpace||e.hasAttribute&&e.hasAttribute(`strip-whitespace`),this._parseTemplateContent(e,n,{parent:null})}return e._templateInfo}static _parseTemplateContent(e,t,n){return this._parseTemplateNode(e.content,t,n)}static _parseTemplateNode(e,t,n){let r=!1,i=e;return i.localName==`template`&&!i.hasAttribute(`preserve-content`)?r=this._parseTemplateNestedTemplate(i,t,n)||r:i.localName===`slot`&&(t.hasInsertionPoint=!0),Mt(i),i.firstChild&&this._parseTemplateChildNodes(i,t,n),i.hasAttributes&&i.hasAttributes()&&(r=this._parseTemplateNodeAttributes(i,t,n)||r),r||n.noted}static _parseTemplateChildNodes(e,t,n){if(e.localName!==`script`&&e.localName!==`style`)for(let r=e.firstChild,i=0,a;r;r=a){if(r.localName==`template`&&(r=Pt(r)),a=r.nextSibling,r.nodeType===Node.TEXT_NODE){let n=a;for(;n&&n.nodeType===Node.TEXT_NODE;)r.textContent+=n.textContent,a=n.nextSibling,e.removeChild(n),n=a;if(t.stripWhiteSpace&&!r.textContent.trim()){e.removeChild(r);continue}}let o={parentIndex:i,parentInfo:n};this._parseTemplateNode(r,t,o)&&(o.infoIndex=t.nodeInfoList.push(o)-1),r.parentNode&&i++}}static _parseTemplateNestedTemplate(e,t,n){let r=e,i=this._parseTemplate(r,t);return(i.content=r.content.ownerDocument.createDocumentFragment()).appendChild(r.content),n.templateInfo=i,!0}static _parseTemplateNodeAttributes(e,t,n){let r=!1,i=Array.from(e.attributes);for(let a=i.length-1,o;o=i[a];a--)r=this._parseTemplateNodeAttribute(e,t,n,o.name,o.value)||r;return r}static _parseTemplateNodeAttribute(e,t,n,r,i){return r.slice(0,3)===`on-`?(e.removeAttribute(r),n.events=n.events||[],n.events.push({name:r.slice(3),value:i}),!0):r===`id`&&(n.id=i,!0)}static _contentForTemplate(e){let t=e._templateInfo;return t&&t.content||e.content}_stampTemplate(e,t){e&&!e.content&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate&&HTMLTemplateElement.decorate(e),t||=this.constructor._parseTemplate(e);let n=t.nodeInfoList,r=t.content||e.content,i=document.importNode(r,!0);i.__noInsertionPoint=!t.hasInsertionPoint;let a=i.nodeList=Array(n.length);i.$={};for(let e=0,r=n.length,o;e<r&&(o=n[e]);e++){let n=a[e]=Ft(i,o);It(this,i.$,n,o),Rt(this,n,o,t),Lt(this,n,o)}return i=i,i}_addMethodEventListenerToNode(e,t,n,r){r||=e;let i=zt(r,t,n);return this._addEventListenerToNode(e,t,i),i}_addEventListenerToNode(e,t,n){e.addEventListener(t,n)}_removeEventListenerFromNode(e,t,n){e.removeEventListener(t,n)}}return t}),Vt=0,Ht=[],E={COMPUTE:`__computeEffects`,REFLECT:`__reflectEffects`,NOTIFY:`__notifyEffects`,PROPAGATE:`__propagateEffects`,OBSERVE:`__observeEffects`,READ_ONLY:`__readOnly`},Ut=`__computeInfo`,Wt=/[A-Z]/;function Gt(e,t,n){let r=e[t];if(!r)r=e[t]={};else if(!e.hasOwnProperty(t)&&(r=e[t]=Object.create(e[t]),n))for(let e in r){let t=r[e],n=r[e]=Array(t.length);for(let e=0;e<t.length;e++)n[e]=t[e]}return r}function D(e,t,n,r,i,a){if(t){let o=!1,s=Vt++;for(let c in n){let l=t[i?b(c):c];if(l)for(let t=0,u=l.length,d;t<u&&(d=l[t]);t++)(!d.info||d.info.lastRun!==s)&&(!i||qt(c,d.trigger))&&(d.info&&(d.info.lastRun=s),d.fn(e,c,n,r,d.info,i,a),o=!0)}return o}return!1}function Kt(e,t,n,r,i,a,o,s){let c=!1,l=t[o?b(r):r];if(l)for(let t=0,u=l.length,d;t<u&&(d=l[t]);t++)(!d.info||d.info.lastRun!==n)&&(!o||qt(r,d.trigger))&&(d.info&&(d.info.lastRun=n),d.fn(e,r,i,a,d.info,o,s),c=!0);return c}function qt(e,t){if(t){let n=t.name;return n==e||!!(t.structured&&it(n,e))||!!(t.wildcard&&at(n,e))}return!0}function Jt(e,t,n,r,i){let a=typeof i.method==`string`?e[i.method]:i.method,o=i.property;a?a.call(e,e.__data[o],r[o]):i.dynamicFn||console.warn("observer method `"+i.method+"` not defined")}function Yt(e,t,n,r,i){let a=e[E.NOTIFY],o,s=Vt++;for(let c in t)t[c]&&(a&&Kt(e,a,s,c,n,r,i)||i&&Xt(e,c,n))&&(o=!0);let c;o&&(c=e.__dataHost)&&c._invalidateProperties&&c._invalidateProperties()}function Xt(e,t,n){let r=b(t);return r!==t&&(Zt(e,mt(r)+`-changed`,n[t],t),!0)}function Zt(e,t,n,r){let i={value:n,queueProperty:!0};r&&(i.path=r),y(e).dispatchEvent(new CustomEvent(t,{detail:i}))}function Qt(e,t,n,r,i,a){let o=(a?b(t):t)==t?null:t,s=o?S(e,o):e.__data[t];o&&s===void 0&&(s=n[t]),Zt(e,i.eventName,s,o)}function $t(e,t,n,r,i){let a,o=e.detail,s=o&&o.path;s?(r=x(n,r,s),a=o&&o.value):a=e.currentTarget[n],a=i?!a:a,(!t[E.READ_ONLY]||!t[E.READ_ONLY][r])&&t._setPendingPropertyOrPath(r,a,!0,!!s)&&(!o||!o.queueProperty)&&t._invalidateProperties()}function en(e,t,n,r,i){let a=e.__data[t];Ce&&(a=Ce(a,i.attrName,`attribute`,e)),e._propertyToAttribute(t,i.attrName,a)}function tn(e,t,n,r){let i=e[E.COMPUTE];if(i){if(ke){Vt++;let a=an(e),o=[];for(let e in t)rn(e,i,o,a,r);let s;for(;s=o.shift();)sn(e,``,t,n,s)&&rn(s.methodInfo,i,o,a,r);Object.assign(n,e.__dataOld),Object.assign(t,e.__dataPending),e.__dataPending=null}else{let a=t;for(;D(e,i,a,n,r);)Object.assign(n,e.__dataOld),Object.assign(t,e.__dataPending),a=e.__dataPending,e.__dataPending=null}}}var nn=(e,t,n)=>{let r=0,i=t.length-1,a=-1;for(;r<=i;){let o=r+i>>1,s=n.get(t[o].methodInfo)-n.get(e.methodInfo);if(s<0)r=o+1;else if(s>0)i=o-1;else{a=o;break}}a<0&&(a=i+1),t.splice(a,0,e)},rn=(e,t,n,r,i)=>{let a=t[i?b(e):e];if(a)for(let t=0;t<a.length;t++){let o=a[t];o.info.lastRun!==Vt&&(!i||qt(e,o.trigger))&&(o.info.lastRun=Vt,nn(o.info,n,r))}};function an(e){let t=e.constructor.__orderedComputedDeps;if(!t){t=new Map;let n=e[E.COMPUTE],{counts:r,ready:i,total:a}=on(e),o;for(;o=i.shift();){t.set(o,t.size);let e=n[o];e&&e.forEach(e=>{let t=e.info.methodInfo;--a,--r[t]===0&&i.push(t)})}a!==0&&console.warn(`Computed graph for ${e.localName} incomplete; circular?`),e.constructor.__orderedComputedDeps=t}return t}function on(e){let t=e[Ut],n={},r=e[E.COMPUTE],i=[],a=0;for(let e in t){let r=t[e];a+=n[e]=r.args.filter(e=>!e.literal).length+ +!!r.dynamicFn}for(let e in r)t[e]||i.push(e);return{counts:n,ready:i,total:a}}function sn(e,t,n,r,i){let a=yn(e,t,n,r,i);if(a===Ht)return!1;let o=i.methodInfo;return e.__dataHasAccessor&&e.__dataHasAccessor[o]?e._setPendingProperty(o,a,!0):(e[o]=a,!1)}function cn(e,t,n){let r=e.__dataLinkedPaths;if(r){let i;for(let a in r){let o=r[a];at(a,t)?(i=x(a,o,t),e._setPendingPropertyOrPath(i,n,!0,!0)):at(o,t)&&(i=x(o,a,t),e._setPendingPropertyOrPath(i,n,!0,!0))}}}function ln(e,t,n,r,i,a,o){n.bindings=n.bindings||[];let s={kind:r,target:i,parts:a,literal:o,isCompound:a.length!==1};if(n.bindings.push(s),mn(s)){let{event:e,negate:t}=s.parts[0];s.listenerEvent=e||mt(i)+`-changed`,s.listenerNegate=t}let c=t.nodeInfoList.length;for(let n=0;n<s.parts.length;n++){let r=s.parts[n];r.compoundIndex=n,un(e,t,s,r,c)}}function un(e,t,n,r,i){if(!r.literal){if(n.kind===`attribute`&&n.target[0]===`-`)console.warn(`Cannot set attribute `+n.target+` because "-" is not a valid attribute starting character`);else{let a=r.dependencies,o={index:i,binding:n,part:r,evaluator:e};for(let n=0;n<a.length;n++){let r=a[n];typeof r==`string`&&(r=Tn(r),r.wildcard=!0),e._addTemplatePropertyEffect(t,r.rootProperty,{fn:dn,info:o,trigger:r})}}}}function dn(e,t,n,r,i,a,o){let s=o[i.index],c=i.binding,l=i.part;if(a&&l.source&&t.length>l.source.length&&c.kind==`property`&&!c.isCompound&&s.__isPropertyEffectsClient&&s.__dataHasAccessor&&s.__dataHasAccessor[c.target]){let r=n[t];t=x(l.source,c.target,t),s._setPendingPropertyOrPath(t,r,!1,!0)&&e._enqueueClient(s)}else{let o=i.evaluator._evaluateBinding(e,l,t,n,r,a);o!==Ht&&fn(e,s,c,l,o)}}function fn(e,t,n,r,i){if(i=pn(t,i,n,r),Ce&&(i=Ce(i,n.target,n.kind,t)),n.kind==`attribute`)e._valueToNodeAttribute(t,i,n.target);else{let r=n.target;t.__isPropertyEffectsClient&&t.__dataHasAccessor&&t.__dataHasAccessor[r]?(!t[E.READ_ONLY]||!t[E.READ_ONLY][r])&&t._setPendingProperty(r,i)&&e._enqueueClient(t):e._setUnmanagedPropertyToNode(t,r,i)}}function pn(e,t,n,r){if(n.isCompound){let i=e.__dataCompoundStorage[n.target];i[r.compoundIndex]=t,t=i.join(``)}return n.kind!==`attribute`&&(n.target===`textContent`||n.target===`value`&&(e.localName===`input`||e.localName===`textarea`))&&(t??=``),t}function mn(e){return!!e.target&&e.kind!=`attribute`&&e.kind!=`text`&&!e.isCompound&&e.parts[0].mode===`{`}function hn(e,t){let{nodeList:n,nodeInfoList:r}=t;if(r.length)for(let t=0;t<r.length;t++){let i=r[t],a=n[t],o=i.bindings;if(o)for(let t=0;t<o.length;t++){let n=o[t];gn(a,n),_n(a,e,n)}a.__dataHost=e}}function gn(e,t){if(t.isCompound){let n=e.__dataCompoundStorage||(e.__dataCompoundStorage={}),r=t.parts,i=Array(r.length);for(let e=0;e<r.length;e++)i[e]=r[e].literal;let a=t.target;n[a]=i,t.literal&&t.kind==`property`&&(a===`className`&&(e=y(e)),e[a]=t.literal)}}function _n(e,t,n){if(n.listenerEvent){let r=n.parts[0];e.addEventListener(n.listenerEvent,function(e){$t(e,t,n.target,r.source,r.negate)})}}function vn(e,t,n,r,i,a){a=t.static||a&&(typeof a!=`object`||a[t.methodName]);let o={methodName:t.methodName,args:t.args,methodInfo:i,dynamicFn:a};for(let i=0,a;i<t.args.length&&(a=t.args[i]);i++)a.literal||e._addPropertyEffect(a.rootProperty,n,{fn:r,info:o,trigger:a});return a&&e._addPropertyEffect(t.methodName,n,{fn:r,info:o}),o}function yn(e,t,n,r,i){let a=e._methodHost||e,o=a[i.methodName];if(o){let r=e._marshalArgs(i.args,t,n);return r===Ht?Ht:o.apply(a,r)}i.dynamicFn||console.warn("method `"+i.methodName+"` not defined")}var bn=[],xn=RegExp(`(\\[\\[|{{)\\s*(?:(!)\\s*)?((?:[a-zA-Z_$][\\w.:$\\-*]*)\\s*(?:\\(\\s*(?:(?:(?:((?:[a-zA-Z_$][\\w.:$\\-*]*)|(?:[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)|(?:(?:'(?:[^'\\\\]|\\\\.)*')|(?:"(?:[^"\\\\]|\\\\.)*")))\\s*)(?:,\\s*(?:((?:[a-zA-Z_$][\\w.:$\\-*]*)|(?:[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)|(?:(?:'(?:[^'\\\\]|\\\\.)*')|(?:"(?:[^"\\\\]|\\\\.)*")))\\s*))*)?)\\)\\s*)?)(?:]]|}})`,`g`);function Sn(e){let t=``;for(let n=0;n<e.length;n++){let r=e[n].literal;t+=r||``}return t}function Cn(e){let t=e.match(/([^\s]+?)\(([\s\S]*)\)/);if(t){let e={methodName:t[1],static:!0,args:bn};return t[2].trim()?wn(t[2].replace(/\\,/g,`&comma;`).split(`,`),e):e}return null}function wn(e,t){return t.args=e.map(function(e){let n=Tn(e);return n.literal||(t.static=!1),n},this),t}function Tn(e){let t=e.trim().replace(/&comma;/g,`,`).replace(/\\(.)/g,`$1`),n={name:t,value:``,literal:!1},r=t[0];switch(r===`-`&&(r=t[1]),r>=`0`&&r<=`9`&&(r=`#`),r){case`'`:case`"`:n.value=t.slice(1,-1),n.literal=!0;break;case`#`:n.value=Number(t),n.literal=!0}return n.literal||(n.rootProperty=b(t),n.structured=rt(t),n.structured&&(n.wildcard=t.slice(-2)==`.*`,n.wildcard&&(n.name=t.slice(0,-2)))),n}function En(e,t,n){let r=S(e,n);return r===void 0&&(r=t[n]),r}function Dn(e,t,n,r){let i={indexSplices:r};Oe&&!e._overrideLegacyUndefined&&(t.splices=i),e.notifyPath(n+`.splices`,i),e.notifyPath(n+`.length`,t.length),Oe&&!e._overrideLegacyUndefined&&(i.indexSplices=[])}function O(e,t,n,r,i,a){Dn(e,t,n,[{index:r,addedCount:i,removed:a,object:t,type:`splice`}])}function On(e){return e[0].toUpperCase()+e.substring(1)}var kn=_(e=>{let t=Bt(Dt(e));class n extends t{constructor(){super(),this.__isPropertyEffectsClient=!0,this.__dataClientsReady,this.__dataPendingClients,this.__dataToNotify,this.__dataLinkedPaths,this.__dataHasPaths,this.__dataCompoundStorage,this.__dataHost,this.__dataTemp,this.__dataClientsInitialized,this.__data,this.__dataPending,this.__dataOld,this.__computeEffects,this.__computeInfo,this.__reflectEffects,this.__notifyEffects,this.__propagateEffects,this.__observeEffects,this.__readOnly,this.__templateInfo,this._overrideLegacyUndefined}get PROPERTY_EFFECT_TYPES(){return E}_initializeProperties(){super._initializeProperties(),this._registerHost(),this.__dataClientsReady=!1,this.__dataPendingClients=null,this.__dataToNotify=null,this.__dataLinkedPaths=null,this.__dataHasPaths=!1,this.__dataCompoundStorage=this.__dataCompoundStorage||null,this.__dataHost=this.__dataHost||null,this.__dataTemp={},this.__dataClientsInitialized=!1}_registerHost(){if(An.length){let e=An[An.length-1];e._enqueueClient(this),this.__dataHost=e}}_initializeProtoProperties(e){this.__data=Object.create(e),this.__dataPending=Object.create(e),this.__dataOld={}}_initializeInstanceProperties(e){let t=this[E.READ_ONLY];for(let n in e)(!t||!t[n])&&(this.__dataPending=this.__dataPending||{},this.__dataOld=this.__dataOld||{},this.__data[n]=this.__dataPending[n]=e[n])}_addPropertyEffect(e,t,n){this._createPropertyAccessor(e,t==E.READ_ONLY);let r=Gt(this,t,!0)[e];r||=this[t][e]=[],r.push(n)}_removePropertyEffect(e,t,n){let r=Gt(this,t,!0)[e],i=r.indexOf(n);i>=0&&r.splice(i,1)}_hasPropertyEffect(e,t){let n=this[t];return!!(n&&n[e])}_hasReadOnlyEffect(e){return this._hasPropertyEffect(e,E.READ_ONLY)}_hasNotifyEffect(e){return this._hasPropertyEffect(e,E.NOTIFY)}_hasReflectEffect(e){return this._hasPropertyEffect(e,E.REFLECT)}_hasComputedEffect(e){return this._hasPropertyEffect(e,E.COMPUTE)}_setPendingPropertyOrPath(e,t,n,r){if(r||b(Array.isArray(e)?e[0]:e)!==e){if(!r){let n=S(this,e);if(e=lt(this,e,t),!e||!super._shouldPropertyChange(e,t,n))return!1}if(this.__dataHasPaths=!0,this._setPendingProperty(e,t,n))return cn(this,e,t),!0}else if(this.__dataHasAccessor&&this.__dataHasAccessor[e])return this._setPendingProperty(e,t,n);else this[e]=t;return!1}_setUnmanagedPropertyToNode(e,t,n){(n!==e[t]||typeof n==`object`)&&(t===`className`&&(e=y(e)),e[t]=n)}_setPendingProperty(e,t,n){let r=this.__dataHasPaths&&rt(e),i=r?this.__dataTemp:this.__data;return this._shouldPropertyChange(e,t,i[e])?(this.__dataPending||(this.__dataPending={},this.__dataOld={}),e in this.__dataOld||(this.__dataOld[e]=this.__data[e]),r?this.__dataTemp[e]=t:this.__data[e]=t,this.__dataPending[e]=t,(r||this[E.NOTIFY]&&this[E.NOTIFY][e])&&(this.__dataToNotify=this.__dataToNotify||{},this.__dataToNotify[e]=n),!0):!1}_setProperty(e,t){this._setPendingProperty(e,t,!0)&&this._invalidateProperties()}_invalidateProperties(){this.__dataReady&&this._flushProperties()}_enqueueClient(e){this.__dataPendingClients=this.__dataPendingClients||[],e!==this&&this.__dataPendingClients.push(e)}_flushClients(){this.__dataClientsReady?this.__enableOrFlushClients():(this.__dataClientsReady=!0,this._readyClients(),this.__dataReady=!0)}__enableOrFlushClients(){let e=this.__dataPendingClients;if(e){this.__dataPendingClients=null;for(let t=0;t<e.length;t++){let n=e[t];n.__dataEnabled?n.__dataPending&&n._flushProperties():n._enableProperties()}}}_readyClients(){this.__enableOrFlushClients()}setProperties(e,t){for(let n in e)(t||!this[E.READ_ONLY]||!this[E.READ_ONLY][n])&&this._setPendingPropertyOrPath(n,e[n],!0);this._invalidateProperties()}ready(){this._flushProperties(),this.__dataClientsReady||this._flushClients(),this.__dataPending&&this._flushProperties()}_propertiesChanged(e,t,n){let r=this.__dataHasPaths;this.__dataHasPaths=!1;let i;tn(this,t,n,r),i=this.__dataToNotify,this.__dataToNotify=null,this._propagatePropertyChanges(t,n,r),this._flushClients(),D(this,this[E.REFLECT],t,n,r),D(this,this[E.OBSERVE],t,n,r),i&&Yt(this,i,t,n,r),this.__dataCounter==1&&(this.__dataTemp={})}_propagatePropertyChanges(e,t,n){this[E.PROPAGATE]&&D(this,this[E.PROPAGATE],e,t,n),this.__templateInfo&&this._runEffectsForTemplate(this.__templateInfo,e,t,n)}_runEffectsForTemplate(e,t,n,r){let i=(t,r)=>{D(this,e.propertyEffects,t,n,r,e.nodeList);for(let i=e.firstChild;i;i=i.nextSibling)this._runEffectsForTemplate(i,t,n,r)};e.runEffects?e.runEffects(i,t,r):i(t,r)}linkPaths(e,t){e=st(e),t=st(t),this.__dataLinkedPaths=this.__dataLinkedPaths||{},this.__dataLinkedPaths[e]=t}unlinkPaths(e){e=st(e),this.__dataLinkedPaths&&delete this.__dataLinkedPaths[e]}notifySplices(e,t){let n={path:``},r=S(this,e,n);Dn(this,r,n.path,t)}get(e,t){return S(t||this,e)}set(e,t,n){n?lt(n,e,t):(!this[E.READ_ONLY]||!this[E.READ_ONLY][e])&&this._setPendingPropertyOrPath(e,t,!0)&&this._invalidateProperties()}push(e,...t){let n={path:``},r=S(this,e,n),i=r.length,a=r.push(...t);return t.length&&O(this,r,n.path,i,t.length,[]),a}pop(e){let t={path:``},n=S(this,e,t),r=!!n.length,i=n.pop();return r&&O(this,n,t.path,n.length,0,[i]),i}splice(e,t,n,...r){let i={path:``},a=S(this,e,i);t<0?t=a.length-Math.floor(-t):t&&=Math.floor(t);let o;return o=arguments.length===2?a.splice(t):a.splice(t,n,...r),(r.length||o.length)&&O(this,a,i.path,t,r.length,o),o}shift(e){let t={path:``},n=S(this,e,t),r=!!n.length,i=n.shift();return r&&O(this,n,t.path,0,0,[i]),i}unshift(e,...t){let n={path:``},r=S(this,e,n),i=r.unshift(...t);return t.length&&O(this,r,n.path,0,t.length,[]),i}notifyPath(e,t){let n;if(arguments.length==1){let r={path:``};t=S(this,e,r),n=r.path}else n=Array.isArray(e)?st(e):e;this._setPendingPropertyOrPath(n,t,!0,!0)&&this._invalidateProperties()}_createReadOnlyProperty(e,t){this._addPropertyEffect(e,E.READ_ONLY),t&&(this[`_set`+On(e)]=function(t){this._setProperty(e,t)})}_createPropertyObserver(e,t,n){let r={property:e,method:t,dynamicFn:!!n};this._addPropertyEffect(e,E.OBSERVE,{fn:Jt,info:r,trigger:{name:e}}),n&&this._addPropertyEffect(t,E.OBSERVE,{fn:Jt,info:r,trigger:{name:t}})}_createMethodObserver(e,t){let n=Cn(e);if(!n)throw Error(`Malformed observer expression '`+e+`'`);vn(this,n,E.OBSERVE,yn,null,t)}_createNotifyingProperty(e){this._addPropertyEffect(e,E.NOTIFY,{fn:Qt,info:{eventName:mt(e)+`-changed`,property:e}})}_createReflectedProperty(e){let t=this.constructor.attributeNameForProperty(e);t[0]===`-`?console.warn(`Property `+e+` cannot be reflected to attribute `+t+` because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.`):this._addPropertyEffect(e,E.REFLECT,{fn:en,info:{attrName:t}})}_createComputedProperty(e,t,n){let r=Cn(t);if(!r)throw Error(`Malformed computed expression '`+t+`'`);let i=vn(this,r,E.COMPUTE,sn,e,n);Gt(this,Ut)[e]=i}_marshalArgs(e,t,n){let r=this.__data,i=[];for(let a=0,o=e.length;a<o;a++){let{name:o,structured:s,wildcard:c,value:l,literal:u}=e[a];if(!u){if(c){let e=at(o,t),i=En(r,n,e?t:o);l={path:e?t:o,value:i,base:e?S(r,o):i}}else l=s?En(r,n,o):r[o]}if(Oe&&!this._overrideLegacyUndefined&&l===void 0&&e.length>1)return Ht;i[a]=l}return i}static addPropertyEffect(e,t,n){this.prototype._addPropertyEffect(e,t,n)}static createPropertyObserver(e,t,n){this.prototype._createPropertyObserver(e,t,n)}static createMethodObserver(e,t){this.prototype._createMethodObserver(e,t)}static createNotifyingProperty(e){this.prototype._createNotifyingProperty(e)}static createReadOnlyProperty(e,t){this.prototype._createReadOnlyProperty(e,t)}static createReflectedProperty(e){this.prototype._createReflectedProperty(e)}static createComputedProperty(e,t,n){this.prototype._createComputedProperty(e,t,n)}static bindTemplate(e){return this.prototype._bindTemplate(e)}_bindTemplate(e,t){let n=this.constructor._parseTemplate(e),r=this.__preBoundTemplateInfo==n;if(!r)for(let e in n.propertyEffects)this._createPropertyAccessor(e);if(t){if(n=Object.create(n),n.wasPreBound=r,!this.__templateInfo)this.__templateInfo=n;else{let t=e._parentTemplateInfo||this.__templateInfo,r=t.lastChild;n.parent=t,t.lastChild=n,n.previousSibling=r,r?r.nextSibling=n:t.firstChild=n}}else this.__preBoundTemplateInfo=n;return n}static _addTemplatePropertyEffect(e,t,n){let r=e.hostProps=e.hostProps||{};r[t]=!0;let i=e.propertyEffects=e.propertyEffects||{};(i[t]=i[t]||[]).push(n)}_stampTemplate(e,t){t||=this._bindTemplate(e,!0),An.push(this);let n=super._stampTemplate(e,t);if(An.pop(),t.nodeList=n.nodeList,!t.wasPreBound){let e=t.childNodes=[];for(let t=n.firstChild;t;t=t.nextSibling)e.push(t)}return n.templateInfo=t,hn(this,t),this.__dataClientsReady&&(this._runEffectsForTemplate(t,this.__data,null,!1),this._flushClients()),n}_removeBoundDom(e){let t=e.templateInfo,{previousSibling:n,nextSibling:r,parent:i}=t;n?n.nextSibling=r:i&&(i.firstChild=r),r?r.previousSibling=n:i&&(i.lastChild=n),t.nextSibling=t.previousSibling=null;let a=t.childNodes;for(let e=0;e<a.length;e++){let t=a[e];y(y(t).parentNode).removeChild(t)}}static _parseTemplateNode(e,n,r){let i=t._parseTemplateNode.call(this,e,n,r);if(e.nodeType===Node.TEXT_NODE){let t=this._parseBindings(e.textContent,n);t&&(e.textContent=Sn(t)||` `,ln(this,n,r,`text`,`textContent`,t),i=!0)}return i}static _parseTemplateNodeAttribute(e,n,r,i,a){let o=this._parseBindings(a,n);if(o){let t=i,a=`property`;Wt.test(i)?a=`attribute`:i[i.length-1]==`$`&&(i=i.slice(0,-1),a=`attribute`);let s=Sn(o);return s&&a==`attribute`&&(i==`class`&&e.hasAttribute(`class`)&&(s+=` `+e.getAttribute(i)),e.setAttribute(i,s)),a==`attribute`&&t==`disable-upgrade$`&&e.setAttribute(i,``),e.localName===`input`&&t===`value`&&e.setAttribute(t,``),e.removeAttribute(t),a===`property`&&(i=pt(i)),ln(this,n,r,a,i,o,s),!0}return t._parseTemplateNodeAttribute.call(this,e,n,r,i,a)}static _parseTemplateNestedTemplate(e,n,r){let i=t._parseTemplateNestedTemplate.call(this,e,n,r),a=e.parentNode,o=r.templateInfo,s=a.localName===`dom-if`,c=a.localName===`dom-repeat`;je&&(s||c)&&(a.removeChild(e),r=r.parentInfo,r.templateInfo=o,r.noted=!0,i=!1);let l=o.hostProps;if(Me&&s)l&&(n.hostProps=Object.assign(n.hostProps||{},l),je||(r.parentInfo.noted=!0));else for(let e in l){let t=[{mode:`{`,source:e,dependencies:[e],hostProp:!0}];ln(this,n,r,`property`,`_host_`+e,t)}return i}static _parseBindings(e,t){let n=[],r=0,i;for(;(i=xn.exec(e))!==null;){i.index>r&&n.push({literal:e.slice(r,i.index)});let a=i[1][0],o=!!i[2],s=i[3].trim(),c=!1,l=``,u=-1;a==`{`&&(u=s.indexOf(`::`))>0&&(l=s.substring(u+2),s=s.substring(0,u),c=!0);let d=Cn(s),f=[];if(d){let{args:e,methodName:n}=d;for(let t=0;t<e.length;t++){let n=e[t];n.literal||f.push(n)}let r=t.dynamicFns;(r&&r[n]||d.static)&&(f.push(n),d.dynamicFn=!0)}else f.push(s);n.push({source:s,mode:a,negate:o,customEvent:c,signature:d,dependencies:f,event:l}),r=xn.lastIndex}if(r&&r<e.length){let t=e.substring(r);t&&n.push({literal:t})}return n.length?n:null}static _evaluateBinding(e,t,n,r,i,a){let o;return o=t.signature?yn(e,n,r,i,t.signature):n==t.source?a&&rt(n)?S(e,n):e.__data[n]:S(e,t.source),t.negate&&(o=!o),o}}return n}),An=[],jn=0;function Mn(){jn++}var Nn=[];function Pn(e){Nn.push(e)}function Fn(e){let t={};for(let n in e){let r=e[n];t[n]=typeof r==`function`?{type:r}:r}return t}var In=_(e=>{let t=St(e);function n(e){let t=Object.getPrototypeOf(e);return t.prototype instanceof i?t:null}function r(e){if(!e.hasOwnProperty(JSCompiler_renameProperty(`__ownProperties`,e))){let t=null;if(e.hasOwnProperty(JSCompiler_renameProperty(`properties`,e))){let n=e.properties;n&&(t=Fn(n))}e.__ownProperties=t}return e.__ownProperties}class i extends t{static get observedAttributes(){if(!this.hasOwnProperty(JSCompiler_renameProperty(`__observedAttributes`,this))){Pn(this.prototype);let e=this._properties;this.__observedAttributes=e?Object.keys(e).map(e=>this.prototype._addPropertyToAttributeMap(e)):[]}return this.__observedAttributes}static finalize(){if(!this.hasOwnProperty(JSCompiler_renameProperty(`__finalized`,this))){let e=n(this);e&&e.finalize(),this.__finalized=!0,this._finalizeClass()}}static _finalizeClass(){let e=r(this);e&&this.createProperties(e)}static get _properties(){if(!this.hasOwnProperty(JSCompiler_renameProperty(`__properties`,this))){let e=n(this);this.__properties=Object.assign({},e&&e._properties,r(this))}return this.__properties}static typeForProperty(e){let t=this._properties[e];return t&&t.type}_initializeProperties(){Mn(),this.constructor.finalize(),super._initializeProperties()}connectedCallback(){super.connectedCallback&&super.connectedCallback(),this._enableProperties()}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback()}}return i}),Ln=`3.5.2`,Rn=window.ShadyCSS&&window.ShadyCSS.cssBuild,zn=_(e=>{let t=In(kn(e));function n(e){if(!e.hasOwnProperty(JSCompiler_renameProperty(`__propertyDefaults`,e))){e.__propertyDefaults=null;let t=e._properties;for(let n in t){let r=t[n];`value`in r&&(e.__propertyDefaults=e.__propertyDefaults||{},e.__propertyDefaults[n]=r)}}return e.__propertyDefaults}function r(e){return e.hasOwnProperty(JSCompiler_renameProperty(`__ownObservers`,e))||(e.__ownObservers=e.hasOwnProperty(JSCompiler_renameProperty(`observers`,e))?e.observers:null),e.__ownObservers}function i(e,t,n,r){n.computed&&(n.readOnly=!0),n.computed&&(e._hasReadOnlyEffect(t)?console.warn(`Cannot redefine computed property '${t}'.`):e._createComputedProperty(t,n.computed,r)),n.readOnly&&!e._hasReadOnlyEffect(t)?e._createReadOnlyProperty(t,!n.computed):n.readOnly===!1&&e._hasReadOnlyEffect(t)&&console.warn(`Cannot make readOnly property '${t}' non-readOnly.`),n.reflectToAttribute&&!e._hasReflectEffect(t)?e._createReflectedProperty(t):n.reflectToAttribute===!1&&e._hasReflectEffect(t)&&console.warn(`Cannot make reflected property '${t}' non-reflected.`),n.notify&&!e._hasNotifyEffect(t)?e._createNotifyingProperty(t):n.notify===!1&&e._hasNotifyEffect(t)&&console.warn(`Cannot make notify property '${t}' non-notify.`),n.observer&&e._createPropertyObserver(t,n.observer,r[n.observer]),e._addPropertyToAttributeMap(t)}function a(e,t,n,r){if(!Rn){let i=t.content.querySelectorAll(`style`),a=Xe(t),o=Ze(n),s=t.content.firstElementChild;for(let n=0;n<o.length;n++){let i=o[n];i.textContent=e._processStyleText(i.textContent,r),t.content.insertBefore(i,s)}let c=0;for(let t=0;t<a.length;t++){let n=a[t],o=i[c];o===n?c++:(n=n.cloneNode(!0),o.parentNode.insertBefore(n,o)),n.textContent=e._processStyleText(n.textContent,r)}}if(window.ShadyCSS&&window.ShadyCSS.prepareTemplate(t,n),Fe&&Rn&&xe){let n=t.content.querySelectorAll(`style`);if(n){let t=``;Array.from(n).forEach(e=>{t+=e.textContent,e.parentNode.removeChild(e)}),e._styleSheet=new CSSStyleSheet,e._styleSheet.replaceSync(t)}}}function o(e){let t=null;if(e&&(!h||Te)&&(t=v.import(e,`template`),h&&!t))throw Error(`strictTemplatePolicy: expecting dom-module or null template for ${e}`);return t}class s extends t{static get polymerElementVersion(){return Ln}static _finalizeClass(){t._finalizeClass.call(this);let e=r(this);e&&this.createObservers(e,this._properties),this._prepareTemplate()}static _prepareTemplate(){let e=this.template;e&&(typeof e==`string`?(console.error(`template getter must return HTMLTemplateElement`),e=null):g||(e=e.cloneNode(!0))),this.prototype._template=e}static createProperties(e){for(let t in e)i(this.prototype,t,e[t],e)}static createObservers(e,t){let n=this.prototype;for(let r=0;r<e.length;r++)n._createMethodObserver(e[r],t)}static get template(){if(!this.hasOwnProperty(JSCompiler_renameProperty(`_template`,this))){let e=this.prototype.hasOwnProperty(JSCompiler_renameProperty(`_template`,this.prototype))?this.prototype._template:void 0;typeof e==`function`&&(e=e()),this._template=e===void 0?this.hasOwnProperty(JSCompiler_renameProperty(`is`,this))&&o(this.is)||Object.getPrototypeOf(this.prototype).constructor.template:e}return this._template}static set template(e){this._template=e}static get importPath(){if(!this.hasOwnProperty(JSCompiler_renameProperty(`_importPath`,this))){let e=this.importMeta;if(e)this._importPath=ye(e.url);else{let e=v.import(this.is);this._importPath=e&&e.assetpath||Object.getPrototypeOf(this.prototype).constructor.importPath}}return this._importPath}constructor(){super(),this._template,this._importPath,this.rootPath,this.importPath,this.root,this.$}_initializeProperties(){this.constructor.finalize(),this.constructor._finalizeTemplate(this.localName),super._initializeProperties(),this.rootPath=Se,this.importPath=this.constructor.importPath;let e=n(this.constructor);if(e)for(let t in e){let n=e[t];if(this._canApplyPropertyDefault(t)){let e=typeof n.value==`function`?n.value.call(this):n.value;this._hasAccessor(t)?this._setPendingProperty(t,e,!0):this[t]=e}}}_canApplyPropertyDefault(e){return!this.hasOwnProperty(e)}static _processStyleText(e,t){return ve(e,t)}static _finalizeTemplate(e){let t=this.prototype._template;if(t&&!t.__polymerFinalized){t.__polymerFinalized=!0;let n=this.importPath,r=n?_e(n):``;a(this,t,e,r),this.prototype._bindTemplate(t)}}connectedCallback(){window.ShadyCSS&&this._template&&window.ShadyCSS.styleElement(this),super.connectedCallback()}ready(){this._template&&(this.root=this._stampTemplate(this._template),this.$=this.root.$),super.ready()}_readyClients(){this._template&&(this.root=this._attachDom(this.root)),super._readyClients()}_attachDom(e){let t=y(this);if(t.attachShadow)return e?(t.shadowRoot||(t.attachShadow({mode:`open`,shadyUpgradeFragment:e}),t.shadowRoot.appendChild(e),this.constructor._styleSheet&&(t.shadowRoot.adoptedStyleSheets=[this.constructor._styleSheet])),De&&window.ShadyDOM&&window.ShadyDOM.flushInitial(t.shadowRoot),t.shadowRoot):null;throw Error("ShadowDOM not available. PolymerElement can create dom as children instead of in ShadowDOM by setting `this.root = this;` before `ready`.")}updateStyles(e){window.ShadyCSS&&window.ShadyCSS.styleSubtree(this,e)}resolveUrl(e,t){return!t&&this.importPath&&(t=_e(this.importPath)),_e(e,t)}static _parseTemplateContent(e,n,r){return n.dynamicFns=n.dynamicFns||this._properties,t._parseTemplateContent.call(this,e,n,r)}static _addTemplatePropertyEffect(e,n,r){return Ee&&!(n in this._properties)&&!(r.info.part.signature&&r.info.part.signature.static)&&!r.info.part.hostProp&&!e.nestedTemplate&&console.warn(`Property '${n}' used in template but not declared in 'properties'; attribute will not be observed.`),t._addTemplatePropertyEffect.call(this,e,n,r)}}return s}),Bn=window.trustedTypes&&trustedTypes.createPolicy(`polymer-html-literal`,{createHTML:e=>e}),Vn=class{constructor(e,t){Wn(e,t);let n=t.reduce((t,n,r)=>t+Hn(n)+e[r+1],e[0]);this.value=n.toString()}toString(){return this.value}};function Hn(e){if(e instanceof Vn)return e.value;throw Error(`non-literal value passed to Polymer's htmlLiteral function: ${e}`)}function Un(e){if(e instanceof HTMLTemplateElement)return e.innerHTML;if(e instanceof Vn)return Hn(e);throw Error(`non-template value passed to Polymer's html function: ${e}`)}var k=function(e,...t){Wn(e,t);let n=document.createElement(`template`),r=t.reduce((t,n,r)=>t+Un(n)+e[r+1],e[0]);return Bn&&(r=Bn.createHTML(r)),n.innerHTML=r,n},Wn=(e,t)=>{if(!Array.isArray(e)||!Array.isArray(e.raw)||t.length!==e.length-1)throw TypeError(`Invalid call to the html template tag`)},A=zn(HTMLElement),j=class e{constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(e,t){this._asyncModule=e,this._callback=t,this._timer=this._asyncModule.run(()=>{this._timer=null,Gn.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),Gn.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}static debounce(t,n,r){return t instanceof e?t._cancelAsync():t=new e,t.setConfig(n,r),t}},Gn=new Set,Kn=function(e){Gn.add(e)},qn=function(){let e=!!Gn.size;return Gn.forEach(e=>{try{e.flush()}catch(e){setTimeout(()=>{throw e})}}),e},Jn=typeof document.head.style.touchAction==`string`,Yn=`__polymerGestures`,Xn=`__polymerGesturesHandled`,Zn=`__polymerGesturesTouchAction`,Qn=25,$n=5,er=2,tr=2500,nr=[`mousedown`,`mousemove`,`mouseup`,`click`],rr=[0,1,4,2],ir=(function(){try{return new MouseEvent(`test`,{buttons:1}).buttons===1}catch{return!1}})();function ar(e){return nr.indexOf(e)>-1}var or=!1;(function(){try{let e=Object.defineProperty({},"passive",{get(){or=!0}});window.addEventListener(`test`,null,e),window.removeEventListener(`test`,null,e)}catch{}})();function sr(e){if(!(ar(e)||e===`touchend`)&&Jn&&or&&we)return{passive:!0}}var cr=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/),lr=[],ur={button:!0,input:!0,keygen:!0,meter:!0,output:!0,textarea:!0,progress:!0,select:!0},dr={button:!0,command:!0,fieldset:!0,input:!0,keygen:!0,optgroup:!0,option:!0,select:!0,textarea:!0};function fr(e){return ur[e.localName]||!1}function pr(e){let t=Array.prototype.slice.call(e.labels||[]);if(!t.length){t=[];try{let n=e.getRootNode();if(e.id){let r=n.querySelectorAll(`label[for = '${e.id}']`);for(let e=0;e<r.length;e++)t.push(r[e])}}catch{}}return t}var mr=function(e){let t=e.sourceCapabilities;if(!(t&&!t.firesTouchEvents)&&(e[Xn]={skip:!0},e.type===`click`)){let t=!1,n=br(e);for(let e=0;e<n.length;e++){if(n[e].nodeType===Node.ELEMENT_NODE){if(n[e].localName===`label`)lr.push(n[e]);else if(fr(n[e])){let r=pr(n[e]);for(let e=0;e<r.length;e++)t||=lr.indexOf(r[e])>-1}}if(n[e]===N.mouse.target)return}if(t)return;e.preventDefault(),e.stopPropagation()}};function hr(e){let t=cr?[`click`]:nr;for(let n=0,r;n<t.length;n++)r=t[n],e?(lr.length=0,document.addEventListener(r,mr,!0)):document.removeEventListener(r,mr,!0)}function gr(e){if(!Ae)return;N.mouse.mouseIgnoreJob||hr(!0);let t=function(){hr(),N.mouse.target=null,N.mouse.mouseIgnoreJob=null};N.mouse.target=br(e)[0],N.mouse.mouseIgnoreJob=j.debounce(N.mouse.mouseIgnoreJob,w.after(tr),t)}function M(e){let t=e.type;if(!ar(t))return!1;if(t===`mousemove`){let t=e.buttons===void 0?1:e.buttons;return e instanceof window.MouseEvent&&!ir&&(t=rr[e.which]||0),!!(t&1)}return(e.button===void 0?0:e.button)===0}function _r(e){if(e.type===`click`){if(e.detail===0)return!0;let t=I(e);if(!t.nodeType||t.nodeType!==Node.ELEMENT_NODE)return!0;let n=t.getBoundingClientRect(),r=e.pageX,i=e.pageY;return!(r>=n.left&&r<=n.right&&i>=n.top&&i<=n.bottom)}return!1}var N={mouse:{target:null,mouseIgnoreJob:null},touch:{x:0,y:0,id:-1,scrollDecided:!1}};function vr(e){let t=`auto`,n=br(e);for(let e=0,r;e<n.length;e++)if(r=n[e],r[Zn]){t=r[Zn];break}return t}function yr(e,t,n){e.movefn=t,e.upfn=n,document.addEventListener(`mousemove`,t),document.addEventListener(`mouseup`,n)}function P(e){document.removeEventListener(`mousemove`,e.movefn),document.removeEventListener(`mouseup`,e.upfn),e.movefn=null,e.upfn=null}Ae&&document.addEventListener(`touchend`,gr,or?{passive:!0}:!1);var br=window.ShadyDOM&&window.ShadyDOM.noPatch?window.ShadyDOM.composedPath:e=>e.composedPath&&e.composedPath()||[],xr={},F=[];function Sr(e,t){let n=document.elementFromPoint(e,t),r=n;for(;r&&r.shadowRoot&&!window.ShadyDOM;){let i=r;if(r=r.shadowRoot.elementFromPoint(e,t),i===r)break;r&&(n=r)}return n}function I(e){let t=br(e);return t.length>0?t[0]:e.target}function Cr(e){let t,n=e.type,r=e.currentTarget[Yn];if(!r)return;let i=r[n];if(i){if(!e[Xn]&&(e[Xn]={},n.slice(0,5)===`touch`)){e=e;let t=e.changedTouches[0];if(n===`touchstart`&&e.touches.length===1&&(N.touch.id=t.identifier),N.touch.id!==t.identifier)return;Jn||(n===`touchstart`||n===`touchmove`)&&wr(e)}if(t=e[Xn],!t.skip){for(let n=0,r;n<F.length;n++)r=F[n],i[r.name]&&!t[r.name]&&r.flow&&r.flow.start.indexOf(e.type)>-1&&r.reset&&r.reset();for(let r=0,a;r<F.length;r++)a=F[r],i[a.name]&&!t[a.name]&&(t[a.name]=!0,a[n](e))}}}function wr(e){let t=e.changedTouches[0],n=e.type;if(n===`touchstart`)N.touch.x=t.clientX,N.touch.y=t.clientY,N.touch.scrollDecided=!1;else if(n===`touchmove`){if(N.touch.scrollDecided)return;N.touch.scrollDecided=!0;let n=vr(e),r=!1,i=Math.abs(N.touch.x-t.clientX),a=Math.abs(N.touch.y-t.clientY);e.cancelable&&(n===`none`?r=!0:n===`pan-x`?r=a>i:n===`pan-y`&&(r=i>a)),r?e.preventDefault():Nr(`track`)}}function Tr(e,t,n){return xr[t]?(Dr(e,t,n),!0):!1}function Er(e,t,n){return xr[t]?(Or(e,t,n),!0):!1}function Dr(e,t,n){let r=xr[t],i=r.deps,a=r.name,o=e[Yn];o||(e[Yn]=o={});for(let t=0,n,r;t<i.length;t++)n=i[t],!(cr&&ar(n)&&n!==`click`)&&(r=o[n],r||(o[n]=r={_count:0}),r._count===0&&e.addEventListener(n,Cr,sr(n)),r[a]=(r[a]||0)+1,r._count=(r._count||0)+1);e.addEventListener(t,n),r.touchAction&&jr(e,r.touchAction)}function Or(e,t,n){let r=xr[t],i=r.deps,a=r.name,o=e[Yn];if(o)for(let t=0,n,r;t<i.length;t++)n=i[t],r=o[n],r&&r[a]&&(r[a]=(r[a]||1)-1,r._count=(r._count||1)-1,r._count===0&&e.removeEventListener(n,Cr,sr(n)));e.removeEventListener(t,n)}function kr(e){F.push(e);for(let t=0;t<e.emits.length;t++)xr[e.emits[t]]=e}function Ar(e){for(let t=0,n;t<F.length;t++){n=F[t];for(let t=0,r;t<n.emits.length;t++)if(r=n.emits[t],r===e)return n}return null}function jr(e,t){Jn&&e instanceof HTMLElement&&T.run(()=>{e.style.touchAction=t}),e[Zn]=t}function Mr(e,t,n){let r=new Event(t,{bubbles:!0,cancelable:!0,composed:!0});if(r.detail=n,y(e).dispatchEvent(r),r.defaultPrevented){let e=n.preventer||n.sourceEvent;e&&e.preventDefault&&e.preventDefault()}}function Nr(e){let t=Ar(e);t.info&&(t.info.prevent=!0)}kr({name:`downup`,deps:[`mousedown`,`touchstart`,`touchend`],flow:{start:[`mousedown`,`touchstart`],end:[`mouseup`,`touchend`]},emits:[`down`,`up`],info:{movefn:null,upfn:null},reset:function(){P(this.info)},mousedown:function(e){if(!M(e))return;let t=I(e),n=this;yr(this.info,function(e){M(e)||(L(`up`,t,e),P(n.info))},function(e){M(e)&&L(`up`,t,e),P(n.info)}),L(`down`,t,e)},touchstart:function(e){L(`down`,I(e),e.changedTouches[0],e)},touchend:function(e){L(`up`,I(e),e.changedTouches[0],e)}});function L(e,t,n,r){t&&Mr(t,e,{x:n.clientX,y:n.clientY,sourceEvent:n,preventer:r,prevent:function(e){return Nr(e)}})}kr({name:`track`,touchAction:`none`,deps:[`mousedown`,`touchstart`,`touchmove`,`touchend`],flow:{start:[`mousedown`,`touchstart`],end:[`mouseup`,`touchend`]},emits:[`track`],info:{x:0,y:0,state:`start`,started:!1,moves:[],addMove:function(e){this.moves.length>er&&this.moves.shift(),this.moves.push(e)},movefn:null,upfn:null,prevent:!1},reset:function(){this.info.state=`start`,this.info.started=!1,this.info.moves=[],this.info.x=0,this.info.y=0,this.info.prevent=!1,P(this.info)},mousedown:function(e){if(!M(e))return;let t=I(e),n=this,r=function(e){let r=e.clientX,i=e.clientY;Pr(n.info,r,i)&&(n.info.state=n.info.started?e.type===`mouseup`?`end`:`track`:`start`,n.info.state===`start`&&Nr(`tap`),n.info.addMove({x:r,y:i}),M(e)||(n.info.state=`end`,P(n.info)),t&&Fr(n.info,t,e),n.info.started=!0)};yr(this.info,r,function(e){n.info.started&&r(e),P(n.info)}),this.info.x=e.clientX,this.info.y=e.clientY},touchstart:function(e){let t=e.changedTouches[0];this.info.x=t.clientX,this.info.y=t.clientY},touchmove:function(e){let t=I(e),n=e.changedTouches[0],r=n.clientX,i=n.clientY;Pr(this.info,r,i)&&(this.info.state===`start`&&Nr(`tap`),this.info.addMove({x:r,y:i}),Fr(this.info,t,n),this.info.state=`track`,this.info.started=!0)},touchend:function(e){let t=I(e),n=e.changedTouches[0];this.info.started&&(this.info.state=`end`,this.info.addMove({x:n.clientX,y:n.clientY}),Fr(this.info,t,n))}});function Pr(e,t,n){if(e.prevent)return!1;if(e.started)return!0;let r=Math.abs(e.x-t),i=Math.abs(e.y-n);return r>=$n||i>=$n}function Fr(e,t,n){if(!t)return;let r=e.moves[e.moves.length-2],i=e.moves[e.moves.length-1],a=i.x-e.x,o=i.y-e.y,s,c=0;r&&(s=i.x-r.x,c=i.y-r.y),Mr(t,`track`,{state:e.state,x:n.clientX,y:n.clientY,dx:a,dy:o,ddx:s,ddy:c,sourceEvent:n,hover:function(){return Sr(n.clientX,n.clientY)}})}kr({name:`tap`,deps:[`mousedown`,`click`,`touchstart`,`touchend`],flow:{start:[`mousedown`,`touchstart`],end:[`click`,`touchend`]},emits:[`tap`],info:{x:NaN,y:NaN,prevent:!1},reset:function(){this.info.x=NaN,this.info.y=NaN,this.info.prevent=!1},mousedown:function(e){M(e)&&(this.info.x=e.clientX,this.info.y=e.clientY)},click:function(e){M(e)&&Ir(this.info,e)},touchstart:function(e){let t=e.changedTouches[0];this.info.x=t.clientX,this.info.y=t.clientY},touchend:function(e){Ir(this.info,e.changedTouches[0],e)}});function Ir(e,t,n){let r=Math.abs(t.clientX-e.x),i=Math.abs(t.clientY-e.y),a=I(n||t);!a||dr[a.localName]&&a.hasAttribute(`disabled`)||(isNaN(r)||isNaN(i)||r<=Qn&&i<=Qn||_r(t))&&(e.prevent||Mr(a,`tap`,{x:t.clientX,y:t.clientY,sourceEvent:t,preventer:n}))}var R=_(e=>{class t extends e{_addEventListenerToNode(e,t,n){Tr(e,t,n)||super._addEventListenerToNode(e,t,n)}_removeEventListenerFromNode(e,t,n){Er(e,t,n)||super._removeEventListenerFromNode(e,t,n)}}return t}),Lr=!(window.ShadyDOM&&window.ShadyDOM.inUse),Rr;function zr(e){Rr=e&&e.shimcssproperties?!1:Lr||!!(!navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/)&&window.CSS&&CSS.supports&&CSS.supports(`box-shadow`,`0 0 0 var(--foo)`))}var z;window.ShadyCSS&&window.ShadyCSS.cssBuild!==void 0&&(z=window.ShadyCSS.cssBuild);var Br=!!(window.ShadyCSS&&window.ShadyCSS.disableRuntime);window.ShadyCSS&&window.ShadyCSS.nativeCss!==void 0?Rr=window.ShadyCSS.nativeCss:window.ShadyCSS?(zr(window.ShadyCSS),window.ShadyCSS=void 0):zr(window.WebComponents&&window.WebComponents.flags);var Vr=Rr,Hr=class{constructor(){this.start=0,this.end=0,this.previous=null,this.parent=null,this.rules=null,this.parsedCssText=``,this.cssText=``,this.atRule=!1,this.type=0,this.keyframesName=``,this.selector=``,this.parsedSelector=``}};function Ur(e){return e=Wr(e),Kr(Gr(e),e)}function Wr(e){return e.replace(V.comments,``).replace(V.port,``)}function Gr(e){let t=new Hr;t.start=0,t.end=e.length;let n=t;for(let r=0,i=e.length;r<i;r++)if(e[r]===$r){n.rules||(n.rules=[]);let e=n,t=e.rules[e.rules.length-1]||null;n=new Hr,n.start=r+1,n.parent=e,n.previous=t,e.rules.push(n)}else e[r]===ei&&(n.end=r+1,n=n.parent||t);return t}function Kr(e,t){let n=t.substring(e.start,e.end-1);if(e.parsedCssText=e.cssText=n.trim(),e.parent){let r=e.previous?e.previous.end:e.parent.start;n=t.substring(r,e.start-1),n=qr(n),n=n.replace(V.multipleSpaces,` `),n=n.substring(n.lastIndexOf(`;`)+1);let i=e.parsedSelector=e.selector=n.trim();e.atRule=i.indexOf(ri)===0,e.atRule?i.indexOf(ni)===0?e.type=B.MEDIA_RULE:i.match(V.keyframesRule)&&(e.type=B.KEYFRAMES_RULE,e.keyframesName=e.selector.split(V.multipleSpaces).pop()):e.type=i.indexOf(ti)===0?B.MIXIN_RULE:B.STYLE_RULE}let r=e.rules;if(r)for(let e=0,n=r.length,i;e<n&&(i=r[e]);e++)Kr(i,t);return e}function qr(e){return e.replace(/\\([0-9a-f]{1,6})\s/gi,function(){let e=arguments[1],t=6-e.length;for(;t--;)e=`0`+e;return`\\`+e})}function Jr(e,t,n=``){let r=``;if(e.cssText||e.rules){let n=e.rules;if(n&&!Yr(n))for(let e=0,i=n.length,a;e<i&&(a=n[e]);e++)r=Jr(a,t,r);else r=t?e.cssText:Xr(e.cssText),r=r.trim(),r&&=`  `+r+`
`}return r&&(e.selector&&(n+=e.selector+` `+$r+`
`),n+=r,e.selector&&(n+=ei+`

`)),n}function Yr(e){let t=e[0];return!!t&&!!t.selector&&t.selector.indexOf(ti)===0}function Xr(e){return e=Zr(e),Qr(e)}function Zr(e){return e.replace(V.customProp,``).replace(V.mixinProp,``)}function Qr(e){return e.replace(V.mixinApply,``).replace(V.varApply,``)}var B={STYLE_RULE:1,KEYFRAMES_RULE:7,MEDIA_RULE:4,MIXIN_RULE:1e3},$r=`{`,ei=`}`,V={comments:/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,port:/@import[^;]*;/gim,customProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,mixinProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,mixinApply:/@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,varApply:/[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,keyframesRule:/^@[^\s]*keyframes/,multipleSpaces:/\s+/g},ti=`--`,ni=`@media`,ri=`@`,ii=/(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi,ai=/(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,oi=/@media\s(.*)/,si=new Set,ci=`shady-unscoped`;function li(e){let t=e.textContent;if(!si.has(t)){si.add(t);let e=document.createElement(`style`);e.setAttribute(`shady-unscoped`,``),e.textContent=t,document.head.appendChild(e)}}function ui(e){return e.hasAttribute(ci)}function di(e,t){return e?(typeof e==`string`&&(e=Ur(e)),t&&H(e,t),Jr(e,Vr)):``}function fi(e){return!e.__cssRules&&e.textContent&&(e.__cssRules=Ur(e.textContent)),e.__cssRules||null}function H(e,t,n,r){if(!e)return;let i=!1,a=e.type;if(r&&a===B.MEDIA_RULE){let t=e.selector.match(oi);t&&(window.matchMedia(t[1]).matches||(i=!0))}a===B.STYLE_RULE?t(e):n&&a===B.KEYFRAMES_RULE?n(e):a===B.MIXIN_RULE&&(i=!0);let o=e.rules;if(o&&!i)for(let e=0,i=o.length,a;e<i&&(a=o[e]);e++)H(a,t,n,r)}function pi(e,t){let n=0;for(let r=t,i=e.length;r<i;r++)if(e[r]===`(`)n++;else if(e[r]===`)`&&--n===0)return r;return-1}function mi(e,t){let n=e.indexOf(`var(`);if(n===-1)return t(e,``,``,``);let r=pi(e,n+3),i=e.substring(n+4,r),a=e.substring(0,n),o=mi(e.substring(r+1),t),s=i.indexOf(`,`);return s===-1?t(a,i.trim(),``,o):t(a,i.substring(0,s).trim(),i.substring(s+1).trim(),o)}window.ShadyDOM&&window.ShadyDOM.wrap;function hi(e){let t=e.localName,n=``,r=``;return t?t.indexOf(`-`)>-1?n=t:(r=t,n=e.getAttribute&&e.getAttribute(`is`)||``):(n=e.is,r=e.extends),{is:n,typeExtension:r}}function gi(e){let t=[],n=e.querySelectorAll(`style`);for(let e=0;e<n.length;e++){let r=n[e];ui(r)?Lr||(li(r),r.parentNode.removeChild(r)):(t.push(r.textContent),r.parentNode.removeChild(r))}return t.join(``).trim()}var _i=`css-build`;function vi(e){if(z!==void 0)return z;if(e.__cssBuild===void 0){let t=e.getAttribute(_i);if(t)e.__cssBuild=t;else{let t=bi(e);t!==``&&xi(e),e.__cssBuild=t}}return e.__cssBuild||``}function yi(e){return vi(e)!==``}function bi(e){let t=e.localName===`template`?e.content.firstChild:e.firstChild;if(t instanceof Comment){let e=t.textContent.trim().split(`:`);if(e[0]===_i)return e[1]}return``}function xi(e){let t=e.localName===`template`?e.content.firstChild:e.firstChild;t.parentNode.removeChild(t)}function Si(e,t){for(let n in t)n===null?e.style.removeProperty(n):e.style.setProperty(n,t[n])}function Ci(e,t){let n=window.getComputedStyle(e).getPropertyValue(t);return n?n.trim():``}function wi(e){let t=ai.test(e)||ii.test(e);return ai.lastIndex=0,ii.lastIndex=0,t}var Ti=/;\s*/m,Ei=/^\s*(initial)|(inherit)\s*$/,Di=/\s*!important/,Oi=`_-_`,ki=class{constructor(){this._map={}}set(e,t){e=e.trim(),this._map[e]={properties:t,dependants:{}}}get(e){return e=e.trim(),this._map[e]||null}},Ai=null,U=class{constructor(){this._currentElement=null,this._measureElement=null,this._map=new ki}detectMixin(e){return wi(e)}gatherStyles(e){let t=gi(e.content);if(t){let n=document.createElement(`style`);return n.textContent=t,e.content.insertBefore(n,e.content.firstChild),n}return null}transformTemplate(e,t){e._gatheredStyle===void 0&&(e._gatheredStyle=this.gatherStyles(e));let n=e._gatheredStyle;return n?this.transformStyle(n,t):null}transformStyle(e,t=``){let n=fi(e);return this.transformRules(n,t),e.textContent=di(n),n}transformCustomStyle(e){let t=fi(e);return H(t,e=>{e.selector===`:root`&&(e.selector=`html`),this.transformRule(e)}),e.textContent=di(t),t}transformRules(e,t){this._currentElement=t,H(e,e=>{this.transformRule(e)}),this._currentElement=null}transformRule(e){e.cssText=this.transformCssText(e.parsedCssText,e),e.selector===`:root`&&(e.selector=`:host > *`)}transformCssText(e,t){return e=e.replace(ii,(e,n,r,i)=>this._produceCssProperties(e,n,r,i,t)),this._consumeCssProperties(e,t)}_getInitialValueForProperty(e){return this._measureElement||(this._measureElement=document.createElement(`meta`),this._measureElement.setAttribute(`apply-shim-measure`,``),this._measureElement.style.all=`initial`,document.head.appendChild(this._measureElement)),window.getComputedStyle(this._measureElement).getPropertyValue(e)}_fallbacksFromPreviousRules(e){let t=e;for(;t.parent;)t=t.parent;let n={},r=!1;return H(t,t=>{r||=t===e,!r&&t.selector===e.selector&&Object.assign(n,this._cssTextToMap(t.parsedCssText))}),n}_consumeCssProperties(e,t){let n=null;for(;n=ai.exec(e);){let r=n[0],i=n[1],a=n.index,o=a+r.indexOf(`@apply`),s=a+r.length,c=e.slice(0,o),l=e.slice(s),u=t?this._fallbacksFromPreviousRules(t):{};Object.assign(u,this._cssTextToMap(c));let d=this._atApplyToCssProperties(i,u);e=`${c}${d}${l}`,ai.lastIndex=a+d.length}return e}_atApplyToCssProperties(e,t){e=e.replace(Ti,``);let n=[],r=this._map.get(e);if(r||=(this._map.set(e,{}),this._map.get(e)),r){this._currentElement&&(r.dependants[this._currentElement]=!0);let i,a,o,s=r.properties;for(i in s)o=t&&t[i],a=[i,`: var(`,e,Oi,i],o&&a.push(`,`,o.replace(Di,``)),a.push(`)`),Di.test(s[i])&&a.push(` !important`),n.push(a.join(``))}return n.join(`; `)}_replaceInitialOrInherit(e,t){let n=Ei.exec(t);return n&&(t=n[1]?this._getInitialValueForProperty(e):`apply-shim-inherit`),t}_cssTextToMap(e,t=!1){let n=e.split(`;`),r,i,a={};for(let e=0,o,s;e<n.length;e++)o=n[e],o&&(s=o.split(`:`),s.length>1&&(r=s[0].trim(),i=s.slice(1).join(`:`),t&&(i=this._replaceInitialOrInherit(r,i)),a[r]=i));return a}_invalidateMixinEntry(e){if(Ai)for(let t in e.dependants)t!==this._currentElement&&Ai(t)}_produceCssProperties(e,t,n,r,i){if(n&&mi(n,(e,t)=>{t&&this._map.get(t)&&(r=`@apply ${t};`)}),!r)return e;let a=this._consumeCssProperties(``+r,i),o=e.slice(0,e.indexOf(`--`)),s=this._cssTextToMap(a,!0),c=s,l=this._map.get(t),u=l&&l.properties;u?c=Object.assign(Object.create(u),s):this._map.set(t,c);let d=[],f,p,ee=!1;for(f in c)p=s[f],p===void 0&&(p=`initial`),u&&!(f in u)&&(ee=!0),d.push(`${t}${Oi}${f}: ${p}`);return ee&&this._invalidateMixinEntry(l),l&&(l.properties=c),n&&(o=`${e};${o}`),`${o}${d.join(`; `)};`}};U.prototype.detectMixin=U.prototype.detectMixin,U.prototype.transformStyle=U.prototype.transformStyle,U.prototype.transformCustomStyle=U.prototype.transformCustomStyle,U.prototype.transformRules=U.prototype.transformRules,U.prototype.transformRule=U.prototype.transformRule,U.prototype.transformTemplate=U.prototype.transformTemplate,U.prototype._separator=Oi,Object.defineProperty(U.prototype,"invalidCallback",{get(){return Ai},set(e){Ai=e}});var ji={},Mi=`_applyShimCurrentVersion`,W=`_applyShimNextVersion`,Ni=`_applyShimValidatingVersion`,Pi=Promise.resolve();function Fi(e){let t=ji[e];t&&Ii(t)}function Ii(e){e[Mi]=e[Mi]||0,e[Ni]=e[Ni]||0,e[W]=(e[W]||0)+1}function Li(e){return e[Mi]===e[W]}function Ri(e){return!Li(e)&&e[Ni]===e[W]}function zi(e){e[Ni]=e[W],e._validating||(e._validating=!0,Pi.then(function(){e[Mi]=e[W],e._validating=!1}))}var Bi=null,Vi=window.HTMLImports&&window.HTMLImports.whenReady||null,Hi;function Ui(e){requestAnimationFrame(function(){Vi?Vi(e):(Bi||(Bi=new Promise(e=>{Hi=e}),document.readyState===`complete`?Hi():document.addEventListener(`readystatechange`,()=>{document.readyState===`complete`&&Hi()})),Bi.then(function(){e&&e()}))})}var Wi=`__seenByShadyCSS`,Gi=`__shadyCSSCachedStyle`,Ki=null,G=null,K=class{constructor(){this.customStyles=[],this.enqueued=!1,Ui(()=>{window.ShadyCSS.flushCustomStyles&&window.ShadyCSS.flushCustomStyles()})}enqueueDocumentValidation(){this.enqueued||!G||(this.enqueued=!0,Ui(G))}addCustomStyle(e){e[Wi]||(e[Wi]=!0,this.customStyles.push(e),this.enqueueDocumentValidation())}getStyleForCustomStyle(e){if(e[Gi])return e[Gi];let t;return t=e.getStyle?e.getStyle():e,t}processStyles(){let e=this.customStyles;for(let t=0;t<e.length;t++){let n=e[t];if(n[Gi])continue;let r=this.getStyleForCustomStyle(n);if(r){let e=r.__appliedElement||r;Ki&&Ki(e),n[Gi]=e}}return e}};K.prototype.addCustomStyle=K.prototype.addCustomStyle,K.prototype.getStyleForCustomStyle=K.prototype.getStyleForCustomStyle,K.prototype.processStyles=K.prototype.processStyles,Object.defineProperties(K.prototype,{transformCallback:{get(){return Ki},set(e){Ki=e}},validateCallback:{get(){return G},set(e){let t=!1;G||(t=!0),G=e,t&&this.enqueueDocumentValidation()}}});var qi=new U,Ji=class{constructor(){this.customStyleInterface=null,qi.invalidCallback=Fi}ensure(){this.customStyleInterface||window.ShadyCSS.CustomStyleInterface&&(this.customStyleInterface=window.ShadyCSS.CustomStyleInterface,this.customStyleInterface.transformCallback=e=>{qi.transformCustomStyle(e)},this.customStyleInterface.validateCallback=()=>{requestAnimationFrame(()=>{this.customStyleInterface.enqueued&&this.flushCustomStyles()})})}prepareTemplate(e,t){this.ensure(),!yi(e)&&(ji[t]=e,e._styleAst=qi.transformTemplate(e,t))}flushCustomStyles(){if(this.ensure(),!this.customStyleInterface)return;let e=this.customStyleInterface.processStyles();if(this.customStyleInterface.enqueued){for(let t=0;t<e.length;t++){let n=e[t],r=this.customStyleInterface.getStyleForCustomStyle(n);r&&qi.transformCustomStyle(r)}this.customStyleInterface.enqueued=!1}}styleSubtree(e,t){if(this.ensure(),t&&Si(e,t),e.shadowRoot){this.styleElement(e);let t=e.shadowRoot.children||e.shadowRoot.childNodes;for(let e=0;e<t.length;e++)this.styleSubtree(t[e])}else{let t=e.children||e.childNodes;for(let e=0;e<t.length;e++)this.styleSubtree(t[e])}}styleElement(e){this.ensure();let{is:t}=hi(e),n=ji[t];if(!(n&&yi(n))&&n&&!Li(n)){Ri(n)||(this.prepareTemplate(n,t),zi(n));let r=e.shadowRoot;if(r){let e=r.querySelector(`style`);e&&(e.__cssRules=n._styleAst,e.textContent=di(n._styleAst))}}}styleDocument(e){this.ensure(),this.styleSubtree(document.body,e)}};if(!window.ShadyCSS||!window.ShadyCSS.ScopingShim){let e=new Ji,t=window.ShadyCSS&&window.ShadyCSS.CustomStyleInterface;window.ShadyCSS={prepareTemplate(t,n,r){e.flushCustomStyles(),e.prepareTemplate(t,n)},prepareTemplateStyles(e,t,n){window.ShadyCSS.prepareTemplate(e,t,n)},prepareTemplateDom(e,t){},styleSubtree(t,n){e.flushCustomStyles(),e.styleSubtree(t,n)},styleElement(t){e.flushCustomStyles(),e.styleElement(t)},styleDocument(t){e.flushCustomStyles(),e.styleDocument(t)},getComputedStyleValue(e,t){return Ci(e,t)},flushCustomStyles(){e.flushCustomStyles()},nativeCss:Vr,nativeShadow:Lr,cssBuild:z,disableRuntime:Br},t&&(window.ShadyCSS.CustomStyleInterface=t)}window.ShadyCSS.ApplyShim=qi;var Yi=/:host\(:dir\((ltr|rtl)\)\)/g,Xi=`:host([dir="$1"])`,Zi=/([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g,Qi=`:host([dir="$2"]) $1`,$i=/:dir\((?:ltr|rtl)\)/,ea=!!(window.ShadyDOM&&window.ShadyDOM.inUse),ta=[],na=null,ra=``;function ia(){ra=document.documentElement.getAttribute(`dir`)}function aa(e){e.__autoDirOptOut||e.setAttribute(`dir`,ra)}function oa(){ia(),ra=document.documentElement.getAttribute(`dir`);for(let e=0;e<ta.length;e++)aa(ta[e])}function sa(){na&&na.takeRecords().length&&oa()}var ca=_(e=>{ea||na||(ia(),na=new MutationObserver(oa),na.observe(document.documentElement,{attributes:!0,attributeFilter:[`dir`]}));let t=Dt(e);class n extends t{static _processStyleText(e,n){return e=t._processStyleText.call(this,e,n),!ea&&$i.test(e)&&(e=this._replaceDirInCssText(e),this.__activateDir=!0),e}static _replaceDirInCssText(e){let t=e;return t=t.replace(Yi,Xi),t=t.replace(Zi,Qi),t}constructor(){super(),this.__autoDirOptOut=!1}ready(){super.ready(),this.__autoDirOptOut=this.hasAttribute(`dir`)}connectedCallback(){t.prototype.connectedCallback&&super.connectedCallback(),this.constructor.__activateDir&&(sa(),ta.push(this),aa(this))}disconnectedCallback(){if(t.prototype.disconnectedCallback&&super.disconnectedCallback(),this.constructor.__activateDir){let e=ta.indexOf(this);e>-1&&ta.splice(e,1)}}}return n.__activateDir=!1,n}),la=!1,ua=[],da=[];function fa(){la=!0,requestAnimationFrame(function(){la=!1,pa(ua),setTimeout(function(){ma(da)})})}function pa(e){for(;e.length;)ha(e.shift())}function ma(e){for(let t=0,n=e.length;t<n;t++)ha(e.shift())}function ha(e){let t=e[0],n=e[1],r=e[2];try{n.apply(t,r)}catch(e){setTimeout(()=>{throw e})}}function ga(e,t,n){la||fa(),da.push([e,t,n])}function _a(){document.body.removeAttribute(`unresolved`)}document.readyState===`interactive`||document.readyState===`complete`?_a():window.addEventListener(`DOMContentLoaded`,_a);function va(e,t,n){return{index:e,removed:t,addedCount:n}}var ya=0,ba=1,xa=2,Sa=3;function Ca(e,t,n,r,i,a){let o=a-i+1,s=n-t+1,c=Array(o);for(let e=0;e<o;e++)c[e]=Array(s),c[e][0]=e;for(let e=0;e<s;e++)c[0][e]=e;for(let n=1;n<o;n++)for(let a=1;a<s;a++)if(ka(e[t+a-1],r[i+n-1]))c[n][a]=c[n-1][a-1];else{let e=c[n-1][a]+1,t=c[n][a-1]+1;c[n][a]=e<t?e:t}return c}function wa(e){let t=e.length-1,n=e[0].length-1,r=e[t][n],i=[];for(;t>0||n>0;){if(t==0){i.push(xa),n--;continue}if(n==0){i.push(Sa),t--;continue}let a=e[t-1][n-1],o=e[t-1][n],s=e[t][n-1],c;c=o<s?o<a?o:a:s<a?s:a,c==a?(a==r?i.push(ya):(i.push(ba),r=a),t--,n--):c==o?(i.push(Sa),t--,r=o):(i.push(xa),n--,r=s)}return i.reverse(),i}function Ta(e,t,n,r,i,a){let o=0,s=0,c,l=Math.min(n-t,a-i);if(t==0&&i==0&&(o=Ea(e,r,l)),n==e.length&&a==r.length&&(s=Da(e,r,l-o)),t+=o,i+=o,n-=s,a-=s,n-t==0&&a-i==0)return[];if(t==n){for(c=va(t,[],0);i<a;)c.removed.push(r[i++]);return[c]}if(i==a)return[va(t,[],n-t)];let u=wa(Ca(e,t,n,r,i,a));c=void 0;let d=[],f=t,p=i;for(let e=0;e<u.length;e++)switch(u[e]){case ya:c&&=(d.push(c),void 0),f++,p++;break;case ba:c||=va(f,[],0),c.addedCount++,f++,c.removed.push(r[p]),p++;break;case xa:c||=va(f,[],0),c.addedCount++,f++;break;case Sa:c||=va(f,[],0),c.removed.push(r[p]),p++}return c&&d.push(c),d}function Ea(e,t,n){for(let r=0;r<n;r++)if(!ka(e[r],t[r]))return r;return n}function Da(e,t,n){let r=e.length,i=t.length,a=0;for(;a<n&&ka(e[--r],t[--i]);)a++;return a}function Oa(e,t){return Ta(e,0,e.length,t,0,t.length)}function ka(e,t){return e===t}function q(e){return e.localName===`slot`}var Aa=class{static getFlattenedNodes(e){let t=y(e);if(q(e))return e=e,t.assignedNodes({flatten:!0});{let e=[];for(let n=0;n<t.childNodes.length;n++){let r=t.childNodes[n];if(q(r)){let t=r;e.push(...y(t).assignedNodes({flatten:!0}))}else e.push(r)}return e}}constructor(e,t){this._shadyChildrenObserver=null,this._nativeChildrenObserver=null,this._connected=!1,this._target=e,this.callback=t,this._effectiveNodes=[],this._observer=null,this._scheduled=!1,this._boundSchedule=()=>{this._schedule()},this.connect(),this._schedule()}connect(){q(this._target)?this._listenSlots([this._target]):y(this._target).children&&(this._listenSlots(y(this._target).children),window.ShadyDOM?this._shadyChildrenObserver=window.ShadyDOM.observeChildren(this._target,e=>{this._processMutations(e)}):(this._nativeChildrenObserver=new MutationObserver(e=>{this._processMutations(e)}),this._nativeChildrenObserver.observe(this._target,{childList:!0}))),this._connected=!0}disconnect(){q(this._target)?this._unlistenSlots([this._target]):y(this._target).children&&(this._unlistenSlots(y(this._target).children),window.ShadyDOM&&this._shadyChildrenObserver?(window.ShadyDOM.unobserveChildren(this._shadyChildrenObserver),this._shadyChildrenObserver=null):this._nativeChildrenObserver&&=(this._nativeChildrenObserver.disconnect(),null)),this._connected=!1}_schedule(){this._scheduled||(this._scheduled=!0,T.run(()=>this.flush()))}_processMutations(e){this._processSlotMutations(e),this.flush()}_processSlotMutations(e){if(e)for(let t=0;t<e.length;t++){let n=e[t];n.addedNodes&&this._listenSlots(n.addedNodes),n.removedNodes&&this._unlistenSlots(n.removedNodes)}}flush(){if(!this._connected)return!1;window.ShadyDOM&&ShadyDOM.flush(),this._nativeChildrenObserver?this._processSlotMutations(this._nativeChildrenObserver.takeRecords()):this._shadyChildrenObserver&&this._processSlotMutations(this._shadyChildrenObserver.takeRecords()),this._scheduled=!1;let e={target:this._target,addedNodes:[],removedNodes:[]},t=this.constructor.getFlattenedNodes(this._target),n=Oa(t,this._effectiveNodes);for(let t=0,r;t<n.length&&(r=n[t]);t++)for(let t=0,n;t<r.removed.length&&(n=r.removed[t]);t++)e.removedNodes.push(n);for(let r=0,i;r<n.length&&(i=n[r]);r++)for(let n=i.index;n<i.index+i.addedCount;n++)e.addedNodes.push(t[n]);this._effectiveNodes=t;let r=!1;return(e.addedNodes.length||e.removedNodes.length)&&(r=!0,this.callback.call(this._target,e)),r}_listenSlots(e){for(let t=0;t<e.length;t++){let n=e[t];q(n)&&n.addEventListener(`slotchange`,this._boundSchedule)}}_unlistenSlots(e){for(let t=0;t<e.length;t++){let n=e[t];q(n)&&n.removeEventListener(`slotchange`,this._boundSchedule)}}},ja=function(){let e,t;do e=window.ShadyDOM&&ShadyDOM.flush(),window.ShadyCSS&&window.ShadyCSS.ScopingShim&&window.ShadyCSS.ScopingShim.flush(),t=qn();while(e||t)},J=Element.prototype,Ma=J.matches||J.matchesSelector||J.mozMatchesSelector||J.msMatchesSelector||J.oMatchesSelector||J.webkitMatchesSelector,Na=function(e,t){return Ma.call(e,t)},Y=class{constructor(e){window.ShadyDOM&&window.ShadyDOM.inUse&&window.ShadyDOM.patch(e),this.node=e}observeNodes(e){return new Aa(this.node,e)}unobserveNodes(e){e.disconnect()}notifyObserver(){}deepContains(e){if(y(this.node).contains(e))return!0;let t=e,n=e.ownerDocument;for(;t&&t!==n&&t!==this.node;)t=y(t).parentNode||y(t).host;return t===this.node}getOwnerRoot(){return y(this.node).getRootNode()}getDistributedNodes(){return this.node.localName===`slot`?y(this.node).assignedNodes({flatten:!0}):[]}getDestinationInsertionPoints(){let e=[],t=y(this.node).assignedSlot;for(;t;)e.push(t),t=y(t).assignedSlot;return e}importNode(e,t){return y(this.node instanceof Document?this.node:this.node.ownerDocument).importNode(e,t)}getEffectiveChildNodes(){return Aa.getFlattenedNodes(this.node)}queryDistributedElements(e){let t=this.getEffectiveChildNodes(),n=[];for(let r=0,i=t.length,a;r<i&&(a=t[r]);r++)a.nodeType===Node.ELEMENT_NODE&&Na(a,e)&&n.push(a);return n}get activeElement(){let e=this.node;return e._activeElement===void 0?e.activeElement:e._activeElement}};function Pa(e,t){for(let n=0;n<t.length;n++){let r=t[n];e[r]=function(){return this.node[r].apply(this.node,arguments)}}}function Fa(e,t){for(let n=0;n<t.length;n++){let r=t[n];Object.defineProperty(e,r,{get:function(){return this.node[r]},configurable:!0})}}function Ia(e,t){for(let n=0;n<t.length;n++){let r=t[n];Object.defineProperty(e,r,{get:function(){return this.node[r]},set:function(e){this.node[r]=e},configurable:!0})}}var La=class{constructor(e){this.event=e}get rootTarget(){return this.path[0]}get localTarget(){return this.event.target}get path(){return this.event.composedPath()}};Y.prototype.cloneNode,Y.prototype.appendChild,Y.prototype.insertBefore,Y.prototype.removeChild,Y.prototype.replaceChild,Y.prototype.setAttribute,Y.prototype.removeAttribute,Y.prototype.querySelector,Y.prototype.querySelectorAll,Y.prototype.parentNode,Y.prototype.firstChild,Y.prototype.lastChild,Y.prototype.nextSibling,Y.prototype.previousSibling,Y.prototype.firstElementChild,Y.prototype.lastElementChild,Y.prototype.nextElementSibling,Y.prototype.previousElementSibling,Y.prototype.childNodes,Y.prototype.children,Y.prototype.classList,Y.prototype.textContent,Y.prototype.innerHTML;var Ra=Y;if(window.ShadyDOM&&window.ShadyDOM.inUse&&window.ShadyDOM.noPatch&&window.ShadyDOM.Wrapper){class e extends window.ShadyDOM.Wrapper{}Object.getOwnPropertyNames(Y.prototype).forEach(t=>{t!=`activeElement`&&(e.prototype[t]=Y.prototype[t])}),Fa(e.prototype,[`classList`]),Ra=e,Object.defineProperties(La.prototype,{localTarget:{get(){let e=this.event.currentTarget,t=e&&X(e).getOwnerRoot(),n=this.path;for(let e=0;e<n.length;e++){let r=n[e];if(X(r).getOwnerRoot()===t)return r}},configurable:!0},path:{get(){return window.ShadyDOM.composedPath(this.event)},configurable:!0}})}else Pa(Y.prototype,[`cloneNode`,`appendChild`,`insertBefore`,`removeChild`,`replaceChild`,`setAttribute`,`removeAttribute`,`querySelector`,`querySelectorAll`,`attachShadow`]),Fa(Y.prototype,[`parentNode`,`firstChild`,`lastChild`,`nextSibling`,`previousSibling`,`firstElementChild`,`lastElementChild`,`nextElementSibling`,`previousElementSibling`,`childNodes`,`children`,`classList`,`shadowRoot`]),Ia(Y.prototype,[`textContent`,`innerHTML`,`className`]);var X=function(e){if(e||=document,e instanceof Ra||e instanceof La)return e;let t=e.__domApi;return t||(t=e instanceof Event?new La(e):new Ra(e),e.__domApi=t),t},za=window.ShadyDOM,Ba=window.ShadyCSS;function Va(e,t){return y(e).getRootNode()===t}function Ha(e,t=!1){if(!za||!Ba||!za.handlesDynamicScoping)return null;let n=Ba.ScopingShim;if(!n)return null;let r=n.scopeForNode(e),i=y(e).getRootNode(),a=e=>{if(!Va(e,i))return;let t=Array.from(za.nativeMethods.querySelectorAll.call(e,`*`));t.push(e);for(let e=0;e<t.length;e++){let a=t[e];if(!Va(a,i))continue;let o=n.currentScopeForNode(a);o!==r&&(o!==``&&n.unscopeNode(a,o),n.scopeNode(a,r))}};if(a(e),t){let t=new MutationObserver(e=>{for(let t=0;t<e.length;t++){let n=e[t];for(let e=0;e<n.addedNodes.length;e++){let t=n.addedNodes[e];t.nodeType===Node.ELEMENT_NODE&&a(t)}}});return t.observe(e,{childList:!0,subtree:!0}),t}return null}var Ua=`disable-upgrade`,Wa=e=>{for(;e;){let t=Object.getOwnPropertyDescriptor(e,`observedAttributes`);if(t)return t.get;e=Object.getPrototypeOf(e.prototype).constructor}return()=>[]};_(e=>{let t=zn(e),n=Wa(t);class r extends t{constructor(){super(),this.__isUpgradeDisabled}static get observedAttributes(){return n.call(this).concat(Ua)}_initializeProperties(){this.hasAttribute(Ua)?this.__isUpgradeDisabled=!0:super._initializeProperties()}_enableProperties(){this.__isUpgradeDisabled||super._enableProperties()}_canApplyPropertyDefault(e){return super._canApplyPropertyDefault(e)&&!(this.__isUpgradeDisabled&&this._isPropertyPending(e))}attributeChangedCallback(e,t,n,r){e==Ua?this.__isUpgradeDisabled&&n==null&&(super._initializeProperties(),this.__isUpgradeDisabled=!1,y(this).isConnected&&super.connectedCallback()):super.attributeChangedCallback(e,t,n,r)}connectedCallback(){this.__isUpgradeDisabled||super.connectedCallback()}disconnectedCallback(){this.__isUpgradeDisabled||super.disconnectedCallback()}}return r});var Ga=`disable-upgrade`,Ka=window.ShadyCSS,qa=_(e=>{let t=R(zn(e)),n=Rn?t:ca(t),r=Wa(n),i={x:`pan-x`,y:`pan-y`,none:`none`,all:`auto`};class a extends n{constructor(){super(),this.isAttached,this.__boundListeners,this._debouncers,this.__isUpgradeDisabled,this.__needsAttributesAtConnected,this._legacyForceObservedAttributes}static get importMeta(){return this.prototype.importMeta}created(){}__attributeReaction(e,t,n){(this.__dataAttributes&&this.__dataAttributes[e]||e===Ga)&&this.attributeChangedCallback(e,t,n,null)}setAttribute(e,t){if(Pe&&!this._legacyForceObservedAttributes){let n=this.getAttribute(e);super.setAttribute(e,t),this.__attributeReaction(e,n,String(t))}else super.setAttribute(e,t)}removeAttribute(e){if(Pe&&!this._legacyForceObservedAttributes){let t=this.getAttribute(e);super.removeAttribute(e),this.__attributeReaction(e,t,null)}else super.removeAttribute(e)}static get observedAttributes(){return Pe&&!this.prototype._legacyForceObservedAttributes?(this.hasOwnProperty(JSCompiler_renameProperty(`__observedAttributes`,this))||(this.__observedAttributes=[],Pn(this.prototype)),this.__observedAttributes):r.call(this).concat(Ga)}_enableProperties(){this.__isUpgradeDisabled||super._enableProperties()}_canApplyPropertyDefault(e){return super._canApplyPropertyDefault(e)&&!(this.__isUpgradeDisabled&&this._isPropertyPending(e))}connectedCallback(){this.__needsAttributesAtConnected&&this._takeAttributes(),this.__isUpgradeDisabled||(super.connectedCallback(),this.isAttached=!0,this.attached())}attached(){}disconnectedCallback(){this.__isUpgradeDisabled||(super.disconnectedCallback(),this.isAttached=!1,this.detached())}detached(){}attributeChangedCallback(e,t,n,r){t!==n&&(e==Ga?this.__isUpgradeDisabled&&n==null&&(this._initializeProperties(),this.__isUpgradeDisabled=!1,y(this).isConnected&&this.connectedCallback()):(super.attributeChangedCallback(e,t,n,r),this.attributeChanged(e,t,n)))}attributeChanged(e,t,n){}_initializeProperties(){if(g&&this.hasAttribute(Ga))this.__isUpgradeDisabled=!0;else{let e=Object.getPrototypeOf(this);e.hasOwnProperty(JSCompiler_renameProperty(`__hasRegisterFinished`,e))||(this._registered(),e.__hasRegisterFinished=!0),super._initializeProperties(),this.root=this,this.created(),Pe&&!this._legacyForceObservedAttributes&&(this.hasAttributes()?this._takeAttributes():this.parentNode||(this.__needsAttributesAtConnected=!0)),this._applyListeners()}}_takeAttributes(){let e=this.attributes;for(let t=0,n=e.length;t<n;t++){let n=e[t];this.__attributeReaction(n.name,null,n.value)}}_registered(){}ready(){this._ensureAttributes(),super.ready()}_ensureAttributes(){}_applyListeners(){}serialize(e){return this._serializeValue(e)}deserialize(e,t){return this._deserializeValue(e,t)}reflectPropertyToAttribute(e,t,n){this._propertyToAttribute(e,t,n)}serializeValueToAttribute(e,t,n){this._valueToNodeAttribute(n||this,e,t)}extend(e,t){if(!(e&&t))return e||t;let n=Object.getOwnPropertyNames(t);for(let r=0,i;r<n.length&&(i=n[r]);r++){let n=Object.getOwnPropertyDescriptor(t,i);n&&Object.defineProperty(e,i,n)}return e}mixin(e,t){for(let n in t)e[n]=t[n];return e}chainObject(e,t){return e&&t&&e!==t&&(e.__proto__=t),e}instanceTemplate(e){let t=this.constructor._contentForTemplate(e);return document.importNode(t,!0)}fire(e,t,n){n||={},t??={};let r=new Event(e,{bubbles:n.bubbles===void 0||n.bubbles,cancelable:!!n.cancelable,composed:n.composed===void 0||n.composed});return r.detail=t,y(n.node||this).dispatchEvent(r),r}listen(e,t,n){e||=this;let r=this.__boundListeners||=new WeakMap,i=r.get(e);i||(i={},r.set(e,i));let a=t+n;i[a]||(i[a]=this._addMethodEventListenerToNode(e,t,n,this))}unlisten(e,t,n){e||=this;let r=this.__boundListeners&&this.__boundListeners.get(e),i=t+n,a=r&&r[i];a&&(this._removeEventListenerFromNode(e,t,a),r[i]=null)}setScrollDirection(e,t){jr(t||this,i[e]||`auto`)}$$(e){return this.root.querySelector(e)}get domHost(){let e=y(this).getRootNode();return e instanceof DocumentFragment?e.host:e}distributeContent(){let e=X(this);window.ShadyDOM&&e.shadowRoot&&ShadyDOM.flush()}getEffectiveChildNodes(){return X(this).getEffectiveChildNodes()}queryDistributedElements(e){return X(this).queryDistributedElements(e)}getEffectiveChildren(){return this.getEffectiveChildNodes().filter(function(e){return e.nodeType===Node.ELEMENT_NODE})}getEffectiveTextContent(){let e=this.getEffectiveChildNodes(),t=[];for(let n=0,r;r=e[n];n++)r.nodeType!==Node.COMMENT_NODE&&t.push(r.textContent);return t.join(``)}queryEffectiveChildren(e){let t=this.queryDistributedElements(e);return t&&t[0]}queryAllEffectiveChildren(e){return this.queryDistributedElements(e)}getContentChildNodes(e){let t=this.root.querySelector(e||`slot`);return t?X(t).getDistributedNodes():[]}getContentChildren(e){return this.getContentChildNodes(e).filter(function(e){return e.nodeType===Node.ELEMENT_NODE})}isLightDescendant(e){let t=this;return t!==e&&y(t).contains(e)&&y(t).getRootNode()===y(e).getRootNode()}isLocalDescendant(e){return this.root===y(e).getRootNode()}scopeSubtree(e,t=!1){return Ha(e,t)}getComputedStyleValue(e){return Ka.getComputedStyleValue(this,e)}debounce(e,t,n){return this._debouncers=this._debouncers||{},this._debouncers[e]=j.debounce(this._debouncers[e],n>0?w.after(n):T,t.bind(this))}isDebouncerActive(e){this._debouncers=this._debouncers||{};let t=this._debouncers[e];return!!(t&&t.isActive())}flushDebouncer(e){this._debouncers=this._debouncers||{};let t=this._debouncers[e];t&&t.flush()}cancelDebouncer(e){this._debouncers=this._debouncers||{};let t=this._debouncers[e];t&&t.cancel()}async(e,t){return t>0?w.run(e.bind(this),t):~T.run(e.bind(this))}cancelAsync(e){e<0?T.cancel(~e):w.cancel(e)}create(e,t){let n=document.createElement(e);if(t){if(n.setProperties)n.setProperties(t);else for(let e in t)n[e]=t[e]}return n}elementMatches(e,t){return Na(t||this,e)}toggleAttribute(e,t){let n=this;return arguments.length===3&&(n=arguments[2]),arguments.length==1&&(t=!n.hasAttribute(e)),t?(y(n).setAttribute(e,``),!0):(y(n).removeAttribute(e),!1)}toggleClass(e,t,n){n||=this,arguments.length==1&&(t=!n.classList.contains(e)),t?n.classList.add(e):n.classList.remove(e)}transform(e,t){t||=this,t.style.webkitTransform=e,t.style.transform=e}translate3d(e,t,n,r){r||=this,this.transform(`translate3d(`+e+`,`+t+`,`+n+`)`,r)}arrayDelete(e,t){let n;if(Array.isArray(e)){if(n=e.indexOf(t),n>=0)return e.splice(n,1)}else if(n=S(this,e).indexOf(t),n>=0)return this.splice(e,n,1);return null}_logger(e,t){switch(Array.isArray(t)&&t.length===1&&Array.isArray(t[0])&&(t=t[0]),e){case`log`:case`warn`:case`error`:console[e](...t)}}_log(...e){this._logger(`log`,e)}_warn(...e){this._logger(`warn`,e)}_error(...e){this._logger(`error`,e)}_logf(e,...t){return[`[%s::%s]`,this.is,e,...t]}}return a.prototype.is=``,a}),Ja={attached:!0,detached:!0,ready:!0,created:!0,beforeRegister:!0,registered:!0,attributeChanged:!0,listeners:!0,hostAttributes:!0},Ya={attached:!0,detached:!0,ready:!0,created:!0,beforeRegister:!0,registered:!0,attributeChanged:!0,behaviors:!0,_noAccessors:!0},Xa=Object.assign({listeners:!0,hostAttributes:!0,properties:!0,observers:!0},Ya);function Za(e,t,n){let r=e._noAccessors,i=Object.getOwnPropertyNames(e);for(let a=0;a<i.length;a++){let o=i[a];if(!(o in n)){if(r)t[o]=e[o];else{let n=Object.getOwnPropertyDescriptor(e,o);n&&(n.configurable=!0,Object.defineProperty(t,o,n))}}}}function Qa(e,t,n){for(let r=0;r<t.length;r++)$a(e,t[r],n,Xa)}function $a(e,t,n,r){Za(t,e,r);for(let e in Ja)t[e]&&(n[e]=n[e]||[],n[e].push(t[e]))}function eo(e,t,n){t||=[];for(let r=e.length-1;r>=0;r--){let i=e[r];i?Array.isArray(i)?eo(i,t):t.indexOf(i)<0&&(!n||n.indexOf(i)<0)&&t.unshift(i):console.warn(`behavior is null, check for missing or 404 import`)}return t}function to(e,t){for(let n in t){let r=e[n],i=t[n];e[n]=!(`value`in i)&&r&&`value`in r?Object.assign({value:r.value},i):i}}var no=qa(HTMLElement);function ro(e,t,n){let r,i={};class a extends t{static _finalizeClass(){if(!this.hasOwnProperty(JSCompiler_renameProperty(`generatedFrom`,this)))t._finalizeClass.call(this);else{if(r)for(let e=0,t;e<r.length;e++)t=r[e],t.properties&&this.createProperties(t.properties),t.observers&&this.createObservers(t.observers,t.properties);e.properties&&this.createProperties(e.properties),e.observers&&this.createObservers(e.observers,e.properties),this._prepareTemplate()}}static get properties(){let t={};if(r)for(let e=0;e<r.length;e++)to(t,r[e].properties);return to(t,e.properties),t}static get observers(){let t=[];if(r)for(let e=0,n;e<r.length;e++)n=r[e],n.observers&&(t=t.concat(n.observers));return e.observers&&(t=t.concat(e.observers)),t}created(){super.created();let e=i.created;if(e)for(let t=0;t<e.length;t++)e[t].call(this)}_registered(){let e=a.prototype;if(!e.hasOwnProperty(JSCompiler_renameProperty(`__hasRegisterFinished`,e))){e.__hasRegisterFinished=!0,super._registered(),g&&o(e);let t=Object.getPrototypeOf(this),n=i.beforeRegister;if(n)for(let e=0;e<n.length;e++)n[e].call(t);if(n=i.registered,n)for(let e=0;e<n.length;e++)n[e].call(t)}}_applyListeners(){super._applyListeners();let e=i.listeners;if(e)for(let t=0;t<e.length;t++){let n=e[t];if(n)for(let e in n)this._addMethodEventListenerToNode(this,e,n[e])}}_ensureAttributes(){let e=i.hostAttributes;if(e)for(let t=e.length-1;t>=0;t--){let n=e[t];for(let e in n)this._ensureAttribute(e,n[e])}super._ensureAttributes()}ready(){super.ready();let e=i.ready;if(e)for(let t=0;t<e.length;t++)e[t].call(this)}attached(){super.attached();let e=i.attached;if(e)for(let t=0;t<e.length;t++)e[t].call(this)}detached(){super.detached();let e=i.detached;if(e)for(let t=0;t<e.length;t++)e[t].call(this)}attributeChanged(e,t,n){super.attributeChanged();let r=i.attributeChanged;if(r)for(let i=0;i<r.length;i++)r[i].call(this,e,t,n)}}if(n){Array.isArray(n)||(n=[n]);let e=t.prototype.behaviors;r=eo(n,null,e),a.prototype.behaviors=e?e.concat(n):r}let o=t=>{r&&Qa(t,r,i),$a(t,e,i,Ya)};return g||o(a.prototype),a.generatedFrom=e,a}var io=function(e,t){e||console.warn("Polymer.Class requires `info` argument");let n=t?t(no):no;return n=ro(e,n,e.behaviors),n.is=n.prototype.is=e.is,n},ao=function(e){let t;return t=typeof e==`function`?e:ao.Class(e),e._legacyForceObservedAttributes&&(t.prototype._legacyForceObservedAttributes=e._legacyForceObservedAttributes),customElements.define(t.is,t),t};ao.Class=io;function oo(e,t,n,r,i){let a;i&&(a=typeof n==`object`&&!!n,a&&(r=e.__dataTemp[t]));let o=r!==n&&(r===r||n===n);return a&&o&&(e.__dataTemp[t]=n),o}var so=_(e=>{class t extends e{_shouldPropertyChange(e,t,n){return oo(this,e,t,n,!0)}}return t}),co=_(e=>{class t extends e{static get properties(){return{mutableData:Boolean}}_shouldPropertyChange(e,t,n){return oo(this,e,t,n,this.mutableData)}}return t});so._mutablePropertyChange=oo;var lo=null;function uo(){return lo}uo.prototype=Object.create(HTMLTemplateElement.prototype,{constructor:{value:uo,writable:!0}});var fo=kn(uo),po=so(fo);function mo(e,t){lo=e,Object.setPrototypeOf(e,t.prototype),new t,lo=null}var ho=kn(class{});function go(e,t){for(let n=0;n<t.length;n++){let r=t[n];if(!!e!=!!r.__hideTemplateChildren__){if(r.nodeType===Node.TEXT_NODE)e?(r.__polymerTextContent__=r.textContent,r.textContent=``):r.textContent=r.__polymerTextContent__;else if(r.localName===`slot`){if(e)r.__polymerReplaced__=document.createComment(`hidden-slot`),y(y(r).parentNode).replaceChild(r.__polymerReplaced__,r);else{let e=r.__polymerReplaced__;e&&y(y(e).parentNode).replaceChild(r,e)}}else r.style&&(e?(r.__polymerDisplay__=r.style.display,r.style.display=`none`):r.style.display=r.__polymerDisplay__)}r.__hideTemplateChildren__=e,r._showHideChildren&&r._showHideChildren(e)}}var Z=class extends ho{constructor(e){super(),this._configureProperties(e),this.root=this._stampTemplate(this.__dataHost);let t=[];this.children=t;for(let e=this.root.firstChild;e;e=e.nextSibling)t.push(e),e.__templatizeInstance=this;this.__templatizeOwner&&this.__templatizeOwner.__hideTemplateChildren__&&this._showHideChildren(!0);let n=this.__templatizeOptions;(e&&n.instanceProps||!n.instanceProps)&&this._enableProperties()}_configureProperties(e){if(this.__templatizeOptions.forwardHostProp)for(let e in this.__hostProps)this._setPendingProperty(e,this.__dataHost[`_host_`+e]);for(let t in e)this._setPendingProperty(t,e[t])}forwardHostProp(e,t){this._setPendingPropertyOrPath(e,t,!1,!0)&&this.__dataHost._enqueueClient(this)}_addEventListenerToNode(e,t,n){if(this._methodHost&&this.__templatizeOptions.parentModel)this._methodHost._addEventListenerToNode(e,t,e=>{e.model=this,n(e)});else{let r=this.__dataHost.__dataHost;r&&r._addEventListenerToNode(e,t,n)}}_showHideChildren(e){go(e,this.children)}_setUnmanagedPropertyToNode(e,t,n){e.__hideTemplateChildren__&&e.nodeType==Node.TEXT_NODE&&t==`textContent`?e.__polymerTextContent__=n:super._setUnmanagedPropertyToNode(e,t,n)}get parentModel(){let e=this.__parentModel;if(!e){let t;e=this;do e=e.__dataHost.__dataHost;while((t=e.__templatizeOptions)&&!t.parentModel);this.__parentModel=e}return e}dispatchEvent(e){return!0}};Z.prototype.__dataHost,Z.prototype.__templatizeOptions,Z.prototype._methodHost,Z.prototype.__templatizeOwner,Z.prototype.__hostProps;var _o=so(Z);function vo(e){let t=e.__dataHost;return t&&t._methodHost||t}function yo(e,t,n){let r=n.mutableData?_o:Z;To.mixin&&(r=To.mixin(r));let i=class extends r{};return i.prototype.__templatizeOptions=n,i.prototype._bindTemplate(e),So(i,e,t,n),i}function bo(e,t,n,r){let i=n.forwardHostProp;if(i&&t.hasHostProps){let a=e.localName==`template`,o=t.templatizeTemplateClass;if(!o){if(a){let e=n.mutableData?po:fo;class r extends e{}o=t.templatizeTemplateClass=r}else{let n=e.constructor;class r extends n{}o=t.templatizeTemplateClass=r}let s=t.hostProps;for(let e in s)o.prototype._addPropertyEffect(`_host_`+e,o.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE,{fn:xo(e,i)}),o.prototype._createNotifyingProperty(`_host_`+e);Ee&&r&&Eo(t,n,r)}if(e.__dataProto&&Object.assign(e.__data,e.__dataProto),a)mo(e,o),e.__dataTemp={},e.__dataPending=null,e.__dataOld=null,e._enableProperties();else{Object.setPrototypeOf(e,o.prototype);let n=t.hostProps;for(let t in n)if(t=`_host_`+t,t in e){let n=e[t];delete e[t],e.__data[t]=n}}}}function xo(e,t){return function(e,n,r){t.call(e.__templatizeOwner,n.substring(6),r[n])}}function So(e,t,n,r){let i=n.hostProps||{};for(let t in r.instanceProps){delete i[t];let n=r.notifyInstanceProp;n&&e.prototype._addPropertyEffect(t,e.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:Co(t,n)})}if(r.forwardHostProp&&t.__dataHost)for(let t in i)n.hasHostProps||=!0,e.prototype._addPropertyEffect(t,e.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:wo()})}function Co(e,t){return function(e,n,r){t.call(e.__templatizeOwner,e,n,r[n])}}function wo(){return function(e,t,n){e.__dataHost._setPendingPropertyOrPath(`_host_`+t,n[t],!0,!0)}}function To(e,t,n){if(h&&!vo(e))throw Error(`strictTemplatePolicy: template owner not trusted`);if(n||={},e.__templatizeOwner)throw Error(`A <template> can only be templatized once`);e.__templatizeOwner=t;let r=(t?t.constructor:Z)._parseTemplate(e),i=r.templatizeInstanceClass;i||(i=yo(e,r,n),r.templatizeInstanceClass=i);let a=vo(e);bo(e,r,n,a);let o=class extends i{};return o.prototype._methodHost=a,o.prototype.__dataHost=e,o.prototype.__templatizeOwner=t,o.prototype.__hostProps=r.hostProps,o=o,o}function Eo(e,t,n){let r=n.constructor._properties,{propertyEffects:i}=e,{instanceProps:a}=t;for(let e in i)if(!r[e]&&!(a&&a[e])){let t=i[e];for(let n=0;n<t.length;n++){let{part:r}=t[n].info;if(!(r.signature&&r.signature.static)){console.warn(`Property '${e}' used in template but not declared in 'properties'; attribute will not be observed.`);break}}}}function Do(e,t){let n;for(;t;)if(n=t.__dataHost?t:t.__templatizeInstance){if(n.__dataHost!=e)t=n.__dataHost;else return n}else t=y(t).parentNode;return null}var Oo=!1;function ko(){if(g&&!be){if(!Oo){Oo=!0;let e=document.createElement(`style`);e.textContent=`dom-bind,dom-if,dom-repeat{display:none;}`,document.head.appendChild(e)}return!0}return!1}var Ao=R(co(kn(HTMLElement))),jo=class extends Ao{static get observedAttributes(){return[`mutable-data`]}constructor(){if(super(),h)throw Error(`strictTemplatePolicy: dom-bind not allowed`);this.root=null,this.$=null,this.__children=null}attributeChangedCallback(e,t,n,r){this.mutableData=!0}connectedCallback(){ko()||(this.style.display=`none`),this.render()}disconnectedCallback(){this.__removeChildren()}__insertChildren(){y(y(this).parentNode).insertBefore(this.root,this)}__removeChildren(){if(this.__children)for(let e=0;e<this.__children.length;e++)this.root.appendChild(this.__children[e])}render(){let e;if(!this.__children){if(e||=this.querySelector(`template`),!e){let t=new MutationObserver(()=>{if(e=this.querySelector(`template`),e)t.disconnect(),this.render();else throw Error(`dom-bind requires a <template> child`)});t.observe(this,{childList:!0});return}this.root=this._stampTemplate(e),this.$=this.root.$,this.__children=[];for(let e=this.root.firstChild;e;e=e.nextSibling)this.__children[this.__children.length]=e;this._enableProperties()}this.__insertChildren(),this.dispatchEvent(new CustomEvent(`dom-change`,{bubbles:!0,composed:!0}))}};customElements.define(`dom-bind`,jo);var Mo=co(A),No=class extends Mo{static get is(){return`dom-repeat`}static get template(){return null}static get properties(){return{items:{type:Array},as:{type:String,value:`item`},indexAs:{type:String,value:`index`},itemsIndexAs:{type:String,value:`itemsIndex`},sort:{type:Function,observer:`__sortChanged`},filter:{type:Function,observer:`__filterChanged`},observe:{type:String,observer:`__observeChanged`},delay:Number,renderedItemCount:{type:Number,notify:!Ne,readOnly:!0},initialCount:{type:Number},targetFramerate:{type:Number,value:20},_targetFrameTime:{type:Number,computed:`__computeFrameTime(targetFramerate)`},notifyDomChange:{type:Boolean},reuseChunkedInstances:{type:Boolean}}}static get observers(){return[`__itemsChanged(items.*)`]}constructor(){super(),this.__instances=[],this.__renderDebouncer=null,this.__itemsIdxToInstIdx={},this.__chunkCount=null,this.__renderStartTime=null,this.__itemsArrayChanged=!1,this.__shouldMeasureChunk=!1,this.__shouldContinueChunking=!1,this.__chunkingId=0,this.__sortFn=null,this.__filterFn=null,this.__observePaths=null,this.__ctor=null,this.__isDetached=!0,this.template=null,this._templateInfo}disconnectedCallback(){super.disconnectedCallback(),this.__isDetached=!0;for(let e=0;e<this.__instances.length;e++)this.__detachInstance(e);this.__chunkingId&&cancelAnimationFrame(this.__chunkingId)}connectedCallback(){if(super.connectedCallback(),ko()||(this.style.display=`none`),this.__isDetached){this.__isDetached=!1;let e=y(y(this).parentNode);for(let t=0;t<this.__instances.length;t++)this.__attachInstance(t,e);this.__chunkingId&&this.__render()}}__ensureTemplatized(){if(!this.__ctor){let e=this,t=this.template=e._templateInfo?e:this.querySelector(`template`);if(!t){let e=new MutationObserver(()=>{if(this.querySelector(`template`))e.disconnect(),this.__render();else throw Error(`dom-repeat requires a <template> child`)});return e.observe(this,{childList:!0}),!1}let n={};n[this.as]=!0,n[this.indexAs]=!0,n[this.itemsIndexAs]=!0,this.__ctor=To(t,this,{mutableData:this.mutableData,parentModel:!0,instanceProps:n,forwardHostProp:function(e,t){let n=this.__instances;for(let r=0,i;r<n.length&&(i=n[r]);r++)i.forwardHostProp(e,t)},notifyInstanceProp:function(e,t,n){if(ot(this.as,t)){let r=e[this.itemsIndexAs];t==this.as&&(this.items[r]=n);let i=x(this.as,`${JSCompiler_renameProperty(`items`,this)}.${r}`,t);this.notifyPath(i,n)}}})}return!0}__getMethodHost(){return this.__dataHost._methodHost||this.__dataHost}__functionFromPropertyValue(e){if(typeof e==`string`){let t=e,n=this.__getMethodHost();return function(){return n[t].apply(n,arguments)}}return e}__sortChanged(e){this.__sortFn=this.__functionFromPropertyValue(e),this.items&&this.__debounceRender(this.__render)}__filterChanged(e){this.__filterFn=this.__functionFromPropertyValue(e),this.items&&this.__debounceRender(this.__render)}__computeFrameTime(e){return Math.ceil(1e3/e)}__observeChanged(){this.__observePaths=this.observe&&this.observe.replace(`.*`,`.`).split(` `)}__handleObservedPaths(e){if(this.__sortFn||this.__filterFn){if(!e)this.__debounceRender(this.__render,this.delay);else if(this.__observePaths){let t=this.__observePaths;for(let n=0;n<t.length;n++)e.indexOf(t[n])===0&&this.__debounceRender(this.__render,this.delay)}}}__itemsChanged(e){this.items&&!Array.isArray(this.items)&&console.warn("dom-repeat expected array for `items`, found",this.items),this.__handleItemPath(e.path,e.value)||(e.path===`items`&&(this.__itemsArrayChanged=!0),this.__debounceRender(this.__render))}__debounceRender(e,t=0){this.__renderDebouncer=j.debounce(this.__renderDebouncer,t>0?w.after(t):T,e.bind(this)),Kn(this.__renderDebouncer)}render(){this.__debounceRender(this.__render),ja()}__render(){if(!this.__ensureTemplatized())return;let e=this.items||[],t=this.__sortAndFilterItems(e),n=this.__calculateLimit(t.length);this.__updateInstances(e,n,t),this.initialCount&&(this.__shouldMeasureChunk||this.__shouldContinueChunking)&&(cancelAnimationFrame(this.__chunkingId),this.__chunkingId=requestAnimationFrame(()=>{this.__chunkingId=null,this.__continueChunking()})),this._setRenderedItemCount(this.__instances.length),(!Ne||this.notifyDomChange)&&this.dispatchEvent(new CustomEvent(`dom-change`,{bubbles:!0,composed:!0}))}__sortAndFilterItems(e){let t=Array(e.length);for(let n=0;n<e.length;n++)t[n]=n;return this.__filterFn&&(t=t.filter((t,n,r)=>this.__filterFn(e[t],n,r))),this.__sortFn&&t.sort((t,n)=>this.__sortFn(e[t],e[n])),t}__calculateLimit(e){let t=e,n=this.__instances.length;if(this.initialCount){let r;!this.__chunkCount||this.__itemsArrayChanged&&!this.reuseChunkedInstances?(t=Math.min(e,this.initialCount),r=Math.max(t-n,0),this.__chunkCount=r||1):(r=Math.min(Math.max(e-n,0),this.__chunkCount),t=Math.min(n+r,e)),this.__shouldMeasureChunk=r===this.__chunkCount,this.__shouldContinueChunking=t<e,this.__renderStartTime=performance.now()}return this.__itemsArrayChanged=!1,t}__continueChunking(){if(this.__shouldMeasureChunk){let e=performance.now()-this.__renderStartTime,t=this._targetFrameTime/e;this.__chunkCount=Math.round(this.__chunkCount*t)||1}this.__shouldContinueChunking&&this.__debounceRender(this.__render)}__updateInstances(e,t,n){let r=this.__itemsIdxToInstIdx={},i;for(i=0;i<t;i++){let t=this.__instances[i],a=n[i],o=e[a];r[a]=i,t?(t._setPendingProperty(this.as,o),t._setPendingProperty(this.indexAs,i),t._setPendingProperty(this.itemsIndexAs,a),t._flushProperties()):this.__insertInstance(o,i,a)}for(let e=this.__instances.length-1;e>=i;e--)this.__detachAndRemoveInstance(e)}__detachInstance(e){let t=this.__instances[e],n=y(t.root);for(let e=0;e<t.children.length;e++){let r=t.children[e];n.appendChild(r)}return t}__attachInstance(e,t){let n=this.__instances[e];t.insertBefore(n.root,this)}__detachAndRemoveInstance(e){this.__detachInstance(e),this.__instances.splice(e,1)}__stampInstance(e,t,n){let r={};return r[this.as]=e,r[this.indexAs]=t,r[this.itemsIndexAs]=n,new this.__ctor(r)}__insertInstance(e,t,n){let r=this.__stampInstance(e,t,n),i=this.__instances[t+1],a=i?i.children[0]:this;return y(y(this).parentNode).insertBefore(r.root,a),this.__instances[t]=r,r}_showHideChildren(e){for(let t=0;t<this.__instances.length;t++)this.__instances[t]._showHideChildren(e)}__handleItemPath(e,t){let n=e.slice(6),r=n.indexOf(`.`),i=r<0?n:n.substring(0,r);if(i==parseInt(i,10)){let e=r<0?``:n.substring(r+1);this.__handleObservedPaths(e);let a=this.__itemsIdxToInstIdx[i],o=this.__instances[a];if(o){let n=this.as+(e?`.`+e:``);o._setPendingPropertyOrPath(n,t,!1,!0),o._flushProperties()}return!0}}itemForElement(e){let t=this.modelForElement(e);return t&&t[this.as]}indexForElement(e){let t=this.modelForElement(e);return t&&t[this.indexAs]}modelForElement(e){return Do(this.template,e)}};customElements.define(No.is,No);var Po=class extends A{static get is(){return`dom-if`}static get template(){return null}static get properties(){return{if:{type:Boolean,observer:`__debounceRender`},restamp:{type:Boolean,observer:`__debounceRender`},notifyDomChange:{type:Boolean}}}constructor(){super(),this.__renderDebouncer=null,this._lastIf=!1,this.__hideTemplateChildren__=!1,this.__template,this._templateInfo}__debounceRender(){this.__renderDebouncer=j.debounce(this.__renderDebouncer,T,()=>this.__render()),Kn(this.__renderDebouncer)}disconnectedCallback(){super.disconnectedCallback();let e=y(this).parentNode;(!e||e.nodeType==Node.DOCUMENT_FRAGMENT_NODE&&!y(e).host)&&this.__teardownInstance()}connectedCallback(){super.connectedCallback(),ko()||(this.style.display=`none`),this.if&&this.__debounceRender()}__ensureTemplate(){if(!this.__template){let e=this,t=e._templateInfo?e:y(e).querySelector(`template`);if(!t){let e=new MutationObserver(()=>{if(y(this).querySelector(`template`))e.disconnect(),this.__render();else throw Error(`dom-if requires a <template> child`)});return e.observe(this,{childList:!0}),!1}this.__template=t}return!0}__ensureInstance(){let e=y(this).parentNode;if(this.__hasInstance()){let t=this.__getInstanceNodes();if(t&&t.length&&y(this).previousSibling!==t[t.length-1])for(let n=0,r;n<t.length&&(r=t[n]);n++)y(e).insertBefore(r,this)}else{if(!e||!this.__ensureTemplate())return!1;this.__createAndInsertInstance(e)}return!0}render(){ja()}__render(){if(this.if){if(!this.__ensureInstance())return}else this.restamp&&this.__teardownInstance();this._showHideChildren(),(!Ne||this.notifyDomChange)&&this.if!=this._lastIf&&(this.dispatchEvent(new CustomEvent(`dom-change`,{bubbles:!0,composed:!0})),this._lastIf=this.if)}__hasInstance(){}__getInstanceNodes(){}__createAndInsertInstance(e){}__teardownInstance(){}_showHideChildren(){}},Fo=Me?class extends Po{constructor(){super(),this.__instance=null,this.__syncInfo=null}__hasInstance(){return!!this.__instance}__getInstanceNodes(){return this.__instance.templateInfo.childNodes}__createAndInsertInstance(e){let t=this.__dataHost||this;if(h&&!this.__dataHost)throw Error(`strictTemplatePolicy: template owner not trusted`);let n=t._bindTemplate(this.__template,!0);n.runEffects=(e,t,n)=>{let r=this.__syncInfo;if(this.if)r&&(this.__syncInfo=null,this._showHideChildren(),t=Object.assign(r.changedProps,t)),e(t,n);else if(this.__instance){if(r||=this.__syncInfo={runEffects:e,changedProps:{}},n)for(let e in t){let t=b(e);r.changedProps[t]=this.__dataHost[t]}else Object.assign(r.changedProps,t)}},this.__instance=t._stampTemplate(this.__template,n),y(e).insertBefore(this.__instance,this)}__syncHostProperties(){let e=this.__syncInfo;e&&(this.__syncInfo=null,e.runEffects(e.changedProps,!1))}__teardownInstance(){let e=this.__dataHost||this;this.__instance&&(e._removeBoundDom(this.__instance),this.__instance=null,this.__syncInfo=null)}_showHideChildren(){let e=this.__hideTemplateChildren__||!this.if;this.__instance&&!!this.__instance.__hidden!==e&&(this.__instance.__hidden=e,go(e,this.__instance.templateInfo.childNodes)),e||this.__syncHostProperties()}}:class extends Po{constructor(){super(),this.__ctor=null,this.__instance=null,this.__invalidProps=null}__hasInstance(){return!!this.__instance}__getInstanceNodes(){return this.__instance.children}__createAndInsertInstance(e){this.__ctor||=To(this.__template,this,{mutableData:!0,forwardHostProp:function(e,t){this.__instance&&(this.if?this.__instance.forwardHostProp(e,t):(this.__invalidProps=this.__invalidProps||Object.create(null),this.__invalidProps[b(e)]=!0))}}),this.__instance=new this.__ctor,y(e).insertBefore(this.__instance.root,this)}__teardownInstance(){if(this.__instance){let e=this.__instance.children;if(e&&e.length){let t=y(e[0]).parentNode;if(t){t=y(t);for(let n=0,r;n<e.length&&(r=e[n]);n++)t.removeChild(r)}}this.__invalidProps=null,this.__instance=null}}__syncHostProperties(){let e=this.__invalidProps;if(e){this.__invalidProps=null;for(let t in e)this.__instance._setPendingProperty(t,this.__dataHost[t]);this.__instance._flushProperties()}}_showHideChildren(){let e=this.__hideTemplateChildren__||!this.if;this.__instance&&!!this.__instance.__hidden!==e&&(this.__instance.__hidden=e,this.__instance._showHideChildren(e)),e||this.__syncHostProperties()}};customElements.define(Fo.is,Fo);var Io=_(e=>{let t=zn(e);class n extends t{static get properties(){return{items:{type:Array},multi:{type:Boolean,value:!1},selected:{type:Object,notify:!0},selectedItem:{type:Object,notify:!0},toggle:{type:Boolean,value:!1}}}static get observers(){return[`__updateSelection(multi, items.*)`]}constructor(){super(),this.__lastItems=null,this.__lastMulti=null,this.__selectedMap=null}__updateSelection(e,t){let n=t.path;if(n==JSCompiler_renameProperty(`items`,this)){let n=t.base||[],r=this.__lastItems;if(e!==this.__lastMulti&&this.clearSelection(),r){let e=Oa(n,r);this.__applySplices(e)}this.__lastItems=n,this.__lastMulti=e}else if(t.path==`${JSCompiler_renameProperty(`items`,this)}.splices`)this.__applySplices(t.value.indexSplices);else{let e=n.slice(`${JSCompiler_renameProperty(`items`,this)}.`.length),t=parseInt(e,10);e.indexOf(`.`)<0&&e==t&&this.__deselectChangedIdx(t)}}__applySplices(e){let t=this.__selectedMap;for(let n=0;n<e.length;n++){let r=e[n];t.forEach((e,n)=>{e<r.index||(e>=r.index+r.removed.length?t.set(n,e+r.addedCount-r.removed.length):t.set(n,-1))});for(let e=0;e<r.addedCount;e++){let n=r.index+e;t.has(this.items[n])&&t.set(this.items[n],n)}}this.__updateLinks();let n=0;t.forEach((e,r)=>{e<0?(this.multi?this.splice(JSCompiler_renameProperty(`selected`,this),n,1):this.selected=this.selectedItem=null,t.delete(r)):n++})}__updateLinks(){if(this.__dataLinkedPaths={},this.multi){let e=0;this.__selectedMap.forEach(t=>{t>=0&&this.linkPaths(`${JSCompiler_renameProperty(`items`,this)}.${t}`,`${JSCompiler_renameProperty(`selected`,this)}.${e++}`)})}else this.__selectedMap.forEach(e=>{this.linkPaths(JSCompiler_renameProperty(`selected`,this),`${JSCompiler_renameProperty(`items`,this)}.${e}`),this.linkPaths(JSCompiler_renameProperty(`selectedItem`,this),`${JSCompiler_renameProperty(`items`,this)}.${e}`)})}clearSelection(){this.__dataLinkedPaths={},this.__selectedMap=new Map,this.selected=this.multi?[]:null,this.selectedItem=null}isSelected(e){return this.__selectedMap.has(e)}isIndexSelected(e){return this.isSelected(this.items[e])}__deselectChangedIdx(e){let t=this.__selectedIndexForItemIndex(e);if(t>=0){let e=0;this.__selectedMap.forEach((n,r)=>{t==e++&&this.deselect(r)})}}__selectedIndexForItemIndex(e){let t=this.__dataLinkedPaths[`${JSCompiler_renameProperty(`items`,this)}.${e}`];if(t)return parseInt(t.slice(`${JSCompiler_renameProperty(`selected`,this)}.`.length),10)}deselect(e){let t=this.__selectedMap.get(e);if(t>=0){this.__selectedMap.delete(e);let n;this.multi&&(n=this.__selectedIndexForItemIndex(t)),this.__updateLinks(),this.multi?this.splice(JSCompiler_renameProperty(`selected`,this),n,1):this.selected=this.selectedItem=null}}deselectIndex(e){this.deselect(this.items[e])}select(e){this.selectIndex(this.items.indexOf(e))}selectIndex(e){let t=this.items[e];this.isSelected(t)?this.toggle&&this.deselectIndex(e):(this.multi||this.__selectedMap.clear(),this.__selectedMap.set(t,e),this.__updateLinks(),this.multi?this.push(JSCompiler_renameProperty(`selected`,this),t):this.selected=this.selectedItem=t)}}return n})(A),Lo=class extends Io{static get is(){return`array-selector`}static get template(){return null}};customElements.define(Lo.is,Lo);var Ro=new K;window.ShadyCSS||(window.ShadyCSS={prepareTemplate(e,t,n){},prepareTemplateDom(e,t){},prepareTemplateStyles(e,t,n){},styleSubtree(e,t){Ro.processStyles(),Si(e,t)},styleElement(e){Ro.processStyles()},styleDocument(e){Ro.processStyles(),Si(document.body,e)},getComputedStyleValue(e,t){return Ci(e,t)},flushCustomStyles(){},nativeCss:Vr,nativeShadow:Lr,cssBuild:z,disableRuntime:Br}),window.ShadyCSS.CustomStyleInterface=Ro;var zo=`include`,Bo=window.ShadyCSS.CustomStyleInterface,Vo=class extends HTMLElement{constructor(){super(),this._style=null,Bo.addCustomStyle(this)}getStyle(){if(this._style)return this._style;let e=this.querySelector(`style`);if(!e)return null;this._style=e;let t=e.getAttribute(zo);return t&&(e.removeAttribute(zo),e.textContent=$e(t)+e.textContent),this.ownerDocument!==window.document&&window.document.head.appendChild(this),this._style}};window.customElements.define(`custom-style`,Vo),so._mutablePropertyChange,qa(HTMLElement).prototype,ao({is:`iron-media-query`,properties:{queryMatches:{type:Boolean,value:!1,readOnly:!0,notify:!0},query:{type:String,observer:`queryChanged`},full:{type:Boolean,value:!1},_boundMQHandler:{value:function(){return this.queryHandler.bind(this)}},_mq:{value:null}},attached:function(){this.style.display=`none`,this.queryChanged()},detached:function(){this._remove()},_add:function(){this._mq&&this._mq.addListener(this._boundMQHandler)},_remove:function(){this._mq&&this._mq.removeListener(this._boundMQHandler),this._mq=null},queryChanged:function(){this._remove();var e=this.query;e&&(!this.full&&e[0]!==`(`&&(e=`(`+e+`)`),this._mq=window.matchMedia(e),this._add(),this.queryHandler(this._mq))},queryHandler:function(e){this._setQueryMatches(e.matches)}});var Ho=!1;window.addEventListener(`keydown`,()=>{Ho=!0},{capture:!0}),window.addEventListener(`mousedown`,()=>{Ho=!1},{capture:!0});var Uo=e=>class extends e{static get properties(){return{tabindex:{type:Number,value:0,reflectToAttribute:!0,observer:`_tabindexChanged`}}}},Wo=e=>class extends Uo(e){static get properties(){return{autofocus:{type:Boolean},_previousTabIndex:{type:Number},disabled:{type:Boolean,observer:`_disabledChanged`,reflectToAttribute:!0},_isShiftTabbing:{type:Boolean}}}ready(){this.addEventListener(`focusin`,e=>{e.composedPath()[0]===this?this.contains(e.relatedTarget)||this._focus():e.composedPath().indexOf(this.focusElement)!==-1&&!this.disabled&&this._setFocused(!0)}),this.addEventListener(`focusout`,()=>this._setFocused(!1)),super.ready(),this.addEventListener(`keydown`,e=>{!e.defaultPrevented&&e.keyCode===9&&e.shiftKey&&(this._isShiftTabbing=!0,HTMLElement.prototype.focus.apply(this),this._setFocused(!1),setTimeout(()=>this._isShiftTabbing=!1,0))}),this.autofocus&&!this.disabled&&window.requestAnimationFrame(()=>{this._focus(),this._setFocused(!0),this.setAttribute(`focus-ring`,``)})}disconnectedCallback(){super.disconnectedCallback(),this.hasAttribute(`focused`)&&this._setFocused(!1)}_setFocused(e){e?this.setAttribute(`focused`,``):this.removeAttribute(`focused`),e&&Ho?this.setAttribute(`focus-ring`,``):this.removeAttribute(`focus-ring`)}get focusElement(){return window.console.warn(`Please implement the 'focusElement' property in <${this.localName}>`),this}_focus(){!this.focusElement||this._isShiftTabbing||(this.focusElement.focus(),this._setFocused(!0))}focus(){!this.focusElement||this.disabled||(this.focusElement.focus(),this._setFocused(!0))}blur(){this.focusElement&&(this.focusElement.blur(),this._setFocused(!1))}_disabledChanged(e){this.focusElement.disabled=e,e?(this.blur(),this._previousTabIndex=this.tabindex,this.tabindex=-1,this.setAttribute(`aria-disabled`,`true`)):(this._previousTabIndex!==void 0&&(this.tabindex=this._previousTabIndex),this.removeAttribute(`aria-disabled`))}_tabindexChanged(e){e!==void 0&&(this.focusElement.tabIndex=e),this.disabled&&this.tabindex&&(this.tabindex!==-1&&(this._previousTabIndex=this.tabindex),this.tabindex=e=void 0)}click(){this.disabled||super.click()}},Go=class extends d(s(o(a(f(n))))){static get is(){return`vaadin-overlay`}static get styles(){return ae}render(){return t`
      <div id="backdrop" part="backdrop" ?hidden="${!this.withBackdrop}"></div>
      <div part="overlay" id="overlay" tabindex="0">
        <div part="content" id="content">
          <slot></slot>
        </div>
      </div>
    `}};l(Go);var Ko={"U+0008":`backspace`,"U+0009":`tab`,"U+001B":`esc`,"U+0020":`space`,"U+007F":`del`},qo={8:`backspace`,9:`tab`,13:`enter`,27:`esc`,33:`pageup`,34:`pagedown`,35:`end`,36:`home`,32:`space`,37:`left`,38:`up`,39:`right`,40:`down`,46:`del`,106:`*`},Jo={shift:`shiftKey`,ctrl:`ctrlKey`,alt:`altKey`,meta:`metaKey`},Yo=/[a-z0-9*]/,Xo=/U\+/,Zo=/^arrow/,Qo=/^space(bar)?/,$o=/^escape$/;function es(e,t){var n=``;if(e){var r=e.toLowerCase();r===` `||Qo.test(r)?n=`space`:$o.test(r)?n=`esc`:r.length==1?(!t||Yo.test(r))&&(n=r):n=Zo.test(r)?r.replace(`arrow`,``):r==`multiply`?`*`:r}return n}function ts(e){var t=``;return e&&(e in Ko?t=Ko[e]:Xo.test(e)?(e=parseInt(e.replace(`U+`,`0x`),16),t=String.fromCharCode(e).toLowerCase()):t=e.toLowerCase()),t}function ns(e){var t=``;return Number(e)&&(t=e>=65&&e<=90?String.fromCharCode(32+e):e>=112&&e<=123?`f`+(e-112+1):e>=48&&e<=57?String(e-48):e>=96&&e<=105?String(e-96):qo[e]),t}function rs(e,t){return e.key?es(e.key,t):e.detail&&e.detail.key?es(e.detail.key,t):ts(e.keyIdentifier)||ns(e.keyCode)||``}function is(e,t){return rs(t,e.hasModifiers)===e.key&&(!e.hasModifiers||!!t.shiftKey==!!e.shiftKey&&!!t.ctrlKey==!!e.ctrlKey&&!!t.altKey==!!e.altKey&&!!t.metaKey==!!e.metaKey)}function as(e){return e.length===1?{combo:e,key:e,event:`keydown`}:e.split(`+`).reduce(function(e,t){var n=t.split(`:`),r=n[0],i=n[1];return r in Jo?(e[Jo[r]]=!0,e.hasModifiers=!0):(e.key=r,e.event=i||`keydown`),e},{combo:e.split(`:`).shift()})}function os(e){return e.trim().split(` `).map(function(e){return as(e)})}var ss={properties:{keyEventTarget:{type:Object,value:function(){return this}},stopKeyboardEventPropagation:{type:Boolean,value:!1},_boundKeyHandlers:{type:Array,value:function(){return[]}},_imperativeKeyBindings:{type:Object,value:function(){return{}}}},observers:[`_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)`],keyBindings:{},registered:function(){this._prepKeyBindings()},attached:function(){this._listenKeyEventListeners()},detached:function(){this._unlistenKeyEventListeners()},addOwnKeyBinding:function(e,t){this._imperativeKeyBindings[e]=t,this._prepKeyBindings(),this._resetKeyEventListeners()},removeOwnKeyBindings:function(){this._imperativeKeyBindings={},this._prepKeyBindings(),this._resetKeyEventListeners()},keyboardEventMatchesKeys:function(e,t){for(var n=os(t),r=0;r<n.length;++r)if(is(n[r],e))return!0;return!1},_collectKeyBindings:function(){var e=this.behaviors.map(function(e){return e.keyBindings});return e.indexOf(this.keyBindings)===-1&&e.push(this.keyBindings),e},_prepKeyBindings:function(){for(var e in this._keyBindings={},this._collectKeyBindings().forEach(function(e){for(var t in e)this._addKeyBinding(t,e[t])},this),this._imperativeKeyBindings)this._addKeyBinding(e,this._imperativeKeyBindings[e]);for(var t in this._keyBindings)this._keyBindings[t].sort(function(e,t){var n=e[0].hasModifiers;return n===t[0].hasModifiers?0:n?-1:1})},_addKeyBinding:function(e,t){os(e).forEach(function(e){this._keyBindings[e.event]=this._keyBindings[e.event]||[],this._keyBindings[e.event].push([e,t])},this)},_resetKeyEventListeners:function(){this._unlistenKeyEventListeners(),this.isAttached&&this._listenKeyEventListeners()},_listenKeyEventListeners:function(){this.keyEventTarget&&Object.keys(this._keyBindings).forEach(function(e){var t=this._keyBindings[e],n=this._onKeyBindingEvent.bind(this,t);this._boundKeyHandlers.push([this.keyEventTarget,e,n]),this.keyEventTarget.addEventListener(e,n)},this)},_unlistenKeyEventListeners:function(){for(var e,t,n,r;this._boundKeyHandlers.length;)e=this._boundKeyHandlers.pop(),t=e[0],n=e[1],r=e[2],t.removeEventListener(n,r)},_onKeyBindingEvent:function(e,t){if(this.stopKeyboardEventPropagation&&t.stopPropagation(),!t.defaultPrevented)for(var n=0;n<e.length;n++){var r=e[n][0],i=e[n][1];if(is(r,t)&&(this._triggerKeyHandler(r,i,t),t.defaultPrevented))return}},_triggerKeyHandler:function(e,t,n){var r=Object.create(e);r.keyboardEvent=n;var i=new CustomEvent(e.event,{detail:r,cancelable:!0});this[t].call(this,i),i.defaultPrevented&&n.preventDefault()}},Q=ao({_template:k`
    <style>
      :host {
        display: inline-block;
        position: fixed;
        clip: rect(0px,0px,0px,0px);
      }
    </style>
    <div aria-live$="[[mode]]">[[_text]]</div>
`,is:`iron-a11y-announcer`,properties:{mode:{type:String,value:`polite`},timeout:{type:Number,value:150},_text:{type:String,value:``}},created:function(){Q.instance||=this,document.addEventListener(`iron-announce`,this._onIronAnnounce.bind(this))},announce:function(e){this._text=``,this.async(function(){this._text=e},this.timeout)},_onIronAnnounce:function(e){e.detail&&e.detail.text&&this.announce(e.detail.text)}});Q.instance=null,Q.requestAvailability=function(){Q.instance||=document.createElement(`iron-a11y-announcer`),document.body?document.body.appendChild(Q.instance):document.addEventListener(`load`,function(){document.body.appendChild(Q.instance)})};function cs(e){var t=e.getDay();t===0&&(t=7);var n=4-t,r=new Date(e.getTime()+n*24*3600*1e3),i=new Date(0,0);i.setFullYear(r.getFullYear());var a=r.getTime()-i.getTime(),o=Math.round(a/864e5);return Math.floor(o/7+1)}function $(e,t){return e instanceof Date&&t instanceof Date&&e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function ls(e,t,n){return e instanceof Date&&t instanceof Date&&n instanceof Date&&e.getTime()>=t.getTime()&&e.getTime()<=n.getTime()}function us(e,t,n){return(!t||e>=t)&&(!n||e<=n)}function ds(e,t){return t.filter(e=>e!==void 0).reduce((t,n)=>n?t?Math.abs(e.getTime()-n.getTime())<Math.abs(t.getTime()-e.getTime())?n:t:n:t)}function fs(e){return{day:e.getDate(),month:e.getMonth(),year:e.getFullYear()}}var ps=class extends o(R(A)){static get template(){return k`
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
    `}static get is(){return`vcf-date-range-month-calendar`}static get properties(){return{month:{type:Date,value:new Date},selectedStartDate:{type:Date,notify:!0},selectedEndDate:{type:Date,notify:!0},selectingStartDate:{type:Boolean,value:!0},classNamesForDates:{type:String,notify:!0},_classNamesForDates:{type:Object,value:{}},focusedDate:Date,showWeekNumbers:{type:Boolean,value:!1},i18n:{type:Object},ignoreTaps:Boolean,_notTapping:Boolean,minDate:{type:Date,value:null},maxDate:{type:Date,value:null},_days:{type:Array,computed:`_getDays(month, i18n.firstDayOfWeek, minDate, maxDate)`},disabled:{type:Boolean,reflectToAttribute:!0,computed:`_isDisabled(month, minDate, maxDate)`}}}static get observers(){return[`_showWeekNumbersChanged(showWeekNumbers, i18n.firstDayOfWeek)`,`_classNamesForDatesChanged(classNamesForDates)`]}_dateBetween(e,t,n){return ls(e,t,n)}_dateEquals(e,t){return $(e,t)}_dateAllowed(e,t,n){return us(e,t,n)}_isDisabled(e,t,n){var r=new Date(0,0);r.setFullYear(e.getFullYear()),r.setMonth(e.getMonth()),r.setDate(1);var i=new Date(0,0);return i.setFullYear(e.getFullYear()),i.setMonth(e.getMonth()+1),i.setDate(0),t&&n&&t.getMonth()===n.getMonth()&&t.getMonth()===e.getMonth()&&n.getDate()-t.getDate()>=0?!1:!this._dateAllowed(r,t,n)&&!this._dateAllowed(i,t,n)}_getTitle(e,t){if(e!==void 0&&t!==void 0)return this.i18n.formatTitle(t[e.getMonth()],e.getFullYear())}_onMonthGridTouchStart(){this._notTapping=!1,setTimeout(()=>this._notTapping=!0,300)}_dateAdd(e,t){e.setDate(e.getDate()+t)}_applyFirstDayOfWeek(e,t){if(e!==void 0&&t!==void 0)return e.slice(t).concat(e.slice(0,t))}_getWeekDayNames(e,t,n,r){if(e!==void 0&&t!==void 0&&n!==void 0&&r!==void 0)return e=this._applyFirstDayOfWeek(e,r),t=this._applyFirstDayOfWeek(t,r),e=e.map((e,n)=>({weekDay:e,weekDayShort:t[n]})),e}_getDate(e){return e?e.getDate():``}_showWeekNumbersChanged(e,t){e&&t===1?this.setAttribute(`week-numbers`,``):this.removeAttribute(`week-numbers`)}_classNamesForDatesChanged(e){this._classNamesForDates=JSON.parse(e)}_calculateClassNames(e){var t=``;for(let[n,r]of Object.entries(this._classNamesForDates))r.forEach(function(r,i){var a=this._parseDate(r);this._dateEquals(e,a)&&(t=t+` `+n)}.bind(this));return t}_parseDate(e){var t=/^([-+]\d{1}|\d{2,4}|[-+]\d{6})-(\d{1,2})-(\d{1,2})$/.exec(e);if(t){var n=new Date(0,0);return n.setFullYear(parseInt(t[1],10)),n.setMonth(parseInt(t[2],10)-1),n.setDate(parseInt(t[3],10)),n}}_showWeekSeparator(e,t){return e&&t===1}_isToday(e){return this._dateEquals(new Date,e)}_getDays(e,t){if(e!==void 0&&t!==void 0){var n=new Date(0,0);for(n.setFullYear(e.getFullYear()),n.setMonth(e.getMonth()),n.setDate(1);n.getDay()!==t;)this._dateAdd(n,-1);for(var r=[],i=n.getMonth(),a=e.getMonth();n.getMonth()===a||n.getMonth()===i;)r.push(n.getMonth()===a?new Date(n.getTime()):null),this._dateAdd(n,1);return r}}_getWeekNumber(e,t){if(e!==void 0&&t!==void 0)return e||=t.reduce((e,t)=>!e&&t?t:e),cs(e)}_getWeekNumbers(e){return e.map(t=>this._getWeekNumber(t,e)).filter((e,t,n)=>n.indexOf(e)===t)}_handleTap(e){!this.ignoreTaps&&!this._notTapping&&e.target.date&&!e.target.hasAttribute(`disabled`)&&(this.selectingStartDate?this.selectedStartDate=e.target.date:this.selectedEndDate=e.target.date,this.dispatchEvent(new CustomEvent(`date-tap`,{bubbles:!0,composed:!0})))}_preventDefault(e){e.preventDefault()}_getRole(e){return e?`button`:`presentation`}_getAriaLabel(e){if(!e)return``;var t=this._getDate(e)+` `+this.i18n.monthNames[e.getMonth()]+` `+e.getFullYear()+`, `+this.i18n.weekdays[e.getDay()];return this._isToday(e)&&(t+=`, `+this.i18n.today),t}_getAriaDisabled(e,t,n){if(e!==void 0&&t!==void 0&&n!==void 0)return this._dateAllowed(e,t,n)?`false`:`true`}};customElements.define(ps.is,ps);var ms=class e extends A{static get template(){return k`
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
  `}static get is(){return`vcf-date-range-infinite-scroller`}static get properties(){return{bufferSize:{type:Number,value:20},_initialScroll:{value:5e5},_initialIndex:{value:0},_buffers:Array,_preventScrollEvent:Boolean,_mayHaveMomentum:Boolean,_initialized:Boolean,active:{type:Boolean,observer:`_activated`}}}ready(){super.ready(),this._buffers=Array.prototype.slice.call(this.root.querySelectorAll(`.buffer`)),this.$.fullHeight.style.height=this._initialScroll*2+`px`;var e=this.querySelector(`template`);this._TemplateClass=To(e,this,{forwardHostProp:function(e,t){e!==`index`&&this._buffers.forEach(n=>{[].forEach.call(n.children,n=>{n._itemWrapper.instance[e]=t})})}}),navigator.userAgent.toLowerCase().indexOf(`firefox`)>-1&&(this.$.scroller.tabIndex=-1)}_activated(e){e&&!this._initialized&&(this._createPool(),this._initialized=!0)}_finishInit(){this._initDone||=(this._buffers.forEach(e=>{[].forEach.call(e.children,e=>this._ensureStampedInstance(e._itemWrapper))},this),this._buffers[0].translateY||this._reset(),!0)}_translateBuffer(e){var t=+!!e;this._buffers[t].translateY=this._buffers[+!t].translateY+this._bufferHeight*(t?-1:1),this._buffers[t].style.transform=`translate3d(0, `+this._buffers[t].translateY+`px, 0)`,this._buffers[t].updated=!1,this._buffers.reverse()}_scroll(){if(!this._scrollDisabled){var e=this.$.scroller.scrollTop;(e<this._bufferHeight||e>this._initialScroll*2-this._bufferHeight)&&(this._initialIndex=~~this.position,this._reset());var t=this.root.querySelector(`.buffer`).offsetTop,n=e>this._buffers[1].translateY+this.itemHeight+t,r=e<this._buffers[0].translateY+this.itemHeight+t;(n||r)&&(this._translateBuffer(r),this._updateClones()),this._preventScrollEvent||(this.dispatchEvent(new CustomEvent(`custom-scroll`,{bubbles:!1,composed:!0})),this._mayHaveMomentum=!0),this._preventScrollEvent=!1,this._debouncerScrollFinish=j.debounce(this._debouncerScrollFinish,w.after(200),()=>{var e=this.$.scroller.getBoundingClientRect();!this._isVisible(this._buffers[0],e)&&!this._isVisible(this._buffers[1],e)&&(this.position=this.position)})}}set position(e){this._preventScrollEvent=!0,e>this._firstIndex&&e<this._firstIndex+this.bufferSize*2?this.$.scroller.scrollTop=this.itemHeight*(e-this._firstIndex)+this._buffers[0].translateY:(this._initialIndex=~~e,this._reset(),this._scrollDisabled=!0,this.$.scroller.scrollTop+=e%1*this.itemHeight,this._scrollDisabled=!1),this._mayHaveMomentum&&(this.$.scroller.classList.add(`notouchscroll`),this._mayHaveMomentum=!1,setTimeout(()=>{this.$.scroller.classList.remove(`notouchscroll`)},10))}get position(){return(this.$.scroller.scrollTop-this._buffers[0].translateY)/this.itemHeight+this._firstIndex}get itemHeight(){if(!this._itemHeightVal){window.ShadyCSS&&window.ShadyCSS.nativeCss||this.updateStyles();let e=window.ShadyCSS?window.ShadyCSS.getComputedStyleValue(this,`--vaadin-infinite-scroller-item-height`):getComputedStyle(this).getPropertyValue(`--vaadin-infinite-scroller-item-height`),t=`background-position`;this.$.fullHeight.style.setProperty(t,e);let n=getComputedStyle(this.$.fullHeight).getPropertyValue(t);this.$.fullHeight.style.removeProperty(t),this._itemHeightVal=parseFloat(n)}return this._itemHeightVal}get _bufferHeight(){return this.itemHeight*this.bufferSize}_reset(){this._scrollDisabled=!0,this.$.scroller.scrollTop=this._initialScroll,this._buffers[0].translateY=this._initialScroll-this._bufferHeight,this._buffers[1].translateY=this._initialScroll,this._buffers.forEach(e=>{e.style.transform=`translate3d(0, `+e.translateY+`px, 0)`}),this._buffers[0].updated=this._buffers[1].updated=!1,this._updateClones(!0),this._debouncerUpdateClones=j.debounce(this._debouncerUpdateClones,w.after(200),()=>{this._buffers[0].updated=this._buffers[1].updated=!1,this._updateClones()}),this._scrollDisabled=!1}_createPool(){var t=this.getBoundingClientRect();this._buffers.forEach(n=>{for(var r=0;r<this.bufferSize;r++){let r=document.createElement(`div`);r.style.height=this.itemHeight+`px`,r.instance={};let i=`vaadin-infinite-scroller-item-content-`+(e._contentIndex=e._contentIndex+1||0),a=document.createElement(`slot`);a.setAttribute(`name`,i),a._itemWrapper=r,n.appendChild(a),r.setAttribute(`slot`,i),this.appendChild(r),setTimeout(()=>{this._isVisible(r,t)&&this._ensureStampedInstance(r)},1)}},this),setTimeout(()=>{ga(this,this._finishInit.bind(this))},1)}_ensureStampedInstance(e){if(!e.firstElementChild){var t=e.instance;e.instance=new this._TemplateClass({}),e.appendChild(e.instance.root),Object.keys(t).forEach(n=>{e.instance.set(n,t[n])})}}_updateClones(e){this._firstIndex=~~((this._buffers[0].translateY-this._initialScroll)/this.itemHeight)+this._initialIndex;var t=e?this.$.scroller.getBoundingClientRect():void 0;this._buffers.forEach((n,r)=>{if(!n.updated){var i=this._firstIndex+this.bufferSize*r;[].forEach.call(n.children,(n,r)=>{let a=n._itemWrapper;(!e||this._isVisible(a,t))&&(a.instance.index=i+r)}),n.updated=!0}},this)}_isVisible(e,t){var n=e.getBoundingClientRect();return n.bottom>t.top&&n.top<t.bottom}};customElements.define(ms.is,ms),c(`vcf-date-range-picker-overlay`,e`
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
      `,{moduleId:`vcf-date-range-picker-overlay-styles`});var hs=class extends o(s(R(A))){static get template(){return k`
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
    `}static get is(){return`vcf-date-range-picker-overlay-content`}static get properties(){return{selectedStartDate:{type:Date,notify:!0},selectedEndDate:{type:Date,notify:!0},selectingStartDate:{type:Boolean,value:!0,notify:!0},hideSidePanel:{type:Boolean,value:!1,reflectToAttribute:!0},focusedDate:{type:Date,notify:!0,observer:`_focusedDateChanged`},classNamesForDatesString:{type:String,notify:!0},classNamesForDates:{type:Object,value:{},notify:!0},_focusedMonthDate:Number,initialPosition:{type:Date,observer:`_initialPositionChanged`},_originDate:{value:new Date},_visibleMonthIndex:Number,_desktopMode:Boolean,_translateX:{observer:`_translateXChanged`},_yearScrollerWidth:{value:50},i18n:{type:Object},showWeekNumbers:{type:Boolean},_ignoreTaps:Boolean,_notTapping:Boolean,minDate:Date,maxDate:Date,_focused:Boolean,label:String}}get __isRTL(){return this.getAttribute(`dir`)===`rtl`}ready(){super.ready(),this.setAttribute(`tabindex`,0),this.addEventListener(`keydown`,this._onKeydown.bind(this)),Tr(this,`tap`,this._stopPropagation),this.addEventListener(`focus`,this._onOverlayFocus.bind(this)),this.addEventListener(`blur`,this._onOverlayBlur.bind(this))}setClassNameForDates(e){this.classNamesForDates=e,this.classNamesForDatesString=JSON.stringify(this.classNamesForDates)}connectedCallback(){super.connectedCallback(),this._closeYearScroller(),this._toggleAnimateClass(!0),jr(this.$.scrollers,`pan-y`),Q.requestAvailability()}announceFocusedDate(){var e=this._currentlyFocusedDate(),t=[];$(e,new Date)&&t.push(this.i18n.today),t=t.concat([this.i18n.weekdays[e.getDay()],e.getDate(),this.i18n.monthNames[e.getMonth()],e.getFullYear()]),this.showWeekNumbers&&this.i18n.firstDayOfWeek===1&&(t.push(this.i18n.week),t.push(cs(e))),this.dispatchEvent(new CustomEvent(`iron-announce`,{bubbles:!0,composed:!0,detail:{text:t.join(` `)}}))}focusCancel(){this.$.cancelButton.focus()}scrollToDate(e,t){this._scrollToPosition(this._differenceInMonths(e,this._originDate),t)}_focusedDateChanged(e){this.revealDate(e)}_isCurrentYear(e){return e===0}_isSelectedYear(e,t){if(t)return t.getFullYear()===this._originDate.getFullYear()+e}revealDate(e){if(e){var t=this._differenceInMonths(e,this._originDate),n=this.$.monthScroller.position>t,r=this.$.monthScroller.clientHeight/this.$.monthScroller.itemHeight,i=this.$.monthScroller.position+r-1<t;n?this._scrollToPosition(t,!0):i&&this._scrollToPosition(t-r+1,!0)}}removePreselectionById(e){this.shadowRoot.getElementById(e).remove()}addToolbarContent(e){var t=this.shadowRoot;e.forEach(function(e,n){t.getElementById(`toolbarDiv`).appendChild(e)})}_onOverlayFocus(){this._focused=!0}_onOverlayBlur(){this._focused=!1}_initialPositionChanged(e){this.scrollToDate(e)}_repositionYearScroller(){this._visibleMonthIndex=Math.floor(this.$.monthScroller.position),this.$.yearScroller.position=(this.$.monthScroller.position+this._originDate.getMonth())/12}_repositionMonthScroller(){this.$.monthScroller.position=this.$.yearScroller.position*12-this._originDate.getMonth(),this._visibleMonthIndex=Math.floor(this.$.monthScroller.position)}_onMonthScroll(){this._repositionYearScroller(),this._doIgnoreTaps()}_onYearScroll(){this._repositionMonthScroller(),this._doIgnoreTaps()}_onYearScrollTouchStart(){this._notTapping=!1,setTimeout(()=>this._notTapping=!0,300),this._repositionMonthScroller()}_onMonthScrollTouchStart(){this._repositionYearScroller()}_doIgnoreTaps(){this._ignoreTaps=!0,this._debouncer=j.debounce(this._debouncer,w.after(300),()=>this._ignoreTaps=!1)}_formatDisplayed(e,t,n){return e?t(fs(e)):n}_onTodayTap(){var e=new Date;Math.abs(this.$.monthScroller.position-this._differenceInMonths(e,this._originDate))<.001?(this.selectedStartDate=e,this.selectedEndDate=e,this._close()):this._scrollToCurrentMonth()}_onYesterdayTap(){let e=new Date(new Date);e.setDate(e.getDate()-1),Math.abs(this.$.monthScroller.position-this._differenceInMonths(e,this._originDate))<.001?(this.selectedStartDate=e,this.selectedEndDate=e,this._close()):this._scrollToCurrentMonth()}_onThisWeekTap(){var e=this.i18n.firstDayOfWeek===1?this._getLastMonday(new Date):this._getLastSunday(new Date);this.selectedStartDate=e;var t=new Date(e);t.setDate(new Date(e.getDate()+6)),this.selectedEndDate=t,this._close()}_onLastWeekTap(){var e=this.i18n.firstDayOfWeek===1?this._getLastMonday(new Date):this._getLastSunday(new Date);e.setDate(e.getDate()-7),this.selectedStartDate=e;var t=new Date(e);t.setDate(new Date(e.getDate()+6)),this.selectedEndDate=t,this._close()}_onThisMonthTap(){var e=new Date(new Date().getFullYear(),new Date().getMonth(),1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear(),new Date().getMonth()+1,0);this.selectedEndDate=t,this._close()}_onLastMonthTap(){var e=new Date(new Date().getFullYear(),new Date().getMonth()-1,1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear(),new Date().getMonth(),0);this.selectedEndDate=t,this._close()}_onThisYearTap(){var e=new Date(new Date().getFullYear(),0,1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear()+1,0,0);this.selectedEndDate=t,this._close()}_onLastYearTap(){var e=new Date(new Date().getFullYear()-1,0,1);this.selectedStartDate=e;var t=new Date(new Date().getFullYear(),0,0);this.selectedEndDate=t,this._close()}_getLastSunday(e){var t=new Date(e);return t.setDate(t.getDate()-t.getDay()),t}_getLastMonday(e){var t=new Date(e);return t.setDate(t.getDate()-t.getDay()+1),t}_scrollToCurrentMonth(){this.focusedDate&&=new Date,this.scrollToDate(new Date,!0)}_showClear(e,t){return!!(e|t)}_onYearTap(e){if(!this._ignoreTaps&&!this._notTapping){var t=(e.detail.y-(this.$.yearScroller.getBoundingClientRect().top+this.$.yearScroller.clientHeight/2))/this.$.yearScroller.itemHeight;this._scrollToPosition(this.$.monthScroller.position+t*12,!0)}}_scrollToPosition(e,t){if(this._targetPosition!==void 0){this._targetPosition=e;return}if(!t){this.$.monthScroller.position=e,this._targetPosition=void 0,this._repositionYearScroller();return}this._targetPosition=e;var n=(e,t,n,r)=>(e/=r/2,e<1?n/2*e*e+t:(e--,-n/2*(e*(e-2)-1)+t)),r=t?300:0,i=0,a=this.$.monthScroller.position,o=e=>{i||=e;var t=e-i;if(t<r){var s=n(t,a,this._targetPosition-a,r);this.$.monthScroller.position=s,window.requestAnimationFrame(o)}else this.dispatchEvent(new CustomEvent(`scroll-animation-finished`,{bubbles:!0,composed:!0,detail:{position:this._targetPosition,oldPosition:a}})),this.$.monthScroller.position=this._targetPosition,this._targetPosition=void 0;setTimeout(this._repositionYearScroller.bind(this),1)};window.requestAnimationFrame(o)}_limit(e,t){return Math.min(t.max,Math.max(t.min,e))}_handleTrack(e){if(!(Math.abs(e.detail.dx)<10||Math.abs(e.detail.ddy)>10)){Math.abs(e.detail.ddx)>this._yearScrollerWidth/3&&this._toggleAnimateClass(!0);var t=this._translateX+e.detail.ddx;this._translateX=this._limit(t,{min:0,max:this._yearScrollerWidth})}}_track(e){if(!this._desktopMode)switch(e.detail.state){case`start`:this._toggleAnimateClass(!1);break;case`track`:this._handleTrack(e);break;case`end`:this._toggleAnimateClass(!0),this._translateX>=this._yearScrollerWidth/2?this._closeYearScroller():this._openYearScroller()}}_toggleAnimateClass(e){e?this.classList.add(`animate`):this.classList.remove(`animate`)}_toggleYearScroller(){this._isYearScrollerVisible()?this._closeYearScroller():this._openYearScroller()}_openYearScroller(){this._translateX=0,this.setAttribute(`years-visible`,``)}_closeYearScroller(){this.removeAttribute(`years-visible`),this._translateX=this._yearScrollerWidth}_isYearScrollerVisible(){return this._translateX<this._yearScrollerWidth/2}_translateXChanged(e){this._desktopMode||(this.$.monthScroller.style.transform=`translateX(`+(e-this._yearScrollerWidth)+`px)`,this.$.yearScroller.style.transform=`translateX(`+e+`px)`)}_yearAfterXYears(e){var t=new Date(this._originDate);return t.setFullYear(parseInt(e)+this._originDate.getFullYear()),t.getFullYear()}_yearAfterXMonths(e){return this._dateAfterXMonths(e).getFullYear()}_dateAfterXMonths(e){var t=new Date(this._originDate);return t.setDate(1),t.setMonth(parseInt(e)+this._originDate.getMonth()),t}_differenceInMonths(e,t){return(e.getFullYear()-t.getFullYear())*12-t.getMonth()+e.getMonth()}_differenceInYears(e,t){return this._differenceInMonths(e,t)/12}_clear(){this.selectedStartDate=``,this.selectedEndDate=``}_close(e){let t=this.getRootNode().host,n=t?t.getRootNode().host:null;n&&(n.opened=!1),this.dispatchEvent(new CustomEvent(`close`,{bubbles:!0,composed:!0,detail:{cancel:!!e}}))}_cancel(){this.focusedDate=this.selectedStartDate,this._close(!0)}_preventDefault(e){e.preventDefault()}_eventKey(e){for(var t=[`down`,`up`,`right`,`left`,`enter`,`space`,`home`,`end`,`pageup`,`pagedown`,`tab`,`esc`],n=0;n<t.length;n++){var r=t[n];if(ss.keyboardEventMatchesKeys(e,r))return r}}_onKeydown(e){var t=this._currentlyFocusedDate();let n=e.composedPath().indexOf(this.$.todayButton)>=0,r=e.composedPath().indexOf(this.$.cancelButton)>=0,i=!n&&!r;var a=this._eventKey(e);if(a===`tab`){e.stopPropagation();let t=this.hasAttribute(`fullscreen`),a=e.shiftKey;t?e.preventDefault():a&&i||!a&&r?(e.preventDefault(),this.dispatchEvent(new CustomEvent(`focus-input`,{bubbles:!0,composed:!0}))):a&&n?(this._focused=!0,setTimeout(()=>this.revealDate(this.focusedDate),1)):this._focused=!1}else if(a)switch(e.preventDefault(),e.stopPropagation(),a){case`down`:this._moveFocusByDays(7),this.focus();break;case`up`:this._moveFocusByDays(-7),this.focus();break;case`right`:i&&this._moveFocusByDays(this.__isRTL?-1:1);break;case`left`:i&&this._moveFocusByDays(this.__isRTL?1:-1);break;case`enter`:i||r?this._close():n&&this._onTodayTap();break;case`space`:if(r)this._close();else if(n)this._onTodayTap();else{var o=this.focusedDate;this.selectingStartDate?$(o,this.selectedStartDate)?(this.selectedStartDate=``,this.focusedDate=o):(this.selectedStartDate=o,this.selectingStartDate=!1):$(o,this.selectedEndDate)?(this.selectedEndDate=``,this.focusedDate=o):(this.selectedEndDate=o,this._close())}break;case`home`:this._moveFocusInsideMonth(t,`minDate`);break;case`end`:this._moveFocusInsideMonth(t,`maxDate`);break;case`pagedown`:this._moveFocusByMonths(e.shiftKey?12:1);break;case`pageup`:this._moveFocusByMonths(e.shiftKey?-12:-1);break;case`esc`:this._cancel()}}_currentlyFocusedDate(){return this.focusedDate||this.selectedStartDate||this.initialPosition||new Date}_focusDate(e){this.focusedDate=e,this._focusedMonthDate=e.getDate()}_focusClosestDate(e){this._focusDate(ds(e,[this.minDate,this.maxDate]))}_moveFocusByDays(e){var t=this._currentlyFocusedDate(),n=new Date(0,0);n.setFullYear(t.getFullYear()),n.setMonth(t.getMonth()),n.setDate(t.getDate()+e),this._dateAllowed(n,this.minDate,this.maxDate)?this._focusDate(n):this._dateAllowed(t,this.minDate,this.maxDate)?e>0?this._focusDate(this.maxDate):this._focusDate(this.minDate):this._focusClosestDate(t)}_moveFocusByMonths(e){var t=this._currentlyFocusedDate(),n=new Date(0,0);n.setFullYear(t.getFullYear()),n.setMonth(t.getMonth()+e);var r=n.getMonth();n.setDate(this._focusedMonthDate||=t.getDate()),n.getMonth()!==r&&n.setDate(0),this._dateAllowed(n,this.minDate,this.maxDate)?this.focusedDate=n:this._dateAllowed(t,this.minDate,this.maxDate)?e>0?this._focusDate(this.maxDate):this._focusDate(this.minDate):this._focusClosestDate(t)}_moveFocusInsideMonth(e,t){var n=new Date(0,0);n.setFullYear(e.getFullYear()),t===`minDate`?(n.setMonth(e.getMonth()),n.setDate(1)):(n.setMonth(e.getMonth()+1),n.setDate(0)),this._dateAllowed(n,this.minDate,this.maxDate)?this._focusDate(n):this._dateAllowed(e,this.minDate,this.maxDate)?this._focusDate(this[t]):this._focusClosestDate(e)}_dateAllowed(e,t,n){return(!t||e>=t)&&(!n||e<=n)}_isTodayAllowed(e,t){var n=new Date,r=new Date(0,0);return r.setFullYear(n.getFullYear()),r.setMonth(n.getMonth()),r.setDate(n.getDate()),this._dateAllowed(r,e,t)}_stopPropagation(e){e.stopPropagation()}};customElements.define(hs.is,hs);var gs=class extends te(Go){static get is(){return`vcf-date-range-picker-overlay`}};customElements.define(gs.is,gs);var _s=r(e=>typeof e.prototype.addController==`function`?e:class extends e{constructor(){super(),this.__controllers=new Set}connectedCallback(){super.connectedCallback(),this.__controllers.forEach(e=>{e.hostConnected&&e.hostConnected()})}disconnectedCallback(){super.disconnectedCallback(),this.__controllers.forEach(e=>{e.hostDisconnected&&e.hostDisconnected()})}addController(e){this.__controllers.add(e),this.$!==void 0&&this.isConnected&&e.hostConnected&&e.hostConnected()}removeController(e){this.__controllers.delete(e)}}),vs=e=>class extends ne(_s(u(ee(se(e))))){static get properties(){return{_selectedStartDate:{type:Date},_selectedEndDate:{type:Date},_selectingStartDate:{type:Boolean},_focusedDate:Date,value:{type:String,observer:`_valueChanged`,notify:!0,value:``},required:{type:Boolean,value:!1},name:{type:String},initialPosition:String,label:String,opened:{type:Boolean,reflectToAttribute:!0,notify:!0,observer:`_openedChanged`},autoOpenDisabled:Boolean,showWeekNumbers:{type:Boolean},_fullscreen:{type:Boolean,value:!1,observer:`_fullscreenChanged`},_fullscreenMediaQuery:{value:`(max-width: 420px), (max-height: 420px)`},_touchPrevented:Array,i18n:{type:Object,value:()=>({monthNames:[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`],weekdays:[`Sunday`,`Monday`,`Tuesday`,`Wednesday`,`Thursday`,`Friday`,`Saturday`],weekdaysShort:[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],firstDayOfWeek:0,week:`Week`,calendar:`Calendar`,clear:`Clear`,today:`Today`,yesterday:`Yesterday`,thisWeek:`This week`,lastWeek:`Last week`,thisMonth:`This month`,lastMonth:`Last month`,thisYear:`This Year`,lastYear:`Last Year`,cancel:`Cancel`,formatDate:e=>{let t=String(e.year).replace(/\d+/,e=>`0000`.substr(e.length)+e);return[e.month+1,e.day,t].join(`/`)},parseDate:e=>{let t=e.split(`/`),n=new Date,r,i=n.getMonth(),a=n.getFullYear();if(t.length===3?(a=parseInt(t[2]),t[2].length<3&&a>=0&&(a+=a<50?2e3:1900),i=parseInt(t[0])-1,r=parseInt(t[1])):t.length===2?(i=parseInt(t[0])-1,r=parseInt(t[1])):t.length===1&&(r=parseInt(t[0])),r!==void 0)return{day:r,month:i,year:a}},formatTitle:(e,t)=>e+` `+t})},min:{type:String,observer:`_minChanged`},max:{type:String,observer:`_maxChanged`},_minDate:{type:Date,value:``},_maxDate:{type:Date,value:``},_startXPosition:{type:Number,value:null},_startYPosition:{type:Number,value:null},_noInput:{type:Boolean,computed:`_isNoInput(_fullscreen, _ios, i18n, i18n.*)`},_ios:{type:Boolean,value:navigator.userAgent.match(/iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/)},_webkitOverflowScroll:{type:Boolean,value:document.createElement(`div`).style.webkitOverflowScrolling===``},_ignoreAnnounce:{value:!0},_focusOverlayOnOpen:Boolean,_overlayContent:{type:Object,sync:!0},_overlayInitialized:Boolean}}static get observers(){return[`_selectedStartDateChanged(_selectedStartDate, i18n.formatDate)`,`_selectedEndDateChanged(_selectedEndDate, i18n.formatDate)`,`_focusedDateChanged(_focusedDate, i18n.formatDate)`,`_announceFocusedDate(_focusedDate, opened, _ignoreAnnounce)`,`__updateOverlayContent(_overlayContent, i18n, label, _minDate, _maxDate, _focusedDate, showWeekNumbers, _selectedStartDate, _selectedEndDate, _selectingStartDate, hideSidePanel)`,`__updateOverlayContentTheme(_overlayContent, _theme)`,`__updateOverlayContentFullScreen(_overlayContent, _fullscreen)`]}__updateOverlayContent(e,t,n,r,i,a,o,s,c,l,u){e&&(e.i18n=t,e.label=n,e.minDate=r,e.maxDate=i,e.focusedDate=a,e.showWeekNumbers=o,e.selectedStartDate=s,e.selectedEndDate=c,e.selectingStartDate=l,e.hideSidePanel=u)}__updateOverlayContentTheme(e,t){e&&(t?e.setAttribute(`theme`,t):e.removeAttribute(`theme`))}__updateOverlayContentFullScreen(e,t){e&&e.toggleAttribute(`fullscreen`,t)}constructor(){super(),this._boundOnClick=this._onClick.bind(this),this._boundOnScroll=this._onScroll.bind(this),this._boundFocus=this._focus.bind(this),this._boundUpdateAlignmentAndPosition=this._updateAlignmentAndPosition.bind(this),this._boundOverlayRenderer=this._overlayRenderer.bind(this)}ready(){super.ready(),this.addController(new re(this._fullscreenMediaQuery,e=>{this._fullscreen=e})),this.addController(new ie(this));let e=this.$.overlay;this._overlayElement=e,e.renderer=this._boundOverlayRenderer;let t=e=>e.composedPath()[0].id===`clearButton`;Tr(this,`tap`,e=>{!t(e)&&(!this.autoOpenDisabled||this._noInput)&&this.open()}),this.addEventListener(`touchend`,e=>{t(e)||e.preventDefault()}),this.addEventListener(`keydown`,this._onKeydown.bind(this)),this._inputStartElement.addEventListener(`input`,this._onUserInputStart.bind(this)),this._inputEndElement.addEventListener(`input`,this._onUserInputEnd.bind(this)),this.addEventListener(`focus`,e=>this._noInput&&e.target.blur()),this.addEventListener(`blur`,e=>{if(!this.opened){if(this.autoOpenDisabled){let e=this._getParsedDate(this._inputStartValue);this._isValidDate(e)&&(this._selectedStartDate=e);let t=this._getParsedDate(this._inputEndValue);this._isValidDate(t)&&(this._selectedEndDate=t)}this._inputStartElement.value===``&&this.__dispatchChange?(this.validateStart(),this.value=`;`,this.__dispatchChange=!1):this.validateStart()}})}_initOverlay(){this.$.overlay.removeAttribute(`disable-upgrade`),this._overlayInitialized=!0,this.$.overlay.addEventListener(`opened-changed`,e=>this.opened=e.detail.value),this._overlayContent.addEventListener(`close`,this._close.bind(this)),this._overlayContent.addEventListener(`focus-input`,this._focusAndSelect.bind(this)),this.$.overlay.addEventListener(`vaadin-overlay-escape-press`,this._boundFocus),this._overlayContent.addEventListener(`focus`,()=>this._onFocusElement()),this._overlayContent.setClassNameForDates(this._classNamesForDates),this.$.overlay.addEventListener(`vaadin-overlay-close`,this._onVaadinOverlayClose.bind(this));let e=e=>{this.$.overlay.bringToFront&&requestAnimationFrame(()=>{this.$.overlay.bringToFront()})};this.addEventListener(`mousedown`,e),this.addEventListener(`touchstart`,e)}_onFocusElement(){this.focusElement&&this.focusElement._setFocused&&this.focusElement._setFocused(!0)}disconnectedCallback(){super.disconnectedCallback(),this._overlayInitialized&&this.$.overlay.removeEventListener(`vaadin-overlay-escape-press`,this._boundFocus),this.opened=!1}open(){!this.disabled&&!this.readonly&&(this.opened=!0)}openOnPosition(e,t){this._startXPosition=e,this._startYPosition=t,!this.disabled&&!this.readonly&&(this.opened=!0)}_closeOnTap(e){this._selectingStartDate?(this._selectingStartDate=!1,this._selectedEndDate&&this._selectedStartDate>=this._selectedEndDate&&(this._selectedEndDate=void 0)):(e&&e.stopPropagation(),this._selectedStartDate&&this._selectedStartDate<=this._selectedEndDate?(this._selectingStartDate=!0,this._focus(),this.close()):(this._selectingStartDate=!1,this._selectedStartDate=this._selectedEndDate,this._selectedEndDate=void 0))}_close(e){e&&(e.stopPropagation(),e.detail&&(this._cancelled=e.detail.cancel)),this._focus(),this.close()}close(){(this._overlayInitialized||this.autoOpenDisabled)&&this.$.overlay.close()}_overlayRenderer(e){if(e.firstElementChild)return;let t=document.createElement(`vcf-date-range-picker-overlay-content`);e.appendChild(t),this._overlayContent=t,this._initOverlay(),this._updateAlignmentAndPosition(),t.addEventListener(`close`,()=>{this._close()}),t.addEventListener(`focus-input`,this._focusAndSelect.bind(this)),t.addEventListener(`date-tap`,e=>this._closeOnTap(e)),t.addEventListener(`selected-start-date-changed`,e=>{this._selectedStartDate=e.detail.value}),t.addEventListener(`selected-end-date-changed`,e=>{this._selectedEndDate=e.detail.value}),t.addEventListener(`selecting-start-date-changed`,e=>{this._selectingStartDate=e.detail.value}),t.addEventListener(`focused-date-changed`,e=>{this._focusedDate=e.detail.value})}get _inputStartElement(){return this._inputStart()}get _inputEndElement(){return this._inputEnd()}get _nativeInput(){if(this._inputStartElement)return this._inputStartElement.focusElement?this._inputStartElement.focusElement:this._inputStartElement.inputElement?this._inputStartElement.inputElement:window.unwrap?window.unwrap(this._inputStartElement):this._inputStartElement}_parseDate(e){var t=/^([-+]\d{1}|\d{2,4}|[-+]\d{6})-(\d{1,2})-(\d{1,2})$/.exec(e);if(t){var n=new Date(0,0);return n.setFullYear(parseInt(t[1],10)),n.setMonth(parseInt(t[2],10)-1),n.setDate(parseInt(t[3],10)),n}}_isNoInput(e,t,n){return!this._inputStartElement||!this._inputEndElement||e||t||!n.parseDate}_formatISO(e){if(!(e instanceof Date))return``;let t=(e,t=`00`)=>(t+e).substr((t+e).length-t.length),n=``,r=`0000`,i=e.getFullYear();return i<0?(i=-i,n=`-`,r=`000000`):e.getFullYear()>=1e4&&(n=`+`,r=`000000`),[n+t(i,r),t(e.getMonth()+1),t(e.getDate())].join(`-`)}_openedChanged(e){this._selectingStartDate=!0,this.inputElement&&this.inputElement.setAttribute(`aria-expanded`,e)}_selectedStartDateChanged(e,t){e!==void 0&&t!==void 0&&(this.__userInputOccurred&&(this.__dispatchChange=!0),this._formatISO(e),this.__keepInputValue||this._applyStartInputValue(e),this.__userInputOccurred=!1,this.__dispatchChange=!1,this._ignoreFocusedDateChange=!0,this._focusedDate=e,this._ignoreFocusedDateChange=!1)}_selectedEndDateChanged(e,t){e!==void 0&&t!==void 0&&(this.__userInputOccurred&&(this.__dispatchChange=!0),this._formatISO(e),this.__keepInputValue||this._applyEndInputValue(e),this.__userInputOccurred=!1,this.__dispatchChange=!1,this._ignoreFocusedDateChange=!0,this._focusedDate=e,this._ignoreFocusedDateChange=!1)}_focusedDateChanged(e,t){e!==void 0&&t!==void 0&&(this.__userInputOccurred=!0,this._selectingStartDate!==void 0&&!this._ignoreFocusedDateChange&&!this._noInput&&this.opened&&(this._selectingStartDate?this._applyStartInputValue(e):this._applyEndInputValue(e)))}get _hasValue(){return this._selectedStartDate!=null&&this._selectedStartDate!==``||this._selectedEndDate!=null&&this._selectedEndDate!==``}_updateHasValue(e){this.toggleAttribute(`has-value`,e)}__getOverlayTheme(e,t){if(t)return e}_handleDateChange(e,t,n){if(!t){this[e]=``;return}var r=this._parseDate(t);return r?($(this[e],r)||(this[e]=r,this.value&&this.validateStart()&&this.validateEnd()),!0):!1}_valueChanged(e,t){this.__dispatchChange&&this.dispatchEvent(new CustomEvent(`change`,{bubbles:!0}));var n=this._extractStartDate(e),r=this._extractEndDate(e);n&&!this._handleDateChange(`_selectedStartDate`,n,t)?(n=``,this._selectedStartDate=null):this._selectedStartDate=this._parseDate(n),r&&!this._handleDateChange(`_selectedEndDate`,r,t)?(r=``,this._selectedEndDate=null):this._selectedEndDate=this._parseDate(r),this.value=n+`;`+r,this._updateHasValue(this._hasValue)}_extractStartDate(e){return e.split(`;`)[0]??``}_extractEndDate(e){return e.split(`;`)[1]??``}_minChanged(e,t){this._handleDateChange(`_minDate`,e,t)||(this.min=t)}_maxChanged(e,t){this._handleDateChange(`_maxDate`,e,t)||(this.max=t)}_updateAlignmentAndPosition(){if(this._overlayInitialized){if(!this._fullscreen){if(this._startXPosition&&this._startYPosition)this.$.overlay.removeAttribute(`right-aligned`),this.$.overlay.removeAttribute(`bottom-aligned`),this.$.overlay.style.setProperty(`top`,this._startYPosition+`px`),this.$.overlay.style.setProperty(`left`,this._startXPosition+`px`);else{let e=this._inputStartElement.getBoundingClientRect(),t=e.top>window.innerHeight/2;if(e.left+this.clientWidth/2>window.innerWidth/2){let t=Math.min(window.innerWidth,document.documentElement.clientWidth);this.$.overlay.setAttribute(`right-aligned`,``),this.$.overlay.style.removeProperty(`left`),this.$.overlay.style.right=t-e.right+`px`}else this.$.overlay.removeAttribute(`right-aligned`),this.$.overlay.style.removeProperty(`right`),this.$.overlay.style.left=e.left+`px`;if(t){let t=Math.min(window.innerHeight,document.documentElement.clientHeight);this.$.overlay.setAttribute(`bottom-aligned`,``),this.$.overlay.style.removeProperty(`top`),this.$.overlay.style.bottom=t-e.top+`px`}else this.$.overlay.removeAttribute(`bottom-aligned`),this.$.overlay.style.removeProperty(`bottom`),this.$.overlay.style.top=e.bottom+`px`}}this.$.overlay.setAttribute(`dir`,getComputedStyle(this._inputStartElement).getPropertyValue(`direction`)),this._overlayContent._repositionYearScroller()}}_fullscreenChanged(){this._overlayInitialized&&this.$.overlay.opened&&this._updateAlignmentAndPosition()}_onOverlayOpened(){this._openedWithFocusRing=this.hasAttribute(`focus-ring`)||this.focusElement&&this.focusElement.hasAttribute(`focus-ring`);var e=this._parseDate(this.initialPosition),t=this._selectedStartDate||this._overlayContent.initialPosition||e||new Date;e||us(t,this._minDate,this._maxDate)?this._overlayContent.initialPosition=t:this._overlayContent.initialPosition=ds(t,[this._minDate,this._maxDate]),this._overlayContent.scrollToDate(this._overlayContent.focusedDate||this._overlayContent.initialPosition),this._ignoreFocusedDateChange=!0,this._overlayContent.focusedDate=this._overlayContent.focusedDate||this._overlayContent.initialPosition,this._ignoreFocusedDateChange=!1,window.addEventListener(`scroll`,this._boundOnScroll,!0),this.addEventListener(`iron-resize`,this._boundUpdateAlignmentAndPosition),this._webkitOverflowScroll&&(this._touchPrevented=this._preventWebkitOverflowScrollingTouch(this.parentElement)),this._focusOverlayOnOpen?(this._overlayContent.focus(),this._focusOverlayOnOpen=!1):this._focus(),this._noInput&&this.focusElement&&this.focusElement.blur();var n=this.shadowRoot.querySelector(`slot[name='presets']`).assignedNodes();this._overlayContent.addToolbarContent(n),this.updateStyles(),this._ignoreAnnounce=!1}_preventWebkitOverflowScrollingTouch(e){for(var t=[];e;){if(window.getComputedStyle(e).webkitOverflowScrolling===`touch`){var n=e.style.webkitOverflowScrolling;e.style.webkitOverflowScrolling=`auto`,t.push({element:e,oldInlineValue:n})}e=e.parentElement}return t}_selectParsedOrFocusedDate(){if(this._ignoreFocusedDateChange=!0,this.i18n.parseDate){let e=this._inputStartValue||``,t=this._getParsedDate(e);this._isValidDate(t)?(this._selectedStartDate<t||this._selectedStartDate>t)&&(this._selectedStartDate=t):(this.__keepInputValue=!0,this._selectedStartDate=null,this.__keepInputValue=!1)}else this._focusedDate&&(this._selectedStartDate=this._focusedDate);if(this.i18n.parseDate){let e=this._inputEndValue||``,t=this._getParsedDate(e);this._isValidDate(t)?this._selectedEndDate=t:(this.__keepInputValue=!0,this._selectedEndDate=null,this.__keepInputValue=!1)}else this._focusedDate&&(this._selectedEndDate=this._focusedDate);this._ignoreFocusedDateChange=!1}_onOverlayClosed(){this._ignoreAnnounce=!0,window.removeEventListener(`scroll`,this._boundOnScroll,!0),this.removeEventListener(`iron-resize`,this._boundUpdateAlignmentAndPosition),this._touchPrevented&&=(this._touchPrevented.forEach(e=>e.element.style.webkitOverflowScrolling=e.oldInlineValue),[]),this.updateStyles(),this._selectParsedOrFocusedDate(),this._nativeInput&&this._nativeInput.selectionStart&&(this._nativeInput.selectionStart=this._nativeInput.selectionEnd),this.value||(this.validateStart(),this.validateEnd())}validateStart(){return!(this.invalid=!this.checkStartValidity(this._inputStartValue))}validateEnd(){return!(this.invalid=!this.checkEndValidity(this._inputEndValue))}checkStartValidity(){let e=!this._inputStartValue||this._selectedStartDate&&this._inputStartValue===this._getFormattedDate(this.i18n.formatDate,this._selectedStartDate),t=!this._selectedStartDate||us(this._selectedStartDate,this._minDate,this._maxDate),n=!0;return this._inputStartElement&&(this._inputStartElement.checkValidity?(this._inputStartElement.__forceCheckValidity=!0,n=this._inputStartElement.checkValidity(),this._inputStartElement.__forceCheckValidity=!1):this._inputStartElement.validate&&(n=this._inputStartElement.validate())),e&&t&&n}checkEndValidity(){let e=!this._inputEndValue||this._selectedEndDate&&this._inputEndValue===this._getFormattedDate(this.i18n.formatDate,this._selectedEndDate),t=!this._selectedEndDate||us(this._selectedEndDate,this._minDate,this._maxDate),n=!0;return this._inputEndElement&&(this._inputEndElement.checkValidity?(this._inputEndElement.__forceCheckValidity=!0,n=this._inputEndElement.checkValidity(),this._inputEndElement.__forceCheckValidity=!1):this._inputEndElement.validate&&(n=this._inputEndElement.validate())),e&&t&&n}removePreselectionById(e){var t=()=>{this.opened&&this._overlayContent.removePreselectionById(e),this.$.overlay.removeEventListener(`vaadin-overlay-open`,t)};this.$.overlay.addEventListener(`vaadin-overlay-open`,t)}_onScroll(e){(e.target===window||!this._overlayContent.contains(e.target))&&this._updateAlignmentAndPosition()}_focusStart(){this._noInput?this._overlayInitialized&&this._overlayContent.focus():this._inputStartElement.focus()}_focusEnd(){this._noInput?this._overlayInitialized&&this._overlayContent.focus():this._inputEndElement.focus()}_clearStartTextField(e){e.detail.sourceEvent.__fromClearButton&&this._inputStartElement.clear()}_focusAndSelect(){this._focus(),this._setSelectionRange(0,this._inputValue.length)}_applyStartInputValue(e){this._inputStartValue=e?this._getFormattedDate(this.i18n.formatDate,e):``}_applyEndInputValue(e){this._inputEndValue=e?this._getFormattedDate(this.i18n.formatDate,e):``}_getFormattedDate(e,t){return e(fs(t))}_setSelectionRange(e,t){this._nativeInput&&this._nativeInput.setSelectionRange&&this._nativeInput.setSelectionRange(e,t)}_onClick(e){this._isClearButton(e)||this._onHostClick(e)}_onHostClick(e){(!this.autoOpenDisabled||this._noInput)&&(e.preventDefault(),this.open())}_eventKey(e){for(var t=[`down`,`up`,`enter`,`esc`,`tab`],n=0;n<t.length;n++){var r=t[n];if(ss.keyboardEventMatchesKeys(e,r))return r}}_isValidDate(e){return e&&!isNaN(e.getTime())}_onKeydown(e){switch(this._noInput&&[9].indexOf(e.keyCode)===-1&&e.preventDefault(),this._eventKey(e)){case`down`:case`up`:e.preventDefault(),this.opened?(this._overlayContent.focus(),this._overlayContent._onKeydown(e)):(this._focusOverlayOnOpen=!0,this.open());break;case`enter`:if(this.shadowRoot.activeElement===this._inputEndElement.inputElement&&(this._selectingStartDate=!1),this._selectingStartDate){let e=this._getParsedDate(this._inputStartValue),t=this._isValidDate(e);if(this.opened)this._overlayInitialized&&this._overlayContent.focusedDate&&t&&(this._selectedStartDate=this._overlayContent.focusedDate),this.close();else if(!t&&this._inputStartElement.value!==``)this.validateStart();else{let e=this.value;this._selectParsedOrFocusedDate(),e===this.value&&this.validateStart()}}else{let e=this._getParsedDate(this._inputEndValue),t=this._isValidDate(e);if(this.opened)this._overlayInitialized&&this._overlayContent.focusedDate&&t&&(this._selectedEndDate=this._overlayContent.focusedDate),this.close();else if(!t&&this._inputEndElement.value!==``)this.validateEnd();else{let e=this.value;this._selectParsedOrFocusedDate(),e===this.value&&this.validateEnd()}}break;case`esc`:this.opened?(this._focusedDate=this._selectedStartDate,this._close()):this.autoOpenDisabled?(this._inputStartElement.value===``&&(this._selectedStartDate=null),this._applyStartInputValue(this._selectedStartDate),this._inputEndElement.value===``&&(this._selectedEndDate=null),this._applyInputEndValue(this._selectedEndDate)):(this._focusedDate=this._selectedStartDate,this._selectParsedOrFocusedDate());break;case`tab`:if(this.shadowRoot.activeElement===this._inputStartElement.inputElement){if(e.shiftKey)this.close(),this.blur();else{let t=this._getParsedDate(this._inputStartValue);this._isValidDate(t)&&(this._selectedStartDate=t),e.preventDefault(),this._selectingStartDate=!1,this._inputEndElement.focus()}}else if(this.shadowRoot.activeElement===this._inputEndElement.inputElement){if(e.shiftKey){let t=this._getParsedDate(this._inputEndValue);this._isValidDate(t)&&(this._selectedEndDate=t),e.preventDefault(),this._selectingStartDate=!0,this._inputStartElement.focus()}else this.close()}}}_getParsedDate(e=this._inputStartValue){let t=this.i18n.parseDate&&this.i18n.parseDate(e);return t&&this._parseDate(t.year+`-`+(t.month+1)+`-`+t.day)}_onUserInputStart(e){!this.opened&&this._inputStartElement.value&&!this.autoOpenDisabled&&this.open(),this._userInputStartValueChanged(),e.__fromClearButton&&(this.validateStart(),this.__dispatchChange=!0,this.value=`;`,this.__dispatchChange=!1)}_onUserInputEnd(e){!this.opened&&this._inputEndElement.value&&!this.autoOpenDisabled&&this.open(),this._userInputEndValueChanged(),e.__fromClearButton&&(this.validateEnd(),this.__dispatchChange=!0,this.value=`;`,this.__dispatchChange=!1)}_userInputStartValueChanged(e){if(this.opened&&this._inputStartValue){let e=this._getParsedDate(this._inputStartValue);this._isValidDate(e)&&(this._ignoreFocusedDateChange=!0,$(e,this._focusedDate)||(this._focusedDate=e),this._ignoreFocusedDateChange=!1)}}_userInputEndValueChanged(e){if(this.opened&&this._inputEndValue){let e=this._getParsedDate(this._inputEndValue);this._isValidDate(e)&&(this._ignoreFocusedDateChange=!0,$(e,this._focusedDate)||(this._focusedDate=e),this._ignoreFocusedDateChange=!1)}}_announceFocusedDate(e,t,n){t&&!n&&this._overlayContent.announceFocusedDate()}},ys=class extends i(Wo(o(vs(R(A))))){static get template(){return k`
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
    `}static get is(){return`vcf-date-range-picker`}static get version(){return`6.0.0`}static get properties(){return{clearButtonVisible:{type:Boolean,value:!1},disabled:{type:Boolean,value:!1,reflectToAttribute:!0},errorMessage:String,placeholder:String,endPlaceholder:String,helperText:String,helperEndText:String,readonly:{type:Boolean,value:!1,reflectToAttribute:!0},hideSidePanel:{type:Boolean,value:!1,reflectToAttribute:!0},hideTextFields:{type:Boolean,value:!1,reflectToAttribute:!0},invalid:{type:Boolean,reflectToAttribute:!0,notify:!0,value:!1},_classNamesForDates:{type:Object,value:{},notify:!0},_userInputStartValue:String,_userInputEndValue:String}}static get observers(){return[`_userInputStartValueChanged(_userInputStartValue)`,`_userInputEndValueChanged(_userInputEndValue)`,`_setClearButtonLabel(i18n.clear)`]}ready(){super.ready(),ga(this,()=>this._inputStartElement.validate=()=>{}),ga(this,()=>this._inputEndElement.validate=()=>{}),this._inputStartElement.addEventListener(`change`,e=>{this._inputStartElement.value===``&&!e.__fromClearButton&&(this.__dispatchChange=!0)}),this._inputEndElement.addEventListener(`change`,e=>{this._inputEndElement.value===``&&!e.__fromClearButton&&(this.__dispatchChange=!0)});let e=this;new ResizeObserver(t=>{requestAnimationFrame(()=>{for(let r of t)if(r.contentBoxSize){var n=e.shadowRoot.host.offsetWidth;e._inputStartElement.shadowRoot.querySelector(`[part="label"]`).setAttribute(`style`,`width: `+n+`px; max-width: max-content; overflow: hidden;`),e._inputStartElement.shadowRoot.querySelector(`[part="error-message"]`).setAttribute(`style`,`width: `+n+`px; max-width: max-content; overflow: hidden;`)}})}).observe(this)}setClassNameForDates(e,t){var n=JSON.parse(JSON.stringify(this._classNamesForDates));n[e]=t,this._classNamesForDates=n}_openedChanged(e){super._openedChanged(e),this.$.overlay.positionTarget=this.shadowRoot.querySelector(`[part="input-field"]`),this.$.overlay.noVerticalOverlap=!0}_onVaadinOverlayClose(e){if(this._openedWithFocusRing&&this.hasAttribute(`focused`)?this.focusElement.setAttribute(`focus-ring`,``):this.hasAttribute(`focused`)||this.focusElement.blur(),e.detail.sourceEvent&&e.detail.sourceEvent.composedPath().indexOf(this)!==-1&&e.preventDefault(),this._cancelled){this._cancelled=!1;let e=this._parseDate(this._extractStartDate(this.value)),t=this._parseDate(this._extractEndDate(this.value));this._selectedStartDate=e,this._selectedEndDate=t}else this._selectedStartDate&&this._selectedEndDate&&(this._selectedStartDate>=this._selectedEndDate&&(this._selectedEndDate=null),this.value=this._formatISO(this._selectedStartDate)+`;`+this._formatISO(this._selectedEndDate))}_toggle(e){e.stopPropagation(),this[this._overlayInitialized&&this.$.overlay.opened?`close`:`open`]()}_inputStart(){return this.$.startInput}_inputEnd(){return this.$.endInput}set _inputStartValue(e){this._inputStartElement.value=e}get _inputStartValue(){return this._inputStartElement.value}set _inputEndValue(e){this._inputEndElement.value=e}get _inputEndValue(){return this._inputEndElement.value}_getAriaExpanded(e){return(!!e).toString()}get focusElement(){return this.shadowRoot.activeElement||this._inputStart()||this}_setClearButtonLabel(e){let t=this._inputStartElement.shadowRoot.querySelector(`[part="clear-button"]`);t&&t.setAttribute(`aria-label`,e)}};customElements.define(ys.is,ys),window.Vaadin.DateRangePickerElement=ys;