/* Copyright (c) 2026, Oracle and/or its affiliates */

define('app-flow',['oj-sp/spectra-shell/config/config'], function() {
  'use strict';

  class AppModule {
  }

  return AppModule;
});


define('text!app-flow.json',[],function () { return '{"id":"starter","description":"Starter VB app","defaultPage":"shell","routerStrategy":"path","chains":{},"configuration":{"profile":"%{env.profileId}%"},"requirejs":{"paths":{"oj-sp":"https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0","oj-dynamic":"https://static.oracle.com/cdn/jet/packs/oj-dynamic/2604.1.0/min"},"bundles":{"oj-sp/oj-sp-component-bundle":["oj-sp/advanced-create-edit/loader","oj-sp/analytics-canvas/loader","oj-sp/activity-list-item/loader","oj-sp/attachment-chip/loader","oj-sp/attachment-chip-actions/actions/AttachmentChipActions","oj-sp/attachment-chip-actions/public/BossPublicAttachmentChipActions","oj-sp/attachments-common/private/AttachmentManager","oj-sp/attachments-common/private/ComponentUtils","oj-sp/attachments-common/public/AttachmentPublic","oj-sp/attachments-simple/loader","oj-sp/attachments-viewer/loader","oj-sp/attachments/loader","oj-sp/attachments-2/loader","oj-sp/attachments-2-actions/actions/AttachmentActions","oj-sp/attachments-2-actions/view/BossAttachmentsView","oj-sp/attachments-2-actions/view/BossAttachmentsViewType","oj-sp/attachments-2-actions/public/BossPublicAttachmentActions","oj-sp/attachments-2-actions/public/BossPublicAttachmentsView","oj-sp/attachments-2-actions/public/BossPublicDeferredAttachmentActions","oj-sp/attachments-2-actions/transaction/BossDeferredAttachmentTransactionType","oj-sp/bottom-drawer-template/loader","oj-sp/calendar/loader","oj-sp/canvas-page/loader","oj-sp/card/loader","oj-sp/card-footer/loader","oj-sp/collection-container/loader","oj-sp/collection-container-advanced/loader","oj-sp/collection-detail-page/loader","oj-sp/collection-toolbar/loader","oj-sp/common-strings/resources/nls/common-component-strings","oj-sp/common-util/flex-util","oj-sp/common-util/select-smart-dyn-forms-helper","oj-sp/common-util/TelemetryUtil","oj-sp/common/EventDispatcher","oj-sp/common/action","oj-sp/common/activitystreamutils","oj-sp/common/avatarinfo","oj-sp/common/badge","oj-sp/common/contextualinfo","oj-sp/common/footertext","oj-sp/common/flex/util/kffpartialutils","oj-sp/common/snapping","oj-sp/common/touch-velocity","oj-sp/common/iconinfo","oj-sp/common/imageinfo","oj-sp/common/positionmanager","oj-sp/common/PreviousNextIterator","oj-sp/common/timelineEventTemplateUtils","oj-sp/common/collectionDetailPageUtils","oj-sp/completion-panel/loader","oj-sp/condition-builder/loader","oj-sp/create-edit-drawer-template/loader","oj-sp/dashboard-grid/loader","oj-sp/dashboard-landing-page/loader","oj-sp/data-authoring-page/loader","oj-sp/data-management-page/loader","oj-sp/dashboard-panel/loader","oj-sp/data-provider/AggregateSearchDataProvider","oj-sp/data-provider/AggregateSearchOpenApiTransforms","oj-sp/data-provider/AggregateSearchTransforms","oj-sp/data-provider/AutocompleteSearchTransforms","oj-sp/data-provider/BaseKeysHash","oj-sp/data-provider/CompareUtils","oj-sp/data-provider/DataProviderBindingContext","oj-sp/data-provider/DataProviderUtils","oj-sp/data-provider/KeysHashMap","oj-sp/data-provider/KeysHashSet","oj-sp/data-provider/RecentSearchesTransforms","oj-sp/data-provider/SmartSearchAndFilterDataProvider","oj-sp/data-provider/SmartSearchAndFilterTransforms","oj-sp/data-provider/SmartSuggestionChipsDataProvider","oj-sp/data-provider/SuggestionFiltersDataProvider","oj-sp/data-provider/SuggestionFiltersTransforms","oj-sp/detail-panel/loader","oj-sp/data-switcher/loader","oj-sp/diagram-builder/loader","oj-sp/diagram-node/loader","oj-sp/diagram-node/diagram-node-utils","oj-sp/dynamic-dashboard-grid/loader","oj-sp/dynamic-foldout-page/loader","oj-sp/dynamic-scoreboard/loader","oj-sp/email-address-chip/loader","oj-sp/emo-button/loader","oj-sp/empty-state/loader","oj-sp/expandable-list-item/loader","oj-sp/expanded-hover-card/loader","oj-sp/filter-chip/loader","oj-sp/fishbone-lab-diagram/loader","oj-sp/flex-filter-chip/loader","oj-sp/flex-switch/loader","oj-sp/foldout-layout/loader","oj-sp/foldout-panel/loader","oj-sp/foldout-panel-overflow/loader","oj-sp/foldout-panel-summarizing/loader","oj-sp/general-drawer-template/loader","oj-sp/general-overview-page/loader","oj-sp/group-list-item-header/loader","oj-sp/group-list-item-parent/loader","oj-sp/group-list-item-child/loader","oj-sp/guided-process/loader","oj-sp/guided-process-drawer-template/loader","oj-sp/header-create-edit-2/loader","oj-sp/header-create-edit/loader","oj-sp/header-general-overview-2/loader","oj-sp/header-general-overview/loader","oj-sp/header-navigation/loader","oj-sp/header-welcome-banner/loader","oj-sp/hierarchy-card/loader","oj-sp/hierarchy-card-info/loader","oj-sp/hierarchy-viewer/loader","oj-sp/horizontal-overview/loader","oj-sp/image-card/loader","oj-sp/image/loader","oj-sp/in-app-navigation/loader","oj-sp/input-address/loader","oj-sp/input-currency-conversion-rate/loader","oj-sp/input-currency/loader","oj-sp/input-email/loader","oj-sp/input-key-flex-field/loader","oj-sp/input-phone-number/loader","oj-sp/input-url/loader","oj-sp/item-overview-page/loader","oj-sp/item-overview/loader","oj-sp/list-item-template/loader","oj-sp/list-section/loader","oj-sp/map/loader","oj-sp/media-section/loader","oj-sp/message-banner-unsaved-changes/loader","oj-sp/message-dialog-destructive/loader","oj-sp/messages-toast/loader","oj-sp/metric-card/loader","oj-sp/mini-card/loader","oj-sp/network-flow-diagram/loader","oj-sp/object-card/loader","oj-sp/overflow/loader","oj-sp/preview-card/loader","oj-sp/primary-action-feedback/loader","oj-sp/profile-card/loader","oj-sp/recommendation-card/loader","oj-sp/scoreboard/loader","oj-sp/scoreboard-metric-card/loader","oj-sp/section/loader","oj-sp/section-edit/loader","oj-sp/select-single-currency/loader","oj-sp/select-single-item-template/loader","oj-sp/selection-chart-card/loader","oj-sp/simple-create-edit/loader","oj-sp/skill-chip/loader","oj-sp/smart-filter-search/loader","oj-sp/smart-search/loader","oj-sp/smart-search/default-filters/KeywordFilter","oj-sp/smart-search/default-filters/ToggleFilter","oj-sp/smart-search/default-filters/NumericRangeFilter","oj-sp/smart-search/default-filters/DateRangeFilter","oj-sp/smart-search/default-filters/SelectSingleFilter","oj-sp/smart-search/default-filters/SelectMultipleFilter","oj-sp/smart-search/default-filters/BigNumericRangeFilter","oj-sp/smart-search/strategies/BossSearchStrategyFactory","oj-sp/smart-search/strategies/JsonSearchConfigProviderFactory","oj-sp/smart-search/strategies/BookmarkableTokenBuilder","oj-sp/smart-search-page/loader","oj-sp/smart-filters/loader","oj-sp/smart-select-single/loader","oj-sp/summarizing-collection/loader","oj-sp/task-card/loader","oj-sp/task-organizer-page/loader","oj-sp/thumbnail/loader","oj-sp/timeline-event-template/loader","oj-sp/timestamp/loader","oj-sp/vertical-overview/loader","oj-sp/vertical-anchor-navigator/loader","oj-sp/welcome-page/loader","oj-sp/timestamp/loader","oj-sp/flex-checkbox/loader","oj-sp/item-gauge/loader","oj-sp/common/flex/converters/FlexUpperCaseConverter","oj-sp/converters/phone/E164Converter","oj-sp/information-organizer/loader","oj-sp/internal-resources/components/collection-toolbars/loader","oj-sp/internal-resources/components/color-thief/color-thief","oj-sp/internal-resources/components/expandable-panel/loader","oj-sp/output-rich-text/loader","oj-sp/visual-space-page/loader"],"oj-sp/spectra-shell/oj-sp-shell-bundle":["oj-sp/about-page/loader","oj-sp/ask-oracle-navigation-list/loader","oj-sp/ask-oracle-notifications/loader","oj-sp/ask-oracle-search/loader","oj-sp/ask-oracle-user-profile/loader","oj-sp/ask-oracle/loader","oj-sp/ask-oracle-coach-mark/loader","oj-sp/common-strings/resources/nls/common-shell-strings","oj-sp/common-util/common-util","oj-sp/common-util/mobileVerticalSwipeHandler","oj-sp/common-util/fa-public-utils","oj-sp/css-additions/loader","oj-sp/fa-css/fa-css","oj-sp/global-header/loader","oj-sp/global-user-menu/loader","oj-sp/navigator/loader","oj-sp/notifications/loader","oj-sp/pillar-theme/loader","oj-sp/simple-ui-shell/loader","oj-sp/ux-image-gallery/loader","oj-sp/sandbox-banner/loader","oj-sp/ask-oracle-splash-screen/loader","oj-sp/ask-oracle-product-map/loader","oj-sp/message-dialog-general/loader","oj-sp/messages-banner/loader","oj-sp/message-unsaved-changes/loader","oj-sp/notification-subscription-dialog/loader"],"oj-sp/oj-sp-chat-component-bundle":["oj-sp/chat-message-block/loader","oj-sp/chat-container/loader","oj-sp/chat-text/loader","oj-sp/chat-input/loader","oj-sp/chat-card/loader","oj-sp/chat-action/loader","oj-sp/chat-element/loader","oj-sp/chat-attachment-message/loader","oj-sp/common/chat"],"oj-sp/oj-sp-input-rich-text-bundle":["oj-sp/input-rich-text-2/loader"]}},"services":{},"translations":{"appBundle":{"path":"./resources/strings/appBundle/nls/appBundle-strings"}},"types":{},"constants":{"mateuBaseUrl":{"type":"string","defaultValue":"","description":"Backend Mateu (demo-front-office-evolution :8595; front-office compartido :8594; demo-vb :9005 — punto único de cambio)"},"mateuBundleUrl":{"type":"string","defaultValue":"","description":"Static bundle (modo sin backend): URL del manifest.json (build-time mateu:bundle o runtime GET /mateu/v3/bundle). Vacío = desactivado (todo va al backend). Si se pone, las cargas de ruta se responden desde el bundle."}},"variables":{"mateuRegistry":{"type":"any","defaultValue":{"contexts":{},"stack":[],"shell":null},"description":"El registro del bridge (contexts/stack/shell) — scope de aplicación para sobrevivir a la navegación"},"mateuNavItems":{"type":"any","defaultValue":[],"description":"shell.menu proyectado a items de oj-sp-in-app-navigation ({id: route, label, icon})"},"mateuSelectedRoute":{"type":"string","defaultValue":""},"mateuHostTitle":{"type":"string","defaultValue":""},"mateuHostText":{"type":"string","defaultValue":""},"mateuFormMetadata":{"type":"any","description":"FormFields del host proyectados a metadata de oj-dyn-form (null = página sin form)"},"mateuFormValue":{"type":"any"},"mateuFormFieldsList":{"type":"any","defaultValue":[],"description":"FormFields del host como lista para el switch widgetFor (isText/isNumber/isBoolean precomputados)"},"mateuFormActions":{"type":"any","defaultValue":[]},"mateuListing":{"type":"any","description":"proyección del Crud del host (título, columnas, total, emptyStateMessage; null = no es un listado)"},"mateuListingRows":{"type":"any","defaultValue":[],"description":"las filas (data.crud.page.content) — el ADP de la página las envuelve"},"mateuDrawerOpen":{"type":"boolean","defaultValue":false},"mateuAppState":{"type":"any","defaultValue":{},"description":"contexto de aplicación (@AppContext) — viaja como appState en CADA request"},"mateuContextSelectors":{"type":"any","defaultValue":[],"description":"selectores @AppContext ({fieldName, label, value, options}) para el header"},"mateuHeaderActions":{"type":"any","defaultValue":[],"description":"acciones de cabecera (AppActionsSupplier): hoja o dropdown con hijos"},"mateuShellSST":{"type":"string","defaultValue":"","description":"serverSideType del App — las acciones de cabecera se despachan app-level con él"},"mateuShellLogo":{"type":"string","defaultValue":"","description":"URL absoluta del logo del @App (mateuBaseUrl + AppDto.logo) — marca en el header"},"mateuWelcomeTrendItems":{"type":"any","defaultValue":[],"description":"items precomputados del chart de la welcome (welcome.trend.items) para el ADP del oj-chart"},"mateuFoldoutContent":{"type":"any","defaultValue":{"overview":{"blocks":[]},"panels":[]},"description":"CONTENIDO vivo del foldout (bloques por panel + subtítulos): se reasigna en cada repaint del host; la ESTRUCTURA (mateuFoldout) se estampa una sola vez — el motor del foldout come los anclajes del for-each de paneles al re-stampar"},"mateuDrawer":{"type":"any","defaultValue":{"title":"","fields":[],"actions":[],"blocks":[],"state":{},"texts":[]},"description":"proyección del overlay superior (drawer): título + campos + acciones + bloques display (PaymentPicker, AddOnPicker, grids…)"},"mateuMenuTree":{"type":"any","defaultValue":[],"description":"menú jerárquico para el oj-menu de la hamburguesa (children con rutas TERMINALES)"},"mateuMenuTabs":{"type":"boolean","defaultValue":false,"description":"variante TABS: in-app navigation inferior"},"mateuMenuTopbar":{"type":"boolean","defaultValue":false,"description":"variante MENU_ON_TOP: opciones de primer nivel visibles en el header"},"mateuMenuDrawerMode":{"type":"boolean","defaultValue":false,"description":"variante HAMBURGUER_MENU/TILES: hamburguesa que abre el navigator-drawer izquierdo"},"mateuNavDrawerOpen":{"type":"boolean","defaultValue":false},"mateuFoldout":{"type":"any","description":"proyección del FoldoutLayout (overview + paneles con textos); null = no es un foldout"},"mateuWizard":{"type":"any","description":"proyección del wizard ({steps,currentStep} para el guided-process); null = no es un wizard"},"mateuWizardForwardId":{"type":"string","defaultValue":"","description":"actionId de avance del paso (next/confirm) — lo dispara el Continue del guided-process"},"mateuWizardPrimary":{"type":"any","description":"primaryAction del guided-process en el último paso del tren ({label} de confirm); null en el resto"},"mateuWizardStarted":{"type":"boolean","defaultValue":false,"description":"false = mostrando el OVERVIEW del guided-process (currentStep vacío); el primer Continue arranca"},"mateuWizardShownStep":{"type":"string","defaultValue":"","description":"current-step efectivo del guided-process (\'\' = overview)"},"mateuHomeRoute":{"type":"string","defaultValue":"","description":"primera hoja del menú — destino del Cancel del guided-process"},"mateuIsland":{"type":"any","description":"proyección de la isla embebida ({fields, actions}); null = la página no tiene isla"},"mateuIslandId":{"type":"string","defaultValue":"","description":"contextId de la isla (id de la frontera ServerSide, p.ej. _guestNote)"},"mateuDirty":{"type":"boolean","defaultValue":false,"description":"hay edición local sin guardar (borradores) — la navegación pide confirmación (dirtyGuard 1.5)"},"mateuPageMaxWidth":{"type":"string","defaultValue":"1408px"},"mateuPageMargin":{"type":"string","defaultValue":"0 auto"},"mateuPagePadding":{"type":"string","defaultValue":"24px"},"mateuBannerKeys":{"type":"any","defaultValue":[],"description":"keys de los banners mostrados (para retirarlos al navegar)"},"mateuWelcome":{"type":"any","description":"proyección del arquetipo Welcome (hero + CTAs + tiles)"},"mateuOverview":{"type":"any","description":"proyección del General Overview (switcher + header + cards)"},"mateuItemOv":{"type":"any","description":"proyección del Item Overview (key info + tabs)"},"mateuOverviewOptions":{"type":"any","defaultValue":[],"description":"opciones del switcher de registro"},"mateuItemTabTexts":{"type":"any","defaultValue":[],"description":"textos del tab seleccionado del item overview"},"mateuOverviewTranslations":{"type":"any","defaultValue":{"goToParent":""},"description":"el título de página se integra como \'parent page\' del header Redwood"},"mateuListPrimary":{"type":"any","defaultValue":{"label":"","display":"off"},"description":"primaryAction del header de colección (New) — nunca null"},"mateuListPrimaryId":{"type":"string","defaultValue":""},"mateuListSecondary":{"type":"any","defaultValue":[],"description":"secondaryActions del header de colección (Delete…)"},"mateuPageHeader":{"type":"any","defaultValue":{"title":"","subtitle":"","facts":[],"showBand":false,"showInline":false,"showListBand":false,"showListInline":false,"primary":{"label":"","display":"off"},"primaryId":"","secondary":[],"toolbar":[]},"description":"header genérico: SIEMPRE objeto (asignar null revienta los bindings internos .title antes de que el bind-if colapse) — flags showBand/showInline precomputados"},"mateuShellPageLayout":{"type":"string","defaultValue":"fixedWidth","description":"pageLayout de oj-sp-simple-ui-shell derivado del pageWidth del wire (fixed→fixedWidth)"},"mateuQueue":{"type":"any","defaultValue":null,"description":"TaskQueue del host (cola de trabajo front-office) — grupos de cards con badges"},"mateuHostEmpty":{"type":"any","defaultValue":null,"description":"EmptyState suelto del host (placeholder del panel de detalle)"},"mateuNested":{"type":"any","defaultValue":null,"description":"isla ANIDADA (App dentro de la isla, p.ej. el documento del check-in): átomos display aplanados"},"mateuNestedId":{"type":"string","defaultValue":""},"mateuNestedSeed":{"type":"string","defaultValue":"","description":"JSON del initialData con el que se cargó la anidada — si cambia (p.ej. selectPax), recarga"},"mateuBand":{"type":"any","defaultValue":null,"description":"banda RDS del header (fixed/fullWidth): fondo a sangre detrás del header que asoma tras el arranque del contenido"},"mateuBandBoxMargin":{"type":"string","defaultValue":"0 auto","description":"margen de la caja interior de la banda (la fórmula horizontal del contenido, sin el solape)"},"mateuHostContent":{"type":"any[]","defaultValue":[],"description":"bloques display del HOST (páginas de detalle standalone: encasa/checkout)"},"mateuWizardContent":{"type":"any[]","defaultValue":[],"description":"bloques display de los pasos del wizard standalone (sin título/rail/back-next: los pone el guided process)"},"mateuIslandSeed":{"type":"string","defaultValue":""},"mateuGop":{"type":"any","defaultValue":{"on":false,"main":{"title":"","blocks":[]},"info":{"title":"","blocks":[]}},"description":"general overview nativo: on + bloques de los slots main/info"},"mateuQuickFilter":{"type":"any","defaultValue":{},"description":"selector rápido del listado activo: {fieldId, value} ({} = sin filtro)"},"mateuLastSearchText":{"type":"string","defaultValue":"","description":"último texto buscado en el smart search (para re-buscar al togglear chips)"},"mateuQuickFilterPending":{"type":"boolean","defaultValue":false,"description":"una vista rápida del Ask Oracle dejó el filtro puesto: onMateuNavigate lo aplica en vez de resetearlo"},"mateuWelcomeTheme":{"type":"string","defaultValue":"auto","description":"tono del hero de la welcome (rota en cada visita entre la paleta oscura RDS)"},"mateuWelcomeImage":{"type":"string","defaultValue":"pebbles","description":"imagen temática del hero de la welcome (rota junto al tono)"},"mateuWelcomeIllu":{"type":"string","defaultValue":"https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/illust-welcome-banner-fg-01.png","description":"ilustración del hero de la welcome (la abstract RDS del propio banner)"},"mateuWelcomeIlluBg":{"type":"string","defaultValue":"https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/illust-welcome-banner-bg-01.png","description":"capa de fondo de la ilustración del hero (galería oficial fnd)"},"mateuBusy":{"type":"boolean","defaultValue":false,"description":"hay una peticion al backend en vuelo (lo pone el transporte via setTransportHooks)"},"mateuOffline":{"type":"boolean","defaultValue":false,"description":"el backend no es alcanzable; sostiene la banda de sin-conexion mientras dure"},"mateuLastError":{"type":"string","defaultValue":"","description":"ultimo fallo de transporte YA TRADUCIDO a lenguaje de usuario (classifyRequestFailure)"}},"userConfig":{"type":"vb/DefaultSecurityProvider","configuration":{"idcsInfo":"#{env.idcsInfo}#","url":"%{env.userProfileUrl}%","oauthUrl":"%{env.oauthUserProfileUrl}%"},"embedding":"deny"},"security":{"access":{"requiresAuthentication":false}},"flows":{},"settings":{"stopValidationPreLoading":true},"events":{"mateuNavigate":{"payloadType":{"route":"string"},"description":"Efecto NavigateTo del bridge: la shell (que posee el menú) carga la ruta"},"spShowToast":{"payloadType":{"message":"string"},"description":"Fire this event with an acknowledgement message to indicate to user that an operation was successful. The shell page will render the message using oj-sp-messages-toast component."},"mateuRetryAction":{"description":"reintento de una accion que fallo: la banda de error de la shell la reenvia a la pagina de contenido, que es quien sabe ejecutarla","payloadType":{"actionId":"string","parameters":"any"}}}}';});

/* Copyright (c) 2026, Oracle and/or its affiliates */

define('flows/main/main-flow',[], function() {
  'use strict';

  class FlowModule {
  }

  return FlowModule;
});


define('text!flows/main/main-flow.json',[],function () { return '{"id":"main","description":"Flow main","defaultPage":"main-start","chains":{},"services":{},"types":{},"variables":{}}';});

/* AddOnPicker: toggle de un extra — contrato del renderer web compartido
 * (mateu-addon-picker.ts): actionId con parameters {_item, _added, _total}, donde _total
 * es la suma cliente de los extras añadidos TRAS el toggle. */

define('flows/main/pages/main-start-page-chains/addonToggled',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class addonToggled extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event   value-changed del oj-switch de la fila
     * @param {string} params.itemId  id del extra
     */
    async run(context, { event, itemId }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // re-stamp de la plantilla, no un toggle del usuario
      }
      const island = $application.variables.mateuIsland;
      const blocks = (island && island.content) || [];
      let picker = null;
      for (const block of blocks) {
        picker = (block.items || []).find((a) => a.isAddOns) || picker;
      }
      if (!picker || itemId == null) {
        return;
      }
      const added = !!detail.value;
      const total = (picker.items || []).reduce((sum, it) => {
        const isThis = it.id === itemId;
        const nowAdded = isThis ? added : it.added;
        return sum + (nowAdded ? (it.price || 0) : 0);
      }, 0);
      await Actions.callChain(context, {
        chain: 'runMateuIslandAction',
        params: {
          actionId: picker.actionId,
          parameters: { _item: itemId, _added: added, _total: total },
        },
      });
    }
  }

  return addonToggled;
});

/* Dispatcher de los bloques display del HOST (detalle standalone / pasos del wizard):
 * los átomos normales despachan contra el HOST (runMateuAction) y los fusionados desde
 * la isla del host (fromNested — p.ej. el documento del check-in) contra su contexto de
 * isla (runMateuIslandAction). */

define('flows/main/pages/main-start-page-chains/dispatchHostBlockAction',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class dispatchHostBlockAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     * @param {boolean} params.fromNested
     */
    async run(context, { actionId, parameters, fromNested }) {
      await Actions.callChain(context, {
        chain: fromNested ? 'runMateuIslandAction' : 'runMateuAction',
        params: { actionId, parameters },
      });
    }
  }

  return dispatchHostBlockAction;
});

/* Dispatcher de acciones de los bloques display: los átomos de la isla madre despachan
 * contra su contexto (runMateuIslandAction) y los fusionados desde la isla ANIDADA
 * (marcados fromNested en la proyección) contra el contexto anidado. */

define('flows/main/pages/main-start-page-chains/dispatchIslandAction',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class dispatchIslandAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     * @param {boolean} params.fromNested
     */
    async run(context, { actionId, parameters, fromNested }) {
      await Actions.callChain(context, {
        chain: fromNested ? 'runMateuNestedAction' : 'runMateuIslandAction',
        params: { actionId, parameters },
      });
    }
  }

  return dispatchIslandAction;
});

/* Acción SECUNDARIA del header genérico de banda: el detail trae el item (por label) —
 * se resuelve contra el toolbar de Page proyectado y se despacha contra el HOST. */

define('flows/main/pages/main-start-page-chains/headerSecondaryAction',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class headerSecondaryAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSecondaryAction ({detail: {secondaryItem}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      // el header identifica el item por su id/value (los actionId que estampamos) o,
      // en variantes viejas, por label — resolver por ambos
      const key = detail.secondaryItem && detail.secondaryItem.label
        ? detail.secondaryItem.label
        : (detail.secondaryItem != null ? String(detail.secondaryItem) : '');
      const toolbar = ($application.variables.mateuPageHeader || {}).toolbar || [];
      const match = toolbar.find((b) => b.actionId === key || b.label === key);
      if (!match) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: match.actionId },
      });
    }
  }

  return headerSecondaryAction;
});

/* AddOnPicker en contenido del HOST (p.ej. el paso Extras del wizard standalone): mismo
 * contrato que el renderer web — actionId con {_item, _added, _total} donde _total es la
 * suma cliente tras el toggle. El picker se busca en el contenido del wizard o del host. */

define('flows/main/pages/main-start-page-chains/hostAddonToggled',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class hostAddonToggled extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event   value-changed del oj-switch de la fila
     * @param {string} params.itemId  id del extra
     */
    async run(context, { event, itemId }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      // OJO: [] es truthy — elegir por LONGITUD (en la 360 el wizardContent está vacío)
      const wizardBlocks = $application.variables.mateuWizardContent || [];
      const blocks = wizardBlocks.length
        ? wizardBlocks
        : ($application.variables.mateuHostContent || []);
      let picker = null;
      for (const block of blocks) {
        picker = (block.items || []).find((a) => a.isAddOns) || picker;
      }
      if (!picker || itemId == null) {
        return;
      }
      const added = !!detail.value;
      const total = (picker.items || []).reduce((sum, it) => {
        const nowAdded = it.id === itemId ? added : it.added;
        return sum + (nowAdded ? (it.price || 0) : 0);
      }, 0);
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: {
          actionId: picker.actionId,
          parameters: { _item: itemId, _added: added, _total: total },
        },
      });
    }
  }

  return hostAddonToggled;
});

/* Input de un bloque display del HOST (FormField fluido, p.ej. el buscador de cargos del
 * modo check-out): el valor va al draft (runMateuAction lo fusiona en componentState) y se
 * relanza el auto-save del server (@AutoSave → buscarCargos) — value-changed de oj-input
 * dispara en blur/Enter, que hace de debounce natural. */

define('flows/main/pages/main-start-page-chains/hostInputChanged',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class hostInputChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event
     * @param {string} params.fieldId
     */
    async run(context, { event, fieldId, fromNested }) {
      const { $page } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      if (!fieldId) {
        return;
      }
      // input de la ISLA fusionada (fromNested, p.ej. el editor del documento): su valor
      // va al draft de la isla (runMateuIslandAction lo fusiona en su componentState) y
      // NO relanza el auto-save del host
      if (fromNested) {
        const islandDraft = Object.assign({}, $page.variables.mateuIslandDraft);
        islandDraft[fieldId] = detail.value;
        $page.variables.mateuIslandDraft = islandDraft;
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      draft[fieldId] = detail.value;
      $page.variables.mateuDraft = draft;
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'buscarCargos' },
      });
    }
  }

  return hostInputChanged;
});

/* GENERADO por poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd poc && node test.mjs). */
define('resources/js/mateu-bridge',[], () => {
  'use strict';
  // Renderer de Mateu sobre VB — el NÚCLEO, en JS puro y testeable sin VB.
  // En la app VB estas funciones serían métodos de app-flow.js; aquí son funciones
  // libres para testearlas en Node.
  //
  // v3 (2026-07-24): ajustado al WIRE REAL (fixtures/real/*.json, capturados con capture.mjs
  // contra demo/demo-vb en :9005). Contrato observado:
  //   - Bootstrap del shell: POST {base}/mateu/v3/components/_/action (route '', __load__) → App.
  //     Todo lo demás: POST {base}/mateu/v3/sync/{route|_no_route} con actionId '' para cargas.
  //   - `targetComponentId` es el ECO del `initiatorComponentId` de la request ('' → host), y el
  //     server DERIVA los ids internos del initiator ('crud1' → 'crud1_app', 'crud1_list'): la
  //     unicidad de ids entre superficies es responsabilidad del CLIENTE (un contextId por superficie).
  //   - El estado viaja en `fragment.state`; los overlays (Drawer) llevan `metadata.initialData`.
  //   - Un mediador (crud, isla) llega como ServerSide cuyo child0 es un App (chromeless): su
  //     CONTENIDO se carga con una segunda request con consumedRoute=rootRoute del App interior
  //     + serverSideType=homeServerSideType. `mediatorOf(ctx)` extrae esa info.
  //   - CloseModal lleva data.eventName → hay que emitir el evento del bus (@SubscribeTo);
  //     p.ej. el crud refresca el listado suscrito a 'mateu-crud:saved-in-drawer'.
  //   - Una frontera de isla embebida es un nodo ServerSide interior con id = nombre de campo
  //     ('_guestNote') y initialData con los marcadores (_embeddedMediator/_inline).

  const HOST_ID = '__root__'

  /** Recorrido que NO cruza fronteras de isla: un ServerSide INTERIOR es otra superficie
   *  (sus campos/acciones pertenecen a su propio contexto, no al host). */
  function walkWithinSurface(node, visit) {
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return // frontera de isla: parar
      visit(n)
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(node, true)
  }

  /** Helper de RENDER: recolecta los FormFields de la superficie (sin cruzar islas). */
  function collectFields(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.fieldId) out.push(n) })
    return out
  }

  /** Helper de RENDER: recolecta botones/acciones de la superficie (sin cruzar islas). */
  function collectActions(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.actionId && n.label && !n.fieldId) out.push(n) })
    return out
  }

  /** Fronteras de isla embebida — DOS sabores confirmados en wire real:
   *  (a) nodos ServerSide INTERIORES (id propio, p.ej. '_guestNote');
   *  (b) nodos ClientSide App variant=MEDIATOR con id estable (p.ej.
   *      'island_checkin_st_maria') cuya PROPIA metadata trae homeRoute
   *      (?_embeddedMediator=1) + homeConsumedRoute + homeServerSideType —
   *      el detalle del TaskQueue del front-office llega así. */
  function collectIslands(tree, out = []) {
    const walk = (node, isRoot) => {
      if (!node || typeof node !== 'object') return
      if (!isRoot && node.type === 'ServerSide') {
        out.push(node)
        return // sus hijos pertenecen a la isla, no al host
      }
      if (!isRoot && node.type === 'ClientSide' && node.id && node.metadata
          && node.metadata.type === 'App' && node.metadata.variant === 'MEDIATOR') {
        out.push({
          id: node.id,
          route: node.metadata.homeRoute,
          consumedRoute: node.metadata.homeConsumedRoute || node.metadata.homeRoute,
          serverSideType: node.metadata.homeServerSideType,
          // el CONTEXTO sembrado por el host (stayId, paxIndex…): debe viajar como
          // componentState en la carga inicial de la isla (mateu-ux.initialState)
          initialData: node.initialData || null,
        })
        return
      }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** Helper de RENDER: FormField[] del árbol → metadata de oj-dyn-form (mapa campo → meta).
   *  null si el árbol no tiene campos (página sin formulario). */
  function dynFormMetadataOf(tree) {
    const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
    const metadata = {}
    for (const f of collectFields(tree)) {
      if (!f.dataType || metadata[f.fieldId]) continue // duplicados = referencias de FormRow
      metadata[f.fieldId] = {
        type: NUMERIC.indexOf(f.dataType) >= 0 ? 'number'
          : f.dataType === 'bool' || f.dataType === 'boolean' ? 'boolean' : 'string',
        displayName: f.label || f.fieldId,
        required: !!f.required,
        readonly: !!f.readOnly,
        stereotype: f.stereotype || '',
      }
    }
    return Object.keys(metadata).length ? metadata : null
  }

  /** Helper de RENDER: botones únicos del árbol. chroming viene PRECOMPUTADO (los bindings
   *  VB deben quedar como paths simples: un ternario en un atributo rompe la evaluación CSP
   *  de TODAS las propiedades del elemento). */
  function actionsOf(tree) {
    const seen = {}
    const out = []
    for (const a of collectActions(tree)) {
      if (seen[a.actionId]) continue
      seen[a.actionId] = true
      out.push({
        actionId: a.actionId,
        label: a.label,
        style: a.buttonStyle || 'outlined',
        chroming: a.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        parameters: a.parameters || {},
      })
    }
    return out
  }

  /** Helper de RENDER: lista de campos para el switch widgetFor (isText/isNumber/isBoolean
   *  PRECOMPUTADOS — los bindings VB deben ser paths simples), con el valor sacado del state. */
  function fieldListOf(tree, state) {
    const metadata = dynFormMetadataOf(tree)
    if (!metadata) return []
    const s = state || {}
    return Object.keys(metadata).map((fieldId) => {
      const f = metadata[fieldId]
      const isTextArea = f.stereotype === 'textarea'
      return {
        fieldId,
        label: f.displayName,
        required: f.required,
        readonly: f.readonly,
        isNumber: f.type === 'number',
        isBoolean: f.type === 'boolean',
        isTextArea,
        isText: f.type !== 'number' && f.type !== 'boolean' && !isTextArea,
        value: s[fieldId] == null ? null : s[fieldId],
      }
    })
  }

  /** Proyección del OVERLAY superior del stack (drawer del crud): título + campos + acciones.
   *  null si no hay overlays. Sus acciones se postean contra el HOST (el drawer no lleva
   *  ServerSide propio — confirmado en el wire). */
  function overlayOf(reg) {
    const id = reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    if (!id || !reg.contexts[id]) return null
    const ctx = reg.contexts[id]
    // bloques display del contenido del drawer (ResourceGrid/OfferCard/StatusList…):
    // el panel VB los pinta con el MISMO template de átomos que el host — un drawer no
    // es solo campos y botones (p.ej. el picker de habitaciones)
    // los FormFields del drawer ya los pinta su gramática de CAMPOS (oj-form-layout):
    // fuera los átomos isInput de los bloques o saldrían DUPLICADOS (y el usuario
    // escribiría en el par equivocado)
    // pauta del drawer Redwood: las ACCIONES van en la barra del pie. Un Button del
    // contenido SIN parámetros se mueve al pie (p.ej. Enviar); los que llevan parameters
    // (listas de opciones: métodos de cobro, habitaciones…) se quedan en su sitio y NO se
    // repiten en el pie. En un DIALOG (modal de decisión puntual) TODOS los botones son
    // acciones del pie — el listener del modal despacha actionId + parameters, así que
    // "Check-in de <nombre>" (con su _item) viaja igual que "Volver al listado"
    const isDialog = !!(ctx.tree && ctx.tree.metadata && ctx.tree.metadata.type === 'Dialog')
    const conParams = (btn) => !!(btn.parameters && Object.keys(btn.parameters).length)
    const keepInContent = isDialog ? () => false : conParams
    const content = (islandContentOf(ctx) || [])
      .map((block) => ({
        ...block,
        items: block.items
          .filter((a) => !a.isInput)
          .map((a) => (a.isButtons ? { ...a, buttons: (a.buttons || []).filter(keepInContent) } : a))
          .filter((a) => !a.isButtons || a.buttons.length),
      }))
      .filter((block) => block.items.length)
    const contentActionIds = new Set()
    for (const block of content) {
      for (const a of block.items) {
        if (a.isButtons) for (const btn of a.buttons || []) contentActionIds.add(btn.actionId)
      }
    }
    return {
      id,
      title: ctx.title || '',
      position: ctx.position || 'end',
      width: ctx.width,
      state: ctx.state || {},
      fields: fieldListOf(ctx.tree, ctx.state),
      actions: actionsOf(ctx.tree).filter((a) => !contentActionIds.has(a.actionId)),
      content: content,
      hasContent: !!content.length,
      // un overlay Dialog se pinta como MODAL (oj-dialog: decisión puntual), no como
      // drawer (tarea con formulario); texts = sus líneas de mensaje
      isDialog,
      texts: collectTexts(ctx.tree),
    }
  }

  /** Vigía del diálogo de progreso de un LongTask sobre el stream SSE: consume el Add del
   *  Dialog-con-ProgressBar y los state-only dirigidos a su id; devuelve eventos
   *  {kind: open|progress, title?, text?, value?, rest} para que el chain pinte el
   *  oj-dialog — `rest` lleva los commands/messages del increment (el último los trae:
   *  dispatchEvent del refresco) SIN el fragment del diálogo, listos para reducir. */
  function longTaskWatcher() {
    const hasProgressBar = (node) => {
      if (!node || typeof node !== 'object') return false
      if (node.metadata && node.metadata.type === 'ProgressBar') return true
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) { if (v.some(hasProgressBar)) return true }
        else if (v && typeof v === 'object' && hasProgressBar(v)) return true
      }
      return false
    }
    const w = { dialogId: null, closeAfter: null }
    w.consume = (inc) => {
      for (const fragment of inc.fragments || []) {
        const md = fragment.component && fragment.component.metadata
        if (fragment.action === 'Add' && md && md.type === 'Dialog' && hasProgressBar(fragment.component)) {
          w.dialogId = md.id
          const seed = md.initialData || {}
          return {
            kind: 'open',
            title: seed.title,
            text: seed.progressText,
            value: seed.progressValue || 0,
            rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
          }
        }
      }
      if (!w.dialogId) return null
      const frs = inc.fragments || []
      if (frs.length && frs.every((f) => !f.component && f.targetComponentId === w.dialogId)) {
        const st = frs[0].state || {}
        if (st._closeAfterMillis != null) w.closeAfter = st._closeAfterMillis
        return {
          kind: 'progress',
          title: st.title,
          text: st.progressText,
          value: st.progressValue,
          rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
        }
      }
      return null
    }
    return w
  }

  /** Helper de RENDER: recolecta los textos (metadata.type Text) de un subárbol. */
  function collectTexts(node, out = []) {
    if (!node || typeof node !== 'object') return out
    if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
      out.push(node.metadata.text)
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach((x) => collectTexts(x, out))
      else if (v && typeof v === 'object') collectTexts(v, out)
    }
    return out
  }

  /** Proyección del FOLDOUT (Fase 7): overview + paneles con sus cabeceras (metadata.panels)
   *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout.
   *  Cada slot proyecta además sus bloques RICOS (mismo pipeline que el host: tarjetas
   *  StatusList, botones, inputs, notices…) — el markup pinta blocks y deja texts solo
   *  como forma legada para tests/fixtures. */
  function foldoutOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'FoldoutLayout') : null
    if (!node) return null
    const md = node.metadata
    const children = node.children || []
    const bySlot = {}
    for (const child of children) bySlot[child.slot || ''] = child
    const blocksOf = (slotNode) => {
      const blocks = slotNode
        ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {} })
        : null
      // mismo contrato visual que hostContentOf: bloques-columna con su colClass,
      // el resto a fila completa
      return (blocks || []).map((block) => ({
        ...block,
        blockClass: block.colClass || 'oj-flex-item oj-sm-12',
      }))
    }
    return {
      headerTitle: md.headerTitle || '',
      overview: {
        texts: collectTexts(bySlot['overview']),
        blocks: blocksOf(bySlot['overview']),
      },
      panels: (md.panels || []).map((panel, i) => ({
        title: panel.title || '',
        subtitle: panel.subtitle || '',
        // título compuesto del panel: "Operaciones · 1 de 7" — el contador vive en la
        // CABECERA (leído del contenido vivo por índice, refresca sin re-stampar)
        headerLabel: (panel.title || '') + (panel.subtitle ? ' · ' + panel.subtitle : ''),
        open: panel.open !== false,
        // width EXPLÍCITO del wire (FoldoutPanel.width): el markup fija el panel a esa
        // medida — sin él, el motor responsive del foldout reparte a su aire y las
        // tarjetas del cockpit se solapan
        width: panel.width || '',
        texts: collectTexts(bySlot['panel-' + i]),
        blocks: blocksOf(bySlot['panel-' + i]),
      })),
    }
  }

  /** Proyección del WIZARD (Fase 8): los ProgressSteps del wire → tren del guided-process
   *  ({id,label} + currentStep por id). null si la página no es un wizard. En la pantalla de
   *  resultado todos los pasos van 'done' → currentStep = el último. */
  function wizardOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
    if (!node) return null
    const md = node.metadata
    // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on';
    // el status de Mateu NO se emite (el indicador del rail espera otro enum)
    const steps = (md.steps || []).map((s) => ({
      id: s.id,
      label: s.title || s.id,
      title: s.title || s.id,
      display: 'on',
    }))
    const current = (md.steps || []).find((s) => s.status === 'current')
    return {
      steps,
      currentStep: current ? current.id : (steps.length ? steps[steps.length - 1].id : null),
    }
  }

  /** Helper de RENDER: todos los nodos de un tipo (sin cruzar fronteras de isla). */
  function findAllByType(tree, type) {
    const out = []
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return
      if (n.metadata && n.metadata.type === type) out.push(n)
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** Card → {title, texts} (el título del Card es un componente Text anidado). */
  function cardOf(node) {
    const md = (node && node.metadata) || {}
    return { title: collectTexts(md.title)[0] || '', texts: collectTexts(md.content) }
  }

  /** Arquetipo WELCOME: hero (título/subtítulo + CTAs) + tiles del DashboardLayout. */
  function welcomeOf(ctx) {
    const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
    if (!hero) return null
    const md = hero.metadata
    const ctas = actionsOf(hero)
    const panels = findAllByType(ctx.tree, 'DashboardPanel')
    // un TrendChart en un tile → CHART a todo el ancho bajo los KPIs (oj-chart en VB);
    // items PRECOMPUTADOS (id/value/group/series) — el CSP de VB no construye arrays
    const trendPanel = panels.find(
      (panel) => findByType(panel, 'TrendChart') || findByType(panel, 'Chart'))
    const chartNode = trendPanel
      ? findByType(trendPanel, 'TrendChart') || findByType(trendPanel, 'Chart') : null
    const tm = chartNode ? chartNode.metadata : null
    // valores/labels de las dos formas del wire: TrendChart (values/labels planos) o
    // Chart (chartData.labels + datasets[0].data — se toma la primera serie)
    const dataset = tm && tm.chartData && tm.chartData.datasets && tm.chartData.datasets.length
      ? tm.chartData.datasets[0] : null
    const values = tm ? (tm.values || (dataset ? dataset.data : []) || []) : []
    const labels = tm ? (tm.labels || (tm.chartData ? tm.chartData.labels : []) || []) : []
    const series = (dataset && dataset.label) || 'Ocupación %'
    const trend = tm
      ? {
          title: trendPanel.metadata.title || tm.title || '',
          items: (values || []).map((value, i) => ({
            id: i,
            value,
            group: [labels[i] != null ? labels[i] : String(i + 1)],
            series,
          })),
        }
      : null
    const tiles = panels.filter((panel) => panel !== trendPanel).map((panel) => {
      // un MetricCard dentro del tile → KPI (valor grande + etiqueta + caption)
      const metric = findByType(panel, 'MetricCard') || findByType(panel, 'Stat')
      const mm = metric ? metric.metadata : null
      return {
        title: panel.metadata.title || '',
        texts: collectTexts(panel),
        isKpi: !!mm,
        kpiTitle: mm ? (mm.title || mm.label || '') : '',
        kpiValue: mm ? String(mm.value == null ? '' : mm.value) : '',
        kpiCaption: mm ? (mm.description || mm.caption || '') : '',
        kpiActionId: mm ? (mm.actionId || '') : '',
      }
    })
    return {
      trend,
      title: md.title || '',
      subtitle: md.subtitle || '',
      ctas,
      primaryCta: ctas.length ? { label: ctas[0].label } : { label: '' },
      primaryCtaId: ctas.length ? ctas[0].actionId : '',
      secondaryCta: ctas.length > 1 ? { label: ctas[1].label } : null,
      secondaryCtaId: ctas.length > 1 ? ctas[1].actionId : '',
      tiles,
    }
  }

  /** Arquetipo GENERAL OVERVIEW: switcher de registro + EntityHeader + cards. */
  function generalOverviewOf(ctx) {
    const header = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
    if (!header) return null
    const md = header.metadata
    const switcher = collectFields(ctx.tree).find((f) => f.options && f.options.length)
    // el arquetipo REQUIERE el switcher de registro: un EntityHeader suelto (p.ej. el 360
    // de en casa o el folio de check-out como página) NO es un General Overview
    if (!switcher) return null
    const state = ctx.state || {}
    const badgeText = (md.badges || []).map((b) => b.label).join(' · ')
    const facts = (md.facts || []).map((f) => ({ label: f.label, value: f.value }))
    if (md.metricLabel) facts.push({ label: md.metricLabel, value: md.metricValue })
    const cards = findAllByType(ctx.tree, 'Card')
      .map(cardOf)
      .filter((card) => card.title) // los Card sin título son wrappers de sección/estructura
    return {
      title: md.title || '',
      subtitle: (md.subtitle || '') + (badgeText ? ' · ' + badgeText : ''),
      facts,
      switcherField: switcher ? switcher.fieldId : '',
      switcherOptions: switcher
        ? switcher.options.map((o) => ({ value: o.value, label: o.label }))
        : [],
      switcherValue: switcher ? state[switcher.fieldId] : null,
      cards,
    }
  }

  /** Arquetipo ITEM OVERVIEW: panel de datos clave + tabs. */
  function itemOverviewOf(ctx) {
    const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
    if (!tabLayout) return null
    const keyCard = findAllByType(ctx.tree, 'Card').find((card) => !findByType(card, 'TabLayout'))
    const tabs = findAllByType(ctx.tree, 'Tab').map((tab, i) => ({
      id: 'itab-' + i,
      label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
      texts: collectTexts(tab),
    }))
    return {
      key: keyCard ? cardOf(keyCard) : { title: '', texts: [] },
      tabs,
    }
  }

  /** Puerta 1.3: banners de página (Page.metadata.banners) → items del
   *  oj-sp-messages-banner del starter (MessagesBannerType). */
  function bannersOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    // los messageType del oj-sp-messages-banner van con prefijo general-* (patrón del starter)
    const THEMES = { INFO: 'general-info', SUCCESS: 'general-success', WARNING: 'general-warning', DANGER: 'general-error' }
    return (((page || {}).metadata || {}).banners || []).map((banner, i) => ({
      id: 'mateu-banner-' + i,
      messageType: THEMES[banner.theme] || 'general-info',
      primaryText: banner.title || '',
      secondaryText: banner.description || '',
    }))
  }

  /** Puerta 1.6: anatomía RDS del ancho de página (medición Toolkit 24C) — el wrapper del
   *  contenido aplica contexts[host].pageWidth: fixed = tope 1408px con gutters 24px;
   *  fullWidth = fluido con gutters 24px; edgeToEdge = 0 márgenes. En FIXED el borde
   *  DERECHO se ancla a la MISMA fórmula con la que oj-sp-simple-ui-shell coloca su
   *  chrome flotante (chat FAB: right = (100vw - 1536px)/2, medido) — el shell calcula
   *  su caja sobre el viewport COMPLETO e ignora el navigator drawer, así que centrar
   *  el contenido en el área restante lo desalineaba del FAB en viewports anchos;
   *  izquierda auto (absorbe el drawer), tope 1408. */
  function pageStyleOf(ctx) {
    const width = (ctx && ctx.pageWidth) || 'fixed'
    if (width === 'edgeToEdge') return { maxWidth: 'none', margin: '0', padding: '0' }
    if (width === 'fullWidth') return { maxWidth: 'none', margin: '0', padding: '24px' }
    return {
      maxWidth: '1408px',
      margin: '0 max(24px, calc((100vw - 1536px) / 2 + 64px)) 0 auto',
      padding: '24px',
    }
  }

  /** Proyección de NAVEGACIÓN de la shell: items de primer nivel + grupos con sus hijos.
   *  Un grupo (submenus en el wire) NO resuelve por sync — sus hijos navegan por la ruta
   *  TERMINAL (la compuesta /gestion/person da "Not found."; se recorta el prefijo del padre).
   *  Selectores de contexto y acciones de cabecera salen listos para bindings simples. */
  // Iconos de menú: el wire trae nombres NEUTRALES (convención Mateu: set de Vaadin,
  // p.ej. "vaadin:calendar-user") — cada renderer los traduce a su set; aquí, al icon
  // font Redwood (oj-ux-ico-*, clases del gallery bundle). Un valor que ya venga como
  // clase oj-ux pasa tal cual; sin traducción conocida → sin icono.
  const OJ_ICONS = {
    'vaadin:calendar-user': 'oj-ux-ico-calendar-contact',
    'vaadin:calendar': 'oj-ux-ico-calendar',
    'vaadin:tasks': 'oj-ux-ico-task',
    'vaadin:automation': 'oj-ux-ico-robot-action',
    'vaadin:cog': 'oj-ux-ico-settings',
    'vaadin:cogs': 'oj-ux-ico-settings',
    'vaadin:home': 'oj-ux-ico-home',
    'vaadin:user': 'oj-ux-ico-contact',
    'vaadin:users': 'oj-ux-ico-contact-group',
    'vaadin:bed': 'oj-ux-ico-bed',
    'vaadin:chart': 'oj-ux-ico-bar-chart',
    'vaadin:table': 'oj-ux-ico-table',
    'vaadin:money': 'oj-ux-ico-currency-money',
    'vaadin:barcode': 'oj-ux-ico-scan-barcode',
    'vaadin:pencil': 'oj-ux-ico-edit',
    'vaadin:ban': 'oj-ux-ico-do-not-enter',
    'vaadin:rotate-left': 'oj-ux-ico-undo',
    'vaadin:exchange': 'oj-ux-ico-exchange-h',
    'vaadin:wifi': 'oj-ux-ico-connection',
    'vaadin:key': 'oj-ux-ico-key',
    'vaadin:pen': 'oj-ux-ico-signature',
    'vaadin:credit-card': 'oj-ux-ico-bank-card',
    'vaadin:gift': 'oj-ux-ico-gift',
    'vaadin:cart': 'oj-ux-ico-cart',
    'vaadin:check': 'oj-ux-ico-check',
    'vaadin:clock': 'oj-ux-ico-clock',
  }
  function ojIconOf(icon) {
    if (!icon) return undefined
    if (icon.indexOf('oj-ux-') === 0) return icon
    return OJ_ICONS[icon] || undefined
  }

  function shellNavOf(reg) {
    const shell = reg.shell || {}
    const items = []
    const menuTree = []
    let hasGroups = false
    for (const option of shell.menu || []) {
      const route = option.route || option.path
      const label = option.caption || option.label || route
      const children = option.submenus || option.submenu || []
      items.push({ id: route, label, icon: ojIconOf(option.icon) })
      if (children.length) hasGroups = true
      menuTree.push({
        id: route,
        label,
        hasChildren: children.length > 0,
        children: children.map((child) => {
          const childRoute = child.route || child.path || ''
          const terminal = childRoute.indexOf(route + '/') === 0 ? childRoute.slice(route.length) : childRoute
          return { id: terminal, label: child.caption || child.label || terminal }
        }),
      })
    }
    // la VARIANTE del wire manda: TABS → in-app navigation; HAMBURGUER_MENU/TILES →
    // hamburguesa que abre un DRAWER izquierdo con oj-navigation-list (como el navigator
    // FA); MENU_ON_TOP (o TABS con grupos) → opciones de primer nivel VISIBLES en el
    // header, dropdown oj-menu solo para los grupos
    let mode = 'tabs'
    if (shell.variant === 'HAMBURGUER_MENU' || shell.variant === 'TILES') mode = 'drawer'
    else if (shell.variant === 'MENU_ON_TOP' || hasGroups) mode = 'topbar'
    return {
      mode,
      items,
      menuTree,
      selectors: (shell.appContext || []).map((selector) => ({
        fieldName: selector.fieldName,
        label: selector.label || selector.fieldName,
        options: (selector.options || []).map((o) => ({ value: o.value, label: o.label || String(o.value) })),
      })),
      headerActions: (shell.headerActions || []).map((a) => ({
        actionId: a.actionId,
        label: a.label,
        hasChildren: !!(a.children && a.children.length),
        children: (a.children || []).map((c) => ({ actionId: c.actionId, label: c.label })),
      })),
      serverSideType: shell.serverSideType,
      homeRoute: shell.homeRoute || '',
    }
  }

  /** Colores de Chip del wire → clases badge de JET (sistema, Redwood). PRECOMPUTADO (CSP). */
  const BADGE_CLASSES = {
    error: 'oj-badge oj-badge-danger oj-badge-subtle',
    danger: 'oj-badge oj-badge-danger oj-badge-subtle',
    warning: 'oj-badge oj-badge-warning oj-badge-subtle',
    success: 'oj-badge oj-badge-success oj-badge-subtle',
    contrast: 'oj-badge oj-badge-neutral oj-badge-subtle',
  }

  /** Proyección del TaskQueue (cola de trabajo del front-office): grupos de cards con
   *  badges; el clic despacha metadata.actionId con parameters._item = id del item
   *  (contrato del renderer web compartido: mateu-task-queue.ts). Los datos viajan
   *  INLINE en la metadata — no hay eje data ni triggers. */
  function taskQueueOf(tree) {
    const node = findByType(tree, 'TaskQueue')
    if (!node) return null
    const md = node.metadata
    return {
      actionId: md.actionId,
      groups: (md.groups || []).map((group) => ({
        label: group.label,
        items: (group.items || []).map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption || '',
          selected: !!item.selected,
          cardClass: item.selected ? 'oj-sm-margin-2x-bottom oj-bg-neutral-20' : 'oj-sm-margin-2x-bottom',
          badges: (item.badges || []).map((badge) => ({
            label: badge.label,
            badgeClass: BADGE_CLASSES[badge.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
          })),
          // opción de LÍNEA (p.ej. "Check-out" solo en reservas in house): botón en la card
          // que despacha su propio actionId con {_item} — mismo contrato que el renderer web
          hasAction: !!(item.actionLabel && item.actionId),
          actionLabel: item.actionLabel || '',
          actionId: item.actionId || '',
          parameters: { _item: item.id },
        })),
      })),
    }
  }

  /** Proyección del EmptyState suelto (placeholder del panel de detalle, o página de
   *  bienvenida). Tras seleccionar un item el server lo sustituye por la isla → null. */
  function emptyStateOf(tree) {
    const node = findByType(tree, 'EmptyState')
    if (!node) return null
    const md = node.metadata
    return {
      title: (md.icon ? md.icon + ' ' : '') + (md.title || ''),
      description: md.description || '',
    }
  }

  /** Interpolación del wire (labels con plantillas): ${state.clave} → valor del state. */
  function interpolate(text, state) {
    return String(text == null ? '' : text).replace(
      /\$\{state\.([A-Za-z0-9_]+)\}/g,
      (all, key) => (state && state[key] != null ? String(state[key]) : ''),
    )
  }

  const TEXT_CLASSES = {
    xl: 'oj-typography-heading-md',
    l: 'oj-typography-subheading-md',
    s: 'oj-typography-body-sm',
    xs: 'oj-typography-body-xs oj-text-color-secondary',
  }
  const NOTICE_CLASSES = {
    success: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30',
    warning: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-warning-30',
    danger: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-danger-30',
    info: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-info-30',
  }

  /** Proyección GENÉRICA del contenido display de una isla (p.ej. el CheckInWizard
   *  embebido del front-office): BLOQUES (plain | card) de átomos precomputados para el
   *  CSP de VB (flags is*, clases, textos interpolados contra el state). Las islas
   *  ANIDADAS (App mediador dentro de la isla, p.ej. el documento) se saltan — fase
   *  posterior. null si el árbol no aporta nada display (isla de formulario puro). */
  function islandContentOf(ctx) {
    if (!ctx || !ctx.tree) return null
    const state = ctx.state || {}
    const interp = (t) => interpolate(t, state)
    const badgeOf = (b) => ({
      label: b.label,
      badgeClass: BADGE_CLASSES[b.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
    })
    const buttonOf = (m) => ({
      actionId: m.actionId,
      label: m.label || m.actionId,
      chroming: m.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      parameters: m.parameters || {},
    })
    const money = (value, currency) => (currency || '€') + ' ' + Number(value || 0)
      .toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const STATUS_TEXT = {
      success: 'oj-text-color-success',
      warning: 'oj-text-color-warning',
      danger: 'oj-text-color-danger',
      error: 'oj-text-color-danger',
    }
    const blocks = []
    let plain = null
    const atom = (a, container) => {
      if (container) { container.items.push(a); return }
      if (!plain) { plain = { isPlain: true, items: [] }; blocks.push(plain) }
      plain.items.push(a)
    }
    // los hijos de un nodo viajan en children Y/O en metadata.content (CustomField, Notice…)
    const kidsOf = (node) => {
      const out = [...(node.children || [])]
      const inner = node.metadata && node.metadata.content
      if (Array.isArray(inner)) out.push(...inner)
      else if (inner && typeof inner === 'object') out.push(inner)
      return out
    }
    const collectButtons = (node, out) => {
      if (!node || typeof node !== 'object') return out
      if (node.metadata && node.metadata.type === 'Button') { out.push(buttonOf(node.metadata)); return out }
      for (const child of kidsOf(node)) collectButtons(child, out)
      return out
    }
    const visit = (node, container) => {
      if (!node || typeof node !== 'object') return
      const m = node.metadata
      const t = m && m.type
      // FILA ZONADA (@Zones): HorizontalLayout cuyos hijos son columnas con
      // flex: 1 1 calc(NN% …) — cada zona se proyecta como bloque-columna (colClass
      // oj-md-(NN→doceavos)); si una zona genera varios bloques se FUSIONAN en uno
      // (un flex no puede apilar dos items en la misma celda de fila)
      if (t === 'HorizontalLayout' && !container) {
        const zoneMatches = (node.children || []).map(
          (ch) => String(ch.style || '').match(/flex:\s*1 1 calc\((\d+(?:\.\d+)?)%/))
        if (zoneMatches.length >= 2 && zoneMatches.every(Boolean)) {
          node.children.forEach((zoneChild, i) => {
            const pct = parseFloat(zoneMatches[i][1])
            const col = Math.min(11, Math.max(1, Math.round(pct * 12 / 100)))
            // las cssClasses del wire de la COLUMNA viajan al bloque (p.ej. la banda
            // neutra de la info secundaria del general overview: oj-panel + oj-bg-*)
            const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
              + (zoneChild.cssClasses ? ' ' + zoneChild.cssClasses : '')
            const before = blocks.length
            plain = null
            visit(zoneChild, null)
            plain = null
            const created = blocks.splice(before)
            if (created.length === 1) {
              created[0].colClass = colClass
              blocks.push(created[0])
            } else if (created.length > 1) {
              blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
            }
          })
          return
        }
      }
      if (t === 'App') {
        // isla ANIDADA (p.ej. el documento del check-in): marcador de posición — el
        // contenido vive en su propio contexto y lo pinta mateuNested en ese hueco
        atom({ isNested: true, islandId: node.id }, container)
        return
      }
      if (t === 'FormField') {
        const fieldId = m.fieldId || m.id
        if (m.propertyRow) {
          const raw = state[fieldId] != null ? state[fieldId] : (m.value != null ? m.value : '')
          atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(raw)) }, container)
          return
        }
        // FormField FLUIDO editable (p.ej. el buscador de cargos del modo check-out):
        // input ligado por fieldId al estado del contexto (draft + auto-save)
        if (m.dataType === 'string' || m.dataType === 'integer' || m.dataType === 'number') {
          atom({
            isInput: true,
            fieldId,
            label: m.label || '',
            value: state[fieldId] == null ? '' : String(state[fieldId]),
          }, container)
        }
        return
      }
      if (t === 'Card') {
        const card = { isCard: true, items: [] }
        blocks.push(card)
        plain = null
        const title = m.title && (m.title.text || (typeof m.title === 'string' ? m.title : ''))
        if (title) card.items.push({ isText: true, text: interp(title), cls: 'oj-typography-subheading-xs oj-sm-margin-2x-bottom' })
        for (const child of node.children || []) visit(child, card)
        const cardInner = m.content
        if (Array.isArray(cardInner)) cardInner.forEach((c) => visit(c, card))
        else if (cardInner && typeof cardInner === 'object' && cardInner.metadata) visit(cardInner, card)
        plain = null
        return
      }
      if (t === 'Page') {
        // título de la isla + su TOOLBAR (los @Toolbar del server viajan en metadata.toolbar)
        const pageTitle = interp(m.title || '')
        if (pageTitle) atom({ isText: true, text: pageTitle, cls: 'oj-typography-subheading-sm' }, container)
        const toolbar = (m.toolbar || []).filter((b) => b && b.actionId)
        if (toolbar.length) atom({ isButtons: true, fromPageToolbar: true, buttons: toolbar.map(buttonOf) }, container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'Text') {
        const text = interp(m.text)
        if (text) {
          // container h1..h6 → HEADING de contenido: h3 real (el escalón siguiente al h2
          // de la sección), con ritmo de grupo (margin-top) cuando no abre el bloque
          const heading = /^h[1-6]$/.test(m.container || '')
          if (heading) {
            const target = container || plain
            const notFirst = !!(target && target.items.length)
            atom({
              isText: true,
              isHeading: true,
              // un h2 al frente de una zona es el TITULO del fold (el gop lo asciende a
              // cabecera de slot con el subrayado del foldout)
              isH2: m.container === 'h2',
              text,
              cls: 'oj-typography-subheading-xs' + (notFirst ? ' oj-sm-margin-10x-top' : ''),
            }, container)
          } else {
            atom({ isText: true, text, cls: TEXT_CLASSES[m.size] || 'oj-typography-body-md' }, container)
          }
        }
        return
      }
      if (t === 'ProgressSteps') {
        const steps = (m.steps || []).map((step) => ({ id: step.id, label: step.title || step.label || step.id }))
        const current = (m.steps || []).find((step) => step.status === 'current')
        atom({ isProgress: true, steps, selectedId: current ? current.id : (steps[0] && steps[0].id) }, container)
        return
      }
      if (t === 'EntityHeader') {
        atom({
          isEntityHeader: true,
          title: interp(m.title),
          subtitle: interp(m.subtitle || ''),
          badges: (m.badges || []).map(badgeOf),
          facts: (m.facts || []).map((f) => ({ label: f.label, value: interp(f.value) })),
          metricLabel: m.metricLabel || '',
          metricValue: interp(m.metricValue || ''),
        }, container)
        return
      }
      if (t === 'Notice') {
        atom({
          isNotice: true,
          text: interp(m.text),
          noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
          buttons: collectButtons({ children: kidsOf(node) }, []),
        }, container)
        return
      }
      if (t === 'BulletedList') {
        atom({ isBullets: true, items: (m.items || []).map(interp) }, container)
        return
      }
      if (t === 'Separator') {
        atom({ isSeparator: true }, container)
        return
      }
      if (t === 'Badge') {
        atom({ isBadge: true, label: interp(m.text), badgeClass: BADGE_CLASSES[m.color] || 'oj-badge oj-badge-neutral oj-badge-subtle' }, container)
        return
      }
      if (t === 'ResourceGrid') {
        const columns = m.columns && m.columns > 0 && m.columns <= 12 ? m.columns : 4
        const colClass = 'oj-flex-item oj-sm-' + Math.max(1, Math.floor(12 / columns))
        atom({
          isResourceGrid: true,
          items: (m.items || []).map((it) => ({
            id: it.id,
            title: it.title,
            subtitle: it.subtitle || '',
            statusLabel: it.statusLabel || '',
            statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
            note: it.note || '',
            recommendedLabel: it.recommended ? (m.recommendedLabel || '') : '',
            enabled: !it.disabled,
            disabled: !!it.disabled,
            actionId: m.actionId,
            parameters: { _item: it.id },
            colClass,
            cardClass: it.selected ? 'oj-bg-neutral-20' : '',
          })),
        }, container)
        return
      }
      if (t === 'OfferCard') {
        atom({
          isOffer: true,
          tag: interp(m.tag || ''),
          title: interp(m.title || ''),
          subtitle: interp(m.subtitle || ''),
          features: (m.features || []).map(interp).join(' · '),
          currentLabel: m.current ? (m.currentLabel || '') : '',
          addedLabel: m.added ? (m.addedLabel || '') : '',
          priceLabel: interp(m.priceLabel || ''),
          actionLabel: m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'AddOnPicker') {
        atom({
          isAddOns: true,
          actionId: m.actionId,
          currency: m.currency || '€',
          totalLabel: m.totalLabel || 'Total',
          items: (m.items || []).map((it) => ({
            id: it.id,
            icon: it.icon || '',
            title: interp(it.title),
            description: interp(it.description || ''),
            price: it.price || 0,
            priceText: money(it.price, m.currency) + (it.unit ? ' / ' + it.unit : ''),
            includedLabel: it.includedLabel || '',
            selectable: !it.includedLabel,
            added: !!it.added,
          })),
        }, container)
        return
      }
      if (t === 'StatusList') {
        // columns > 1 → grid responsive de N columnas: el wrapper pasa a oj-flex (wrap) y
        // cada ítem se pinta como TARJETA (oj-panel: borde propio, badge de estado dentro)
        // — celdas sin borde dejaban ambiguo a qué tarea pertenece cada chip y el conjunto
        // no se leía como listado de tareas. La celda exterior es a su vez oj-flex para que
        // el panel interior estire a la altura de la fila (align-items stretch).
        // Todo precomputado por ítem — el CSP de VB no divide ni compara.
        const cols = m.columns && m.columns > 1 && m.columns <= 12 ? m.columns : 0
        const rowClass = 'oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom'
        // SOLO columns>1 fuerza tarjetas: una lista de una columna con acciones (los
        // huéspedes) se pinta con la rama APILADA del markup — nombre como h3 (nivel
        // siguiente al h2 de la sección), sin avatar, ritmo .mateu-list-item
        const asCards = cols > 0
        // la rejilla del cockpit: celdas de MEDIDA FIJA (.mateu-grid-cell, 22rem) con el
        // aire entre tarjetas como gap de la rejilla (.mateu-grid) — ver app.css
        const cellClass = cols
          ? 'oj-flex-item mateu-grid-cell oj-flex oj-sm-margin-4x-bottom'
          : (asCards ? 'oj-flex-item oj-sm-12 oj-flex oj-sm-margin-4x-bottom' : '')
        atom({
          isStatusList: true,
          wrapClass: cols > 0 ? 'oj-flex mateu-grid' : (asCards ? 'oj-flex' : ''),
          items: (m.items || []).map((it) => {
            // hasta DOS acciones por fila (p.ej. Escanear / A mano por pax) — array
            // precomputado; una fila CON acciones se pinta APILADA (título+chip /
            // descripción / botones) para no descolocarse en carriles estrechos
            // hasta TRES acciones por fila; con actionIcon* el botón se pinta SOLO-ICONO
            // (label como tooltip/aria) — iconClass precomputado vía ojIconOf
            const rowActions = []
            if (it.actionLabel && it.actionId) {
              rowActions.push({ label: it.actionLabel, actionId: it.actionId, parameters: { _item: it.id },
                iconClass: ojIconOf(it.actionIcon) || '' })
            }
            if (it.actionLabel2 && it.actionId2) {
              rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
                iconClass: ojIconOf(it.actionIcon2) || '' })
            }
            if (it.actionLabel3 && it.actionId3) {
              rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
                iconClass: ojIconOf(it.actionIcon3) || '' })
            }
            return {
              rowClass,
              gridCell: asCards,
              cellClass,
              statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
              avatar: it.avatar || '',
              icon: it.icon || '',
              title: interp(it.title),
              description: interp(it.description || ''),
              status: interp(it.status || ''),
              statusClass: STATUS_TEXT[it.statusColor] || 'oj-text-color-secondary',
              actions: rowActions,
              hasActions: rowActions.length > 0,
              // nivel del heading del titulo apilado: h4 bajo un grupo con h3 propio
              isH4: m.itemHeadingLevel === 4,
              // cronologia bajo el titulo (p.ej. las entradas de una incidencia)
              lines: (it.lines || []).map(interp),
              hasLines: !!(it.lines && it.lines.length),
              actionLabel: it.actionLabel || '',
              actionId: it.actionId || m.rowActionId || '',
              parameters: { _item: it.id },
              // rowActionId SIN botón propio = la FILA ENTERA es actuable (contrato del
              // renderer web: clic de fila → rowActionId con {_item})
              rowClickable: !!(m.rowActionId && !it.actionLabel),
            }
          }),
        }, container)
        return
      }
      if (t === 'Ledger') {
        atom({
          isLedger: true,
          lines: (m.lines || []).map((line) => ({
            concept: interp(line.concept),
            amountText: line.included ? (line.includedLabel || '') : money(line.amount, m.currency),
            amountClass: (line.amount || 0) < 0 ? 'oj-text-color-success' : '',
          })),
          totalLabel: m.totalLabel || 'Total',
          totalText: money(m.total, m.currency),
        }, container)
        return
      }
      if (t === 'PaymentPicker') {
        atom({
          isPayment: true,
          contextLabel: m.contextLabel || '',
          contextValue: interp(m.contextValue || ''),
          methods: (m.methods || []).map((method) => ({
            label: method.label,
            chroming: method.id === m.selected ? 'callToAction' : 'outlined',
            actionId: m.methodActionId,
            parameters: { _method: method.id },
          })),
          confirmLabel: m.confirmLabel || 'Confirmar',
          confirmActionId: m.actionId,
          confirmParameters: { _method: m.selected },
        }, container)
        return
      }
      if (t === 'Meter') {
        atom({
          isMeter: true,
          label: m.label || '',
          value: m.value || 0,
          max: m.max || 100,
          valueText: (m.unit === '€' ? money(m.value, '€') : String(m.value)) + ' / ' + (m.unit === '€' ? money(m.max, '€') : String(m.max)),
          caption: interp(m.caption || ''),
        }, container)
        return
      }
      if (t === 'TaskProgress') {
        // banner de subtareas N-de-M (checklist de operaciones): completo → panel success y
        // sin botón (contrato del componente); todo precomputado (el CSP de VB no compara)
        const total = m.total || 0
        const done = m.done || 0
        const complete = total > 0 && done >= total
        atom({
          isTaskProgress: true,
          label: interp(m.label || ''),
          value: done,
          max: total,
          valueText: done + ' de ' + total,
          panelClass: complete
            ? 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30'
            : 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-neutral-20',
          actionLabel: !complete && m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'Stat') {
        atom({
          isStat: true,
          label: m.label || '',
          value: String(m.value == null ? '' : m.value) + (m.unit ? ' ' + m.unit : ''),
        }, container)
        return
      }
      if (t === 'Button') {
        const target = container || plain
        const last = target && target.items.length ? target.items[target.items.length - 1] : null
        if (last && last.isButtons) last.buttons.push(buttonOf(m))
        else atom({ isButtons: true, buttons: [buttonOf(m)] }, container)
        return
      }
      for (const child of kidsOf(node)) visit(child, container)
    }
    visit(ctx.tree, null)
    // HOISTING de la isla anidada: un bloque cuyo contenido es la isla (card "Documento")
    // se convierte en bloque isNestedBlock — el markup la pinta a nivel de BLOQUE porque
    // a más profundidad el evaluador CSP de VB deja de resolver los bindings del template
    const hoisted = blocks.map((block) => (
      block.items.some((a) => a.isNested)
        ? { ...block, isNestedBlock: true, items: block.items.filter((a) => !a.isNested) }
        : block
    ))
    const hasDisplay = hoisted.some((b) => b.items.some((a) => !a.isButtons) || b.isNestedBlock)
    return hasDisplay ? hoisted : null
  }

  /** Fusiona el contenido de la isla ANIDADA dentro de los bloques de la isla madre:
   *  el bloque isNestedBlock (la card que solo contenía la isla) pasa a ser una card
   *  normal cuyos items son los átomos de la anidada, MARCADOS fromNested (también sus
   *  botones) para que el dispatcher enrute sus acciones al contexto anidado. Motivo:
   *  leer $application.variables DENTRO de un template anidado no re-liga los contextos
   *  internos en el evaluador CSP de VB — los datos deben fluir por $current. */
  function mergeNestedContent(islandBlocks, nestedBlocks) {
    if (!islandBlocks) return islandBlocks
    const nestedAtoms = (nestedBlocks || []).reduce((out, block) => out.concat(block.items), [])
      .map((a) => {
        const marked = { ...a, fromNested: true }
        if (a.buttons) marked.buttons = a.buttons.map((btn) => ({ ...btn, fromNested: true }))
        return marked
      })
    return islandBlocks.map((block) => (
      block.isNestedBlock
        ? { ...block, isNestedBlock: false, isCard: true, isPlain: false, items: nestedAtoms }
        : block
    ))
  }

  /** Contenido display del HOST (páginas de detalle standalone: /encasa/:id, /checkout/:id,
   *  y los pasos del wizard /checkin/:id): los mismos bloques que una isla, con la PRIMERA
   *  isla del host (p.ej. el documento) fusionada en su hueco (atomos fromNested → despachan
   *  al contexto de la isla). En modo wizard se filtran el título de página, el ProgressSteps
   *  y los botones back/next: el guided process ya aporta rail, título y Continue. */
  function hostContentOf(ctx, islandBlocks, opts = {}) {
    const blocks = islandContentOf(ctx)
    if (!blocks) return null
    let merged = mergeNestedContent(blocks, islandBlocks || null)
    const title = opts.title || ''
    let titleDropped = false
    let entityDropped = false
    merged = merged
      .map((block) => ({
        ...block,
        items: block.items.filter((atom) => {
          // el título de Page sobra: la banda del header (o el guided process) ya lo pinta
          if (!titleDropped && atom.isText && title && atom.text === title) {
            titleDropped = true
            return false
          }
          // el TOOLBAR de Page tampoco va al contenido: se proyecta a las acciones del
          // header (pageToolbarOf → primary/secondary de la banda) — SALVO el de la ISLA
          // fusionada (fromNested, p.ej. Cancel/Save del editor del documento): ese
          // pertenece a la isla y se pinta en su bloque
          if (atom.fromPageToolbar && !atom.fromNested) return false
          // y el EntityHeader tampoco cuando el header de pantalla lo muestra (título/
          // subtítulo/facts del huésped en la banda, en vez del título genérico)
          if (opts.dropEntityHeader && atom.isEntityHeader && !entityDropped) {
            entityDropped = true
            return false
          }
          if (opts.forWizard) {
            if (atom.isProgress) return false
            if (atom.isButtons && atom.buttons.length
                && atom.buttons.every((b) => b.actionId === 'next' || b.actionId === 'back')) return false
          }
          return true
        }),
      }))
      .filter((block) => block.items.length)
      // el loop del host pinta los bloques dentro de un oj-flex: los bloques-columna de una
      // fila zonada llevan su colClass; el resto ocupa la fila entera (oj-sm-12)
      .map((block) => ({ ...block, blockClass: block.colClass || 'oj-flex-item oj-sm-12' }))
    return merged.length ? merged : null
  }

  /** Acción FORWARD del wizard (Continue/Completar): se deriva del PIE real del árbol — el
   *  bloque de botones que acompaña a 'back' (los wizards ricos tienen además acciones de
   *  página como selectPax que NO son el forward; elegir "primera acción no-back" fallaba). */
  function wizardForwardOf(ctx) {
    const blocks = islandContentOf(ctx)
    if (!blocks) return null
    let forward = null
    for (const block of blocks) {
      for (const atomItem of block.items) {
        if (!atomItem.isButtons) continue
        const hasBack = atomItem.buttons.some((b) => b.actionId === 'back')
        const candidate = atomItem.buttons.find((b) => b.actionId !== 'back')
        if (candidate && (hasBack || candidate.actionId === 'next')) {
          forward = { actionId: candidate.actionId, label: candidate.label }
        }
      }
    }
    return forward
  }

  /** El EntityHeader del host (p.ej. el huésped de la Reserva 360) proyectado al HEADER de
   *  pantalla: título = el nombre, subtítulo = subtitle + badges, facts (+métrica) →
   *  contextualInfo del oj-sp-header-general-overview. */
  function entityHeaderOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
    if (!node) return null
    const m = node.metadata
    const state = ctx.state || {}
    const badgeText = (m.badges || []).map((b) => b.label).join(' · ')
    const facts = (m.facts || []).map((f) => ({ label: f.label, value: interpolate(f.value, state) }))
    if (m.metricLabel) facts.push({ label: m.metricLabel, value: interpolate(m.metricValue || '', state) })
    // los colores de Chip de Mateu → status del badge oj-sp
    const BADGE_STATUS = { success: 'success', error: 'danger', warning: 'warning', contrast: 'neutral', normal: 'info' }
    return {
      title: interpolate(m.title, state),
      subtitle: interpolate(m.subtitle || '', state) + (badgeText ? ' · ' + badgeText : ''),
      // el subtítulo SIN los badges concatenados (para templates que pintan el badge aparte)
      subtitlePlain: interpolate(m.subtitle || '', state),
      badges: (m.badges || []).map((b) => ({ label: b.label, status: BADGE_STATUS[b.color] || 'neutral' })),
      facts,
    }
  }

  /** ITEM OVERVIEW nativo (oj-sp-item-overview-page): página de entidad con dos
   *  bloques-columna cuya PRIMERA zona es la ESTRECHA — la anatomía RDS del template
   *  (panel de datos clave a la izquierda + main ancho a la derecha), frente al general
   *  overview (main ancho primero + info estrecha después). El EntityHeader del host se
   *  convierte en el oj-sp-item-overview del slot overview (itemTitle/subtitle/badge +
   *  facts como filas clave en el body); un botón "Volver…" del toolbar pasa a la flecha
   *  goToParent del header de navegación del template y el resto a secondaryActions. */
  function itemOverviewPageOf(entity, blocks, toolbar) {
    if (!entity) return null
    const zoned = (blocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
    if ((blocks || []).length !== 2 || zoned.length !== 2) return null
    const col = (b) => parseInt((b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '0', 10)
    if (col(zoned[0]) >= col(zoned[1])) return null // la ancha primero → general overview
    const full = (b) => Object.assign({}, b, { blockClass: 'oj-flex-item oj-sm-12' })
    const back = (toolbar || []).find((b) => /^volver\b/i.test(b.label || ''))
    const badge = (entity.badges || [])[0] || null
    return {
      on: true,
      overview: {
        title: entity.title || '',
        subtitle: entity.subtitlePlain != null ? entity.subtitlePlain : (entity.subtitle || ''),
        badge: badge ? { text: badge.label, status: badge.status, style: 'subtle', position: 'trailing' } : null,
        facts: entity.facts || [],
        blocks: [full(zoned[0])],
      },
      main: { blocks: [full(zoned[1])] },
      back: { show: !!back, actionId: back ? back.actionId : '', label: back ? back.label : '' },
      secondary: (toolbar || []).filter((b) => b !== back)
        .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
    }
  }

  /** El TOOLBAR de la Page del host (para las acciones del header de banda):
   *  [{actionId, label, chroming}]. El de estilo primary va al primaryAction del header. */
  function pageToolbarOf(ctx) {
    if (!ctx || !ctx.tree) return []
    const page = findByType(ctx.tree, 'Page')
    if (!page) return []
    return (page.metadata.toolbar || [])
      .filter((b) => b && b.actionId)
      .map((b) => ({
        actionId: b.actionId,
        label: b.label || b.actionId,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        disabled: !!b.disabled,
      }))
  }

  /** Descartar el overlay superior SIN guardar (✕/Esc/backdrop — no emite evento alguno). */
  function dismissOverlay(reg) {
    if (!reg.stack || !reg.stack.length) return reg
    const id = reg.stack[reg.stack.length - 1]
    const contexts = { ...reg.contexts }
    delete contexts[id]
    return { ...reg, contexts, stack: reg.stack.slice(0, -1) }
  }

  /** Acciones suscritas a un evento del bus (@SubscribeTo): p.ej. el listing refresca con
   *  'search' cuando el CloseModal del drawer emite mateu-crud:saved-in-drawer. */
  function eventTriggersOf(ctx, eventName) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .filter((t) => t.type === 'OnCustomEvent' && t.eventName === eventName && t.actionId)
      .map((t) => t.actionId)
  }

  /** Trigger @AutoSave/AutoSaveTrigger del host (buscar-al-teclear, autoguardado):
   *  {actionId, debounceMillis} o null. El renderer lo honra re-lanzando la acción
   *  debounced en cada pulsación (raw-value de los inputs del host). */
  function autoSaveOf(ctx) {
    const trigger = ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .find((t) => t.type === 'AutoSave' && t.actionId)
    return trigger
      ? { actionId: trigger.actionId, debounceMillis: trigger.debounceMillis || 400 }
      : null
  }

  /** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
  function summarizeHost(reg, route) {
    const host = reg.contexts[HOST_ID] || {}
    const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
    const menu = (reg.shell && reg.shell.menu) || []
    const option = menu.find((m) => m.route === route)
    // un listado (pageType collection) también lleva FormFields (columnas) — NO es un form
    const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
    const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
    const state = host.state || {}
    const fields = formMetadata ? fieldListOf(host.tree, state) : []
    return {
      // la Page de un listado no lleva título (viaja en la metadata del Crudl) → caption del menú
      title: pageMetadata.title || (option && (option.caption || option.label)) || '',
      text: formMetadata ? '' : String(state.message == null ? '' : state.message),
      formMetadata,
      fields,
      formValue: formMetadata ? { ...state } : null,
      actions: host.tree ? actionsOf(host.tree) : [],
    }
  }

  /** Helper de RENDER: primer nodo del árbol con metadata.type dado. */
  function findByType(tree, type) {
    let found = null
    const walk = (node) => {
      if (found || !node || typeof node !== 'object') return
      if (node.metadata && node.metadata.type === type) { found = node; return }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach(walk)
        else if (v && typeof v === 'object') walk(v)
      }
    }
    walk(tree)
    return found
  }

  /** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
   *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
   *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
  function listingOf(ctx) {
    const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
    if (!crudNode) return null
    const md = crudNode.metadata
    const page = (((ctx.data || {}).crud || {}).page) || {}
    return {
      title: md.title || '',
      subtitle: md.subtitle || '',
      searchable: !!md.searchable,
      pageSize: md.pageSize || 20,
      emptyStateMessage: md.emptyStateMessage || 'No data.',
      columns: (md.columns || []).map((col) => {
        const c = col.metadata || col
        const def = { headerText: c.label || c.id, field: c.id }
        // celda editable → plantilla de editor por tipo (siempre visible, commit por celda:
        // el contrato es update-row + parameters._editedRow; fixtures/real/update-row.json)
        if (c.editable && c.editorType) {
          def.template = c.editorType === 'boolean' ? 'cellEditBoolean'
            : (c.editorType === 'integer' || c.editorType === 'number') ? 'cellEditNumber'
              : 'cellEditText'
        }
        // ACCIONES por fila (ColumnActionGroup): botones que despachan
        // action-on-row-<método> con el id de la fila (Listing.handleActionOnRow)
        if (c.dataType === 'actionGroup') {
          def.template = 'cellRowActions'
          def.headerText = ''
        }
        // ESTADO como badge (@Status): el valor de la celda es {type, message} — la clase
        // JET del badge se precomputa en las filas (statusBadgeRows, CSP sin ternarios)
        if (c.dataType === 'status') {
          def.template = 'cellStatusBadge'
        }
        return def
      }),
      // densidad Redwood de la tabla: el 'grid' compacto es para tablas de TRABAJO —
      // se activa cuando el crud es editable inline (@InlineEditing marca las columnas
      // como editable en el wire); un listado de consulta queda en 'list' (aireado).
      // PRECOMPUTADO (CSP de VB).
      display: (md.columns || []).some((col) => (col.metadata || col).editable) ? 'grid' : 'list',
      // tabla de TRABAJO: el clic de fila NO navega (las celdas se editan in situ)
      editable: (md.columns || []).some((col) => (col.metadata || col).editable),
      rows: statusBadgeRows(page.content || [], md.columns || []),
      total: page.totalElements == null ? null : page.totalElements,
      isEmpty: (page.content || []).length === 0,
      toolbar: (md.toolbar || []).map((b) => ({
        actionId: b.actionId,
        label: b.label,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      })),
      // selector RÁPIDO del listado: filtros de opciones (p.ej. un enum en Filters, como
      // la Vista del listado de reservas) → chips oj-sp-filter-chip junto al smart search;
      // los filtros viajan como FormField select en la metadata (a veces en el mediator,
      // no en el nodo Crud — se busca en todo el árbol)
      quickFilters: quickFiltersOf(ctx),
    }
  }

  // filas con columnas @Status: al valor {type, message} se le estampa la clase badge de
  // JET (Redwood, sistema) — el template de celda no puede mapear (CSP sin ternarios)
  const STATUS_BADGE = {
    SUCCESS: 'oj-badge oj-badge-success oj-badge-subtle',
    WARNING: 'oj-badge oj-badge-warning oj-badge-subtle',
    DANGER: 'oj-badge oj-badge-danger oj-badge-subtle',
    INFO: 'oj-badge oj-badge-info oj-badge-subtle',
    NONE: 'oj-badge oj-badge-neutral oj-badge-subtle',
  }
  function statusBadgeRows(rows, columns) {
    const statusCols = columns
      .map((col) => col.metadata || col)
      .filter((c) => c.dataType === 'status')
      .map((c) => c.id)
    if (!statusCols.length) return rows
    return rows.map((row) => {
      const out = { ...row }
      for (const id of statusCols) {
        const value = out[id]
        if (value && typeof value === 'object') {
          out[id] = { ...value, badgeClass: STATUS_BADGE[value.type] || STATUS_BADGE.NONE }
        }
      }
      return out
    })
  }

  function quickFiltersOf(ctx) {
    const found = []
    const walk = (node) => {
      if (!node || typeof node !== 'object') return
      for (const f of ((node.metadata || {}).filters) || []) {
        if ((f.options || []).length && (f.stereotype === 'select' || f.stereotype === 'multiSelect')) {
          found.push({
            fieldId: f.fieldId,
            label: f.label || f.fieldId,
            options: f.options.map((o) => ({ value: o.value, label: o.label || o.value })),
          })
        }
      }
      ;(node.children || []).forEach(walk)
    }
    walk(ctx && ctx.tree)
    return found
  }

  /** Triggers OnLoad del contexto (p.ej. el listing dispara 'search' al cargar). */
  function onLoadTriggers(ctx) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .filter((t) => t.type === 'OnLoad' && t.actionId)
      .map((t) => t.actionId)
  }

  /** Si el contexto es un MEDIADOR (ServerSide → child App), la info para cargar su contenido. */
  function mediatorOf(ctx) {
    const tree = ctx?.tree
    if (tree?.type !== 'ServerSide') return null
    const child = (tree.children || [])[0]
    const md = child?.metadata
    if (md?.type !== 'App') return null
    return {
      rootRoute: md.rootRoute || ctx.state?._route || '',
      homeRoute: md.homeRoute ?? '',
      serverSideType: md.homeServerSideType ?? md.serverSideType,
      variant: md.variant,
    }
  }

  const metaOf = (fr) => fr.component?.metadata || {}

  let overlaySeq = 0
  /** Construye un contexto de overlay (drawer/dialog) a partir de un fragmento Add. */
  function buildOverlay(fr) {
    const md = metaOf(fr)
    const id = 'overlay-' + ++overlaySeq
    return {
      id,
      kind: 'drawer',
      tree: fr.component, // el árbol completo — md.content lleva el contenido (patrón Card)
      state: md.initialData || fr.state || {},
      title: md.headerTitle || md.title,
      subtitle: md.subtitle,
      position: md.position || 'end',
      width: md.width,
      size: md.size,
      dirty: false,
    }
  }

  /** Resuelve a qué clave del registro va un target: eco del initiator; ''/null → host. */
  const resolveTarget = (contexts, t) => {
    if (t == null || t === '') return HOST_ID
    if (contexts[t]) return t
    // eco de un id de componente ya registrado (p.ej. SSE que responde al uuid del árbol)
    const byTreeId = Object.keys(contexts).find((k) => contexts[k].tree?.id === t)
    return byTreeId || t
  }

  /**
   * EL REDUCER. reg = { contexts, stack, shell }; devuelve el NUEVO reg + los efectos que VB
   * aplica. Puro e inmutable con structural sharing: solo las entradas tocadas cambian de ref.
   * opts.initiator = contextId de la superficie que lanzó la request (para comandos sin target,
   * como el MarkAsClean del save-in-drawer).
   */
  function reduceContexts(reg, increment, opts = {}) {
    const contexts = { ...reg.contexts }
    const stack = [...reg.stack]
    let shell = reg.shell || null
    const effects = {
      toasts: [],
      banners: increment.banners || [],
      navigate: null,
      urlPush: null,
      download: null,
      runActions: [],
      docTitle: null,
      events: [], // bus @SubscribeTo: [{ name, detail }]
    }

    for (const m of increment.messages || [])
      effects.toasts.push({ text: m.text || m.title, variant: m.variant || 'info' })

    // ── fragmentos → shell | superficies ──────────────────────────────────────
    for (const fr of increment.fragments || []) {
      const md = metaOf(fr)

      // El App del BOOTSTRAP (root ClientSide type App) configura el chrome. Un App de
      // mediador NO pasa por aquí: llega envuelto en un ServerSide (child0) y es contenido.
      if (fr.component?.type === 'ClientSide' && md.type === 'App') {
        shell = {
          title: md.title,
          menu: md.menu || [],
          variant: md.variant,
          serverSideType: md.serverSideType, // para las acciones de cabecera (app-level)
          appContext: md.contextSelectors || [],
          headerActions: md.contextActions || [],
          themeToggle: md.themeToggle,
          // el logo del @App (@Logo, p.ej. /images/riu.svg — relativo al backend)
          logo: md.logo || '',
          // la HOME del app (@HomeRoute) — el boot de la shell la prefiere sobre la
          // primera opción del menú
          homeRoute: md.homeRoute || '',
        }
        continue
      }

      if (fr.action === 'Add') {
        const ctx = buildOverlay(fr)
        contexts[ctx.id] = ctx
        stack.push(ctx.id)
        continue
      }

      // Replace / ReplaceKeepData / State-only: MISMO camino para form, mediador, isla…
      const id = resolveTarget(contexts, fr.targetComponentId)
      const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {}, data: {} }
      const ss = fr.component?.type === 'ServerSide' ? fr.component : null
      contexts[id] = {
        ...prev,
        kind: prev.kind,
        tree: fr.component || prev.tree, // sin component => State-only: conserva el árbol
        pageType: ss?.pageType ?? (fr.component ? undefined : prev.pageType),
        pageWidth: ss?.pageWidth ?? (fr.component ? undefined : prev.pageWidth),
        state: !fr.component
          ? { ...prev.state, ...(fr.state || {}) } // State-only: MERGE (no borrar la isla)
          : fr.action === 'ReplaceKeepData'
            ? { ...prev.state, ...(fr.state || md.initialData || {}) }
            : (fr.state ?? md.initialData ?? prev.state),
        // data = eje de DATOS calculados por el server (p.ej. las filas del listing, keyed
        // por id de componente: {crud: {page: …}}); un fragmento data-only MERGEA
        data: !fr.component
          ? { ...prev.data, ...(fr.data || {}) }
          : (fr.data ?? {}),
        dirty: false,
      }
    }

    // ── comandos → efectos (algunos mutan el registro) ────────────────────────
    const emit = (data) => {
      if (!data) return
      if (typeof data === 'string') effects.events.push({ name: data, detail: null })
      else if (data.eventName) effects.events.push({ name: data.eventName, detail: data.detail ?? null })
    }
    for (const c of increment.commands || []) {
      const t = c.targetComponentId
      switch (c.type) {
        case 'SetWindowTitle':
          effects.docTitle = c.data
          break
        case 'NavigateTo': {
          const d = String(c.data || '')
          effects.navigate = /^https?:/.test(d) ? { url: d } : { route: d }
          break
        }
        case 'PushStateToHistory':
          effects.urlPush = c.data
          break
        case 'CloseModal': {
          const id = t && contexts[t] ? t : stack[stack.length - 1]
          if (id) {
            delete contexts[id]
            const i = stack.indexOf(id)
            if (i >= 0) stack.splice(i, 1)
          }
          emit(c.data) // eventName del cierre → bus (p.ej. refresco del listado del crud)
          break
        }
        case 'DispatchEvent':
          emit(c.data)
          break
        case 'MarkAsClean': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: false }
          break
        }
        case 'MarkAsDirty': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: true }
          break
        }
        case 'DownloadFile':
          effects.download = c.data
          break
        case 'RunAction':
          effects.runActions.push(c.data)
          break
      }
    }

    return { contexts, stack, shell, effects }
  }


  // Resiliencia del transporte — el mismo contrato que los renderers web (libs/mateu:
  // requestPolicy + retryPolicy + connectivity + pendingActions), reescrito para ESTE core,
  // que no comparte nada con aquéllos: aquí el transporte es `fetch` pelado, no axios.
  //
  // Las diferencias que obliga fetch, y que son la razón de que esto no sea un copy-paste:
  //   - fetch NO tiene timeout. Sin AbortController una petición puede quedarse colgada para
  //     siempre; el usuario ve la pantalla congelada sin error ni fin.
  //   - fetch NO rechaza ante un 4xx/5xx: resuelve con `res.ok === false`. El estado hay que
  //     leerlo y adjuntarlo al error a mano, o abajo no hay forma de distinguir un 500 de un
  //     cable desenchufado.
  //   - un fallo de red es un `TypeError` genérico ("Failed to fetch"), y un abort es un
  //     `DOMException` con `name === 'AbortError'`. Ninguno trae código propio.
  //
  // Todo lo de aquí es puro salvo `fetchWithPolicy`, para que test.mjs lo pueda ejercitar en
  // Node sin navegador ni backend.

  // ── clasificación ────────────────────────────────────────────────────────────────────────

  /** Ceiling por defecto de una petición, en ms. Lo pisa `@Action(timeoutMillis = …)`. */
  const DEFAULT_TIMEOUT_MS = 60000

  const MESSAGES = {
    offline: () => 'Sin conexión. Tus cambios no se han enviado — revisa la red e inténtalo de nuevo.',
    timeout: () => 'El servidor tarda demasiado en responder. Puede que tus cambios no se hayan guardado.',
    server: (s) => `El servidor no ha podido completar la petición${s ? ` (error ${s})` : ''}. Inténtalo de nuevo.`,
    unauthorized: () => 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
    notFound: () => 'Esto ya no está disponible. Puede que se haya movido o borrado.',
    client: (s) => `La petición ha sido rechazada${s ? ` (error ${s})` : ''}.`,
    cancelled: () => '',
    unknown: () => 'Algo ha ido mal. Inténtalo de nuevo.',
  }

  /** Tipos que merece la pena reintentar: o no llegó, o el servidor tuvo un mal momento. */
  const RETRYABLE = new Set(['offline', 'timeout', 'server'])

  /**
   * Traduce un fallo de transporte a `{ kind, message, retryable, status }`.
   *
   * `online` se inyecta para poder testearlo y porque el llamante tiene una señal mejor que
   * `navigator.onLine` (que miente en portales cautivos).
   */
  function classifyRequestFailure(error, options = {}) {
    const err = error || {}
    const status = err.status != null ? err.status : (err.response && err.response.status)
    const name = err.name || ''
    const message = err.message || ''
    const online = options.online !== undefined
      ? options.online
      : (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true)

    const failure = (kind) => ({
      kind,
      message: MESSAGES[kind](status),
      retryable: RETRYABLE.has(kind),
      status,
    })

    // Un abort es una decisión NUESTRA (navegación, timeout propio): nunca es noticia para el
    // usuario… salvo cuando lo disparó el timeout, que sí lo es. Los distingue la marca.
    if (name === 'AbortError' || err.code === 'ERR_CANCELED') {
      return failure(err.__mateuTimedOut ? 'timeout' : 'cancelled')
    }
    if (err.__mateuTimedOut || /timeout/i.test(message)) return failure('timeout')

    if (status == null) {
      // Sin respuesta: o sabemos que no hay red, o la petición murió antes de llegar.
      if (!online) return failure('offline')
      // fetch resuelve un fallo de red como un TypeError sin más señas.
      if (name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(message)) {
        return failure('offline')
      }
      return failure('unknown')
    }
    if (status === 401 || status === 403) return failure('unauthorized')
    if (status === 404 || status === 410) return failure('notFound')
    if (status === 408 || status === 429) return failure('timeout')
    if (status >= 500) return failure('server')
    if (status >= 400) return failure('client')
    return failure('unknown')
  }

  // ── política de reintento ────────────────────────────────────────────────────────────────

  /** Ids de acción del framework que sólo LEEN. '' es la carga de ruta. */
  const ALWAYS_SAFE = new Set(['', '__load__', 'search', '_globalsearch', '_notifications-list'])
  const SAFE_PREFIXES = ['_appcontext-search-', 'search-']

  /**
   * Si repetir `actionId` no puede aplicar el mismo cambio dos veces.
   *
   * Por defecto NO: cuando una petición expira no sabemos si el servidor la procesó, así que
   * repetir un `create` arriesga un duplicado silencioso. `declared` es el opt-in del wire
   * (`@Action(idempotent = true)`), que nunca saca a una lectura conocida de la lista.
   */
  function isIdempotentAction(actionId, declared) {
    if (declared === true) return true
    // Un id AUSENTE es trabajo desconocido; uno VACÍO es la carga de ruta. No son lo mismo.
    if (actionId === undefined || actionId === null) return false
    if (ALWAYS_SAFE.has(actionId)) return true
    return SAFE_PREFIXES.some((p) => actionId.startsWith(p))
  }

  /** Intentos ADEMÁS del primero. */
  const MAX_RETRIES = 2

  /** Espera antes del reintento `attempt` (1-based): exponencial con ±25% de jitter. */
  function retryDelayMs(attempt, random = Math.random) {
    const base = 300 * Math.pow(3, Math.max(0, attempt - 1))
    return Math.round(base * (0.75 + random() * 0.5))
  }

  /**
   * La decisión. `offline` queda deliberadamente fuera: reenviar a los 300 ms con la red caída
   * sólo quema el presupuesto de intentos — de la reconexión se encarga `connectivity`.
   */
  function shouldRetry(failure, attempt, options = {}) {
    if (!options.idempotent) return false
    if (attempt > MAX_RETRIES) return false
    if (!failure.retryable) return false
    return failure.kind === 'timeout' || failure.kind === 'server'
  }

  // ── conectividad ─────────────────────────────────────────────────────────────────────────

  /**
   * Una respuesta honesta a "¿llegamos?".
   *
   * `navigator.onLine` informa del enlace, no del camino: dice true en un portal cautivo y con
   * una VPN que perdió la ruta. Sirve como negativo duro; el positivo lo da nuestro propio
   * tráfico volviendo.
   */
  const connectivity = {
    _linkUp: true,
    _reachable: undefined,
    _listeners: new Set(),
    _started: false,

    start() {
      if (this._started || typeof window === 'undefined') return
      this._started = true
      this._linkUp = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
        ? navigator.onLine : true
      window.addEventListener('online', () => {
        this._linkUp = true
        this._reachable = undefined   // el enlace vuelve, el camino está por demostrar
        this._emit()
      })
      window.addEventListener('offline', () => { this._linkUp = false; this._emit() })
    },

    isOnline() {
      if (!this._linkUp) return false
      return this._reachable !== false
    },

    noteReachable() {
      const was = this.isOnline()
      this._reachable = true
      if (!was) this._emit()
    },

    noteUnreachable() {
      const was = this.isOnline()
      this._reachable = false
      if (was) this._emit()
    },

    subscribe(listener) {
      this._listeners.add(listener)
      return () => this._listeners.delete(listener)
    },

    reset() { this._linkUp = true; this._reachable = undefined },

    _emit() {
      const online = this.isOnline()
      this._listeners.forEach((l) => l(online))
    },
  }

  // ── guard de doble envío ─────────────────────────────────────────────────────────────────

  /** Válvula de seguridad: pasado este tiempo una entrada se da por muerta y se libera. */
  const STALE_MS = 120000

  const pendingActions = {
    _started: new Map(),

    key(componentId, actionId) { return `${componentId || '_'}::${actionId}` },

    /** Reclama el hueco. false = ya hay una idéntica en vuelo y ésta es un duplicado. */
    begin(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      if (startedAt !== undefined && now - startedAt < STALE_MS) return false
      this._started.set(key, now)
      return true
    },

    end(key) { this._started.delete(key) },

    isPending(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      return startedAt !== undefined && now - startedAt < STALE_MS
    },

    reset() { this._started.clear() },
  }

  // ── ganchos de ciclo de vida ─────────────────────────────────────────────────────────────

  /**
   * Cómo la app (VB) se entera de que hay trabajo en vuelo, sin que el core sepa nada de VB.
   * `onStart` recibe {actionId}; `onSettle` recibe {actionId, failure} (failure null si fue bien).
   */
  const transportHooks = { onStart: null, onSettle: null }

  function setTransportHooks(hooks) {
    transportHooks.onStart = (hooks && hooks.onStart) || null
    transportHooks.onSettle = (hooks && hooks.onSettle) || null
  }

  const notify = (which, payload) => {
    const fn = transportHooks[which]
    if (!fn) return
    try { fn(payload) } catch (e) { /* la UI no puede tumbar el transporte */ }
  }

  // ── fetch con política ───────────────────────────────────────────────────────────────────

  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  /**
   * Un envío: aplica el timeout (fetch no trae ninguno) y convierte un 4xx/5xx en un error que
   * LLEVA el status, porque fetch resuelve esos como éxito y abajo no habría forma de saberlo.
   */
  async function sendOnce(url, init, timeoutMillis) {
    // Negativo = SIN ceiling, para un stream que dura lo que dure (LongTask). Distinto de 0 /
    // ausente, que significa "usa el de por defecto".
    const noCeiling = timeoutMillis != null && timeoutMillis < 0
    const ms = timeoutMillis && timeoutMillis > 0 ? timeoutMillis : DEFAULT_TIMEOUT_MS
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    let timedOut = false
    const timer = noCeiling ? null : setTimeout(() => {
      timedOut = true
      if (controller) controller.abort()
    }, ms)
    try {
      const res = await fetch(url, controller ? { ...init, signal: controller.signal } : init)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const error = new Error(`Mateu → HTTP ${res.status}${text ? `: ${text}` : ''}`)
        error.status = res.status
        throw error
      }
      return res
    } catch (e) {
      // Un abort disparado por NUESTRO timeout debe leerse como timeout, no como cancelación:
      // el usuario sí tiene que enterarse.
      if (timedOut && e) e.__mateuTimedOut = true
      throw e
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  /**
   * La cabecera con el token, si el bootstrap dejó uno.
   *
   * La página de bootstrap autentica contra Keycloak y guarda el token en
   * `localStorage.__mateu_auth_token`, refrescándolo al caducar. Hasta que esto existió, NADA lo
   * leía: el bridge hacía cada llamada sin cabecera, el gateway respondía 401 y el clasificador de
   * abajo lo traducía a "Tu sesión ya no es válida" — un mensaje cierto sobre el 401 y engañoso
   * sobre la causa, porque la sesión estaba perfectamente viva y la petición sencillamente no la
   * presentaba. La consola cargaba, se quedaba sin un solo menú, y el panel de chat tampoco
   * respondía.
   *
   * Va aquí y no en los tres sitios que construyen cabeceras en transport.mjs, por lo mismo que en
   * el otro renderer es un interceptor de axios y no un parámetro de cada llamada: un punto único
   * que un cuarto sitio no puede olvidar.
   *
   * `localStorage` no existe en Node, donde corre test.mjs, así que se consulta con guarda; y un
   * `Authorization` que el llamante ya haya puesto manda sobre este, que es lo que permite probar
   * el camino sin tocar el almacenamiento.
   */
  function authHeaders(init) {
    const already = init && init.headers &&
      (init.headers.Authorization || init.headers.authorization)
    if (already) return null
    let token = null
    try {
      token = typeof localStorage !== 'undefined' ? localStorage.getItem('__mateu_auth_token') : null
    } catch (e) {
      // Un navegador con el almacenamiento bloqueado. Sin token se sigue: el backend dirá que no,
      // que es mejor que no llamar.
      token = null
    }
    return token ? { Authorization: 'Bearer ' + token } : null
  }

  /**
   * El punto único por el que pasa TODO el tráfico de este renderer.
   *
   * Y por eso es donde se adjunta el token: es el cliente de Mateu de este renderer, igual que
   * AxiosMateuApiClient lo es del otro.
   *
   * Reenvía mientras el fallo sea transitorio Y la acción sea segura de repetir; cada intento
   * resuelto enseña al rastreador de conectividad si el backend responde — una respuesta
   * demuestra el camino mejor que cualquier bandera del navegador. Los N intentos son UN solo
   * resultado de cara a la UI: un estado de carga, un mensaje.
   */
  async function fetchWithPolicy(url, init, options = {}) {
    const auth = authHeaders(init)
    if (auth) init = { ...(init || {}), headers: { ...((init && init.headers) || {}), ...auth } }
    const actionId = options.actionId
    const idempotent = isIdempotentAction(actionId, options.idempotent)
    notify('onStart', { actionId })
    let attempt = 0
    for (;;) {
      try {
        const res = await sendOnce(url, init, options.timeoutMillis)
        connectivity.noteReachable()
        notify('onSettle', { actionId, failure: null })
        return res
      } catch (error) {
        const failure = classifyRequestFailure(error, { online: connectivity.isOnline() })
        if (failure.kind === 'offline') connectivity.noteUnreachable()
        attempt++
        if (!shouldRetry(failure, attempt, { idempotent })) {
          // El error viaja CLASIFICADO: la UI enseña `failure.message` en vez de "Failed to
          // fetch", y decide si ofrecer reintentar.
          error.failure = failure
          notify('onSettle', { actionId, failure })
          throw error
        }
        await delay(retryDelayMs(attempt))
      }
    }
  }


  // Accesibilidad del renderer VB — la parte que NO traen los componentes oj-*.
  //
  // Medido antes de escribir nada (axe-core sobre la app servida): la composición de oj-sp-*
  // sale prácticamente limpia, igual que pasaba con Vaadin, porque esos componentes traen su
  // propia accesibilidad. Los huecos reales son los de una SPA, que axe no puede evaluar:
  // al cambiar de ruta no cambia la página, así que un lector de pantalla no tiene NADA que
  // anunciar y el foco se queda donde estaba — normalmente en el enlace del menú que se acaba
  // de pulsar, obligando a tabular por toda la shell para llegar al contenido pedido.
  //
  // Vive en poc/ (fuente única) para que make-amd.mjs lo empaquete en el bridge y la app lo
  // use desde las chains, igual que el resto del core.

  // ── región viva ──────────────────────────────────────────────────────────────────────────

  const REGION_STYLE = [
    'position:absolute', 'width:1px', 'height:1px', 'margin:-1px', 'padding:0',
    'overflow:hidden',
    // clip, NO display:none ni visibility:hidden: esas dos sacan el nodo del árbol de
    // accesibilidad, que es justo lo contrario de lo que hace falta aquí.
    'clip:rect(0 0 0 0)', 'clip-path:inset(50%)', 'white-space:nowrap', 'border:0',
  ].join(';')

  const regions = {}

  function regionFor(politeness) {
    if (typeof document === 'undefined' || !document.body) return null
    const existing = regions[politeness]
    if (existing && existing.isConnected) return existing
    const region = document.createElement('div')
    region.setAttribute('aria-live', politeness)
    region.setAttribute('aria-atomic', 'true')
    region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
    region.setAttribute('data-mateu-live-region', politeness)
    region.style.cssText = REGION_STYLE
    document.body.appendChild(region)
    regions[politeness] = region
    return region
  }

  /**
   * Crea las regiones por adelantado.
   *
   * No es opcional: una región creada y rellenada en el mismo tick a menudo NO se anuncia,
   * porque la tecnología asistiva vigila mutaciones de regiones que ya conocía.
   */
  function installAnnouncer() {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', installAnnouncer, { once: true })
      return
    }
    regionFor('polite')
    regionFor('assertive')
  }

  /**
   * Dice `message` a la tecnología asistiva. No pinta nada.
   *
   * `assertive` interrumpe y es para lo que el usuario no puede perderse (un guardado que
   * falló); `polite` espera una pausa y es para lo rutinario (dónde acaba de aterrizar). Usar
   * assertive para todo hace la app inusable, así que es opt-in.
   */
  function announce(message, options = {}) {
    const text = (message == null ? '' : String(message)).trim()
    if (!text) return
    const region = regionFor(options.politeness || 'polite')
    if (!region) return
    if (region.textContent === text) {
      // Repetir el mismo mensaje es un caso real (dos guardados fallidos seguidos) y una
      // región cuyo texto no cambia no anuncia nada: se limpia y se repone.
      region.textContent = ''
      setTimeout(() => { region.textContent = text }, 60)
      return
    }
    region.textContent = text
  }

  // ── foco tras navegar ────────────────────────────────────────────────────────────────────

  /**
   * Lleva el foco al contenido recién cargado.
   *
   * Se busca el primer encabezado del área de contenido; si no hay, el propio contenedor, al
   * que se le da `tabindex="-1"` para que pueda recibir foco por programa sin añadir una
   * parada de tabulación propia.
   */
  function focusContent() {
    if (typeof document === 'undefined') return false
    const root = document.querySelector('#vbRouterContent') || document.querySelector('.oj-web-applayout-content-nopad')
    if (!root) return false

    // Candidatos en orden de preferencia. El encabezado tiene que llevar TEXTO: la shell pinta
    // un <h1> vacío hasta que llega el título, y un encabezado vacío no es focusable (ni sería
    // útil anunciarlo) — el intento fallaba en silencio y el foco se quedaba donde estaba.
    const headings = [...root.querySelectorAll('h1, h2, [role="heading"]')]
      .filter((h) => (h.textContent || '').trim().length > 0)
    const candidates = [...headings, root]

    for (const target of candidates) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      try { target.focus({ preventScroll: true }) } catch (e) { target.focus() }
      // Comprobar que PRENDIÓ: focus() sobre un elemento sin caja no hace nada y no avisa.
      if (document.activeElement === target || (document.activeElement && target.contains(document.activeElement))) {
        return true
      }
    }
    return false
  }

  let hasNavigated = false

  /**
   * Anuncia la llegada a una pantalla y deja el foco en ella.
   *
   * Dos límites deliberados, y los dos importan:
   *
   *  - Sólo en navegaciones REALES. Un re-render no debe tocar el foco: se lo arrancaría al
   *    usuario del campo que está editando.
   *  - NUNCA en la primera carga. Ahí el documento ya empieza arriba, y llevar el foco al
   *    contenido deja el enlace de salto por DETRÁS del punto de partida: el primer tabulador
   *    del usuario ya no lo alcanza y el menú queda sólo a base de Shift+Tab. Se anuncia el
   *    título igualmente, que es lo que aporta valor en esa primera pantalla.
   */
  function announceNavigation(title) {
    announce(title)
    if (hasNavigated) focusContentSoon()
    hasNavigated = true
  }

  /**
   * Intenta llevar el foco al contenido durante unos cuantos frames.
   *
   * VB actualiza los bindings de forma asíncrona: en el momento en que la chain de navegación
   * termina, el contenido nuevo AÚN NO está en el DOM. Enfocar ahí prende sobre el contenido
   * viejo y se pierde en cuanto se reemplaza — que es exactamente lo que pasaba. Se reintenta
   * hasta que prenda, o se abandona: mejor no mover el foco que dejarlo en un sitio raro.
   */
  function focusContentSoon(framesLeft = 12) {
    if (typeof requestAnimationFrame === 'undefined') { focusContent(); return }
    requestAnimationFrame(() => {
      if (focusContent()) return
      if (framesLeft > 0) focusContentSoon(framesLeft - 1)
    })
  }

  /** Test seam: olvida que ya se navegó. */
  function resetNavigationState() { hasNavigated = false }

  // ── salto al contenido ───────────────────────────────────────────────────────────────────

  /**
   * Monta el enlace "saltar al contenido" como PRIMER elemento del body (WCAG 2.4.1).
   *
   * Cada pantalla empieza por el mismo menú. Sin una vía para saltarlo, quien navega con
   * teclado paga ese menú entero en cada pantalla antes de llegar a lo que venía a hacer.
   *
   * Oculto por transform y no por display:none, porque un elemento con display:none no puede
   * recibir foco — y entonces el enlace sería inalcanzable, que es justo lo contrario.
   */
  function mountSkipLink(label = 'Saltar al contenido') {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => mountSkipLink(label), { once: true })
      return
    }
    if (document.querySelector('.mateu-skip-link')) return
    const link = document.createElement('button')
    link.className = 'mateu-skip-link'
    link.textContent = label
    link.addEventListener('click', focusContent)
    document.body.insertBefore(link, document.body.firstChild)
  }

  // ── estado de ocupado en el control pulsado ──────────────────────────────────────────────

  /**
   * Marca ocupado el control que el usuario pulsó, mientras su acción está en vuelo.
   *
   * La barra global responde a "¿está ocupada la app?", pero la pregunta que se hace quien está
   * en una conexión lenta es "¿se ha enterado de mi clic?". Sin esto pulsa Guardar, no cambia
   * nada, y vuelve a pulsar.
   *
   * Anima la OPACIDAD del propio elemento y no dibuja un spinner en ::after: sobre un shadow
   * host el pseudo-elemento no se pinta (comprobado en los renderers web con un
   * `inset:0;background:red` sobre un vaadin-button vivo), y no hay garantía de que los
   * componentes de JET no lo sean.
   */
  function markPending(element) {
    if (!element || !element.setAttribute) return
    if (element.hasAttribute('data-mateu-pending')) return
    element.setAttribute('data-mateu-pending', '')
    element.setAttribute('aria-busy', 'true')
  }

  function clearPending(element) {
    if (!element || !element.removeAttribute) return
    element.removeAttribute('data-mateu-pending')
    element.removeAttribute('aria-busy')
  }

  /**
   * El control realmente pulsado a partir del evento, o null si no lo hay.
   *
   * Sólo se decora una lista CERRADA de cosas con pinta de botón: atenuar un contenedor (una
   * tabla, un formulario entero) sería peor que no mostrar nada, y una acción puede dispararse
   * desde cualquier sitio — un trigger, un atajo, el clic de una fila.
   */
  const INTERACTIVE = 'oj-button, oj-menu-button, oj-c-button, button, [role="button"], a[href]'

  function pressedControl(event) {
    const target = event && (event.target || event.currentTarget)
    if (!target || !target.closest) return null
    return target.closest(INTERACTIVE)
  }

  /**
   * Sigue el control pulsado a nivel de DOCUMENTO y lo marca mientras haya trabajo en vuelo.
   *
   * Enhebrar el evento por cada chain no vale: los botones de la app pasan por chains
   * distintas (toolbar, listado, wizard, isla…) y cualquiera nueva se olvidaría de hacerlo. En
   * cambio el clic siempre pasa por el documento, y el transporte siempre avisa de cuándo
   * empieza y acaba — así que emparejar las dos señales cubre todos los caminos, incluidos los
   * que aún no existen.
   *
   * La ventana de gracia evita marcar un control por trabajo que no desencadenó él (un trigger
   * OnLoad, un autosave): sólo cuenta si la petición sale justo detrás del clic.
   */
  const PRESS_GRACE_MS = 400
  let lastPress = { control: null, at: 0 }
  let markedControl = null

  function trackPressedControls() {
    if (typeof document === 'undefined') return
    document.addEventListener('click', (e) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : []
      const origin = path[0] || e.target
      const control = origin && origin.closest ? origin.closest(INTERACTIVE) : null
      lastPress = { control, at: Date.now() }
    }, true)
  }

  /** Llamar desde el hook onStart del transporte. */
  function markPressedControlBusy() {
    if (!lastPress.control) return
    if (Date.now() - lastPress.at > PRESS_GRACE_MS) return
    markedControl = lastPress.control
    markPending(markedControl)
  }

  /** Llamar desde el hook onSettle. */
  function clearPressedControlBusy() {
    clearPending(markedControl)
    markedControl = null
  }

  // ── reintento a nivel de chain ───────────────────────────────────────────────────────────

  /**
   * Qué hay que rehacer tras un fallo.
   *
   * Se guarda un DESCRIPTOR, no un cierre. Un cierre atrapa el `context` de VB de la ejecución
   * que falló, y ese contexto ya no sirve cuando el usuario pulsa Reintentar un segundo después:
   * la llamada no hace nada y falla en silencio (me pasó). Con un descriptor, quien reintenta
   * usa SU contexto, que está vivo.
   *
   * Reenviar sólo la petición tampoco valdría: una respuesta que nadie procesa no cambia nada en
   * pantalla — la misma lección que en los renderers web. Por eso lo que se rehace es la acción
   * o la navegación ENTERA.
   */
  let lastRetry = null

  /** `{ kind: 'navigate', route }` o `{ kind: 'action', actionId, parameters }`. */
  function setLastRetry(descriptor) {
    lastRetry = descriptor && descriptor.kind ? descriptor : null
  }

  function hasLastRetry() { return !!lastRetry }

  /** Devuelve el descriptor y lo olvida: un reintento se ofrece una vez. */
  function takeLastRetry() {
    const descriptor = lastRetry
    lastRetry = null
    return descriptor
  }


  // Static-bundle "no backend" mode for the VB/Redwood renderer — the same contract as the web
  // renderers' libs/mateu (bundleStore.ts), rewritten for THIS core (which shares nothing with them:
  // here the transport is `fetch` in transport.mjs, not axios). A build-time exporter (Mateu's
  // `mateu:bundle` goal) OR the runtime endpoint (GET /mateu/v3/bundle) renders each declared route's
  // initial load (actionId '') to wire JSON and writes a manifest.json; when a bundle is present we
  // answer route LOADS from it instead of POSTing to the server, so the VB app runs from static
  // assets with no backend. Live data still comes from external endpoints; ACTIONS still need a
  // backend (they fall through to the normal transport).
  //
  // Pure except loadBundleManifest, so test.mjs can exercise it in Node with a fetch double.

  // syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
  let increments
  // :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure.
  let templates = []
  // The in-flight manifest load (if any), so a route load can await it before hitting the backend.
  let pending
  // The mount's authored route registry, as shipped in the manifest: a statically deployed mount has
  // no server left to ask what a URL means, so the parameters a route pins or seeds travel as data.
  let routeEntries = []

  /** The `:name` segments of a route pattern, in order. */
  const paramNamesOf = (route) =>
    route.split('/').filter((s) => s.startsWith(':') && s.length > 1).map((s) => s.substring(1))

  const normRoute = (s) => (s || '').replace(/^\/+/, '').replace(/\/+$/, '')

  /** The registry entry answering a concrete path, plus the path params read off it. Static routes
   *  before parameterised ones (so `orders/new` is never swallowed by `orders/:id`) and, among
   *  parameterised matches, the most specific — matching must not depend on declaration order.
   *  Mirrors the server's RouteTable.match and the web's bundleStore. */
  function matchRouteEntry(path) {
    const target = normRoute(path === '_no_route' ? '' : path)
    const targetSegments = target === '' ? [] : target.split('/')
    let best
    for (const entry of routeEntries) {
      const pattern = normRoute(entry.route)
      const patternSegments = pattern === '' ? [] : pattern.split('/')
      if (patternSegments.length !== targetSegments.length) continue
      const pathParams = {}
      let matches = true
      for (let i = 0; i < patternSegments.length; i++) {
        const seg = patternSegments[i]
        if (seg.startsWith(':') && seg.length > 1) pathParams[seg.substring(1)] = targetSegments[i]
        else if (seg !== targetSegments[i]) { matches = false; break }
      }
      if (!matches) continue
      if (!best || paramNamesOf(pattern).length < paramNamesOf(normRoute(best.entry.route)).length) {
        best = { entry, pathParams }
      }
    }
    return best
  }

  /** Applies the registry's parameters to a pre-rendered increment, in the SAME order the server and
   *  the web renderers use — otherwise one route would behave differently depending on which renderer
   *  and whether a backend happens to be present:
   *
   *    fixed  >  path  >  what the increment already carries  >  defaults
   *
   *  Untouched (same reference) when no entry answers the path. */
  function applyRouteParams(syncPath, increment) {
    const match = matchRouteEntry(syncPath)
    if (!match) return increment
    const defaults = match.entry.defaultParams || {}
    const fixed = match.entry.fixedParams || {}
    const pathParams = match.pathParams
    if (!Object.keys(defaults).length && !Object.keys(fixed).length && !Object.keys(pathParams).length) {
      return increment
    }
    return {
      ...increment,
      fragments: (increment.fragments || []).map((f) => ({
        ...f,
        state: { ...defaults, ...(f.state || {}), ...pathParams, ...fixed },
        data: { ...defaults, ...(f.data || {}), ...pathParams, ...fixed },
      })),
    }
  }

  /** The registry entry answering a path, for callers that need its definition or view model. */
  const getRouteEntry = (syncPath) => {
    const m = matchRouteEntry(syncPath)
    return m ? m.entry : undefined
  }

  /** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors transport.callMateu and the web:
   *  leading slash stripped, blank/root → `_no_route`. */
  function toSyncPath(route) {
    const r = route && route.startsWith('/') ? route.substring(1) : (route || '')
    return r === '' ? '_no_route' : r
  }

  /** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode OFF (the
   *  app falls back to the backend at baseUrl). */
  function loadBundleManifest(url, fetchImpl) {
    const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
    pending = (async () => {
      try {
        if (!f) return
        const res = await f(url)
        if (!res || !res.ok) return
        const manifest = await res.json()
        const map = new Map()
        const tpls = []
        for (const e of (manifest.entries || [])) {
          if (!e.ok || !e.json) continue
          try {
            const inc = JSON.parse(e.json)
            if (e.routePattern) {
              tpls.push({ regex: new RegExp(e.routePattern), paramNames: e.paramNames || [], increment: inc })
            } else {
              map.set(e.syncPath, inc)
            }
          } catch (err) {
            // skip a malformed entry, keep the rest
          }
        }
        increments = map
        templates = tpls
        routeEntries = (manifest.routes && manifest.routes.routes) || []
      } catch (e) {
        // leave bundle mode off
      }
    })()
    return pending
  }

  /** Await the in-flight manifest load (if any) — so a route load doesn't race the fetch and hit the
   *  backend before the bundle is ready. Resolves immediately when nothing is loading. */
  const awaitBundle = () => pending || Promise.resolve()

  /** True once a non-empty bundle has been loaded (exact routes or :param templates). */
  const hasBundle = () =>
    (increments !== undefined && increments.size > 0) || templates.length > 0

  /** The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend).
   *  The registry's parameters are applied on the way out, so a statically served route behaves like
   *  the same route served by the backend. */
  const getBundledIncrement = (syncPath) => {
    const inc = increments ? increments.get(syncPath) : undefined
    return inc === undefined ? undefined : applyRouteParams(syncPath, inc)
  }

  /** Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES; on a hit, return the
   *  pre-rendered structure with the extracted params INJECTED into every fragment's state and data —
   *  so a `${state.<param>}` in a client-side data URL resolves to the real value. undefined = no hit. */
  function matchBundledTemplate(syncPath) {
    for (const t of templates) {
      const m = t.regex.exec(syncPath)
      if (!m) continue
      const params = {}
      t.paramNames.forEach((name, i) => { params[name] = m[i + 1] })
      const withPathParams = {
        ...t.increment,
        // params LAST so the real value wins over the render-time placeholder
        fragments: (t.increment.fragments || []).map((f) => ({
          ...f,
          state: { ...(f.state || {}), ...params },
          data: { ...(f.data || {}), ...params },
        })),
      }
      // …and then the registry's own, so a pinned parameter still outranks the path.
      return applyRouteParams(syncPath, withPathParams)
    }
    return undefined
  }

  /** The bundled increment for a route (exact match then :param template), re-targeted so its
   *  fragments land on the loading surface: the exporter had no initiator, so a fragment's
   *  targetComponentId is null — reduceContexts routes null → HOST, but a load INTO an island must
   *  target that island, so stamp the initiator (matches the web intercept). undefined = not bundled. */
  function bundledIncrementFor(route, initiator) {
    const syncPath = toSyncPath(route)
    const inc = getBundledIncrement(syncPath) || matchBundledTemplate(syncPath)
    if (!inc) return undefined
    return {
      ...inc,
      fragments: (inc.fragments || []).map((f) =>
        f.targetComponentId ? f : { ...f, targetComponentId: initiator || '' }),
    }
  }

  /** Test hook: seed/clear the in-memory bundle directly. */
  function __setBundleForTests(m, t, r) {
    increments = m
    templates = t || []
    routeEntries = r || []
    pending = undefined
  }


  // Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
  // "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
  // sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
  // testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).


  /** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction). */
  async function callMateu(base, body, options = {}) {
    const bare = (body.route || '').replace(/^\//, '')
    const res = await fetchWithPolicy(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appState: {},
        componentState: {},
        parameters: {},
        initiatorComponentId: '',
        consumedRoute: '',
        serverSideType: undefined,
        ...body,
        route: bare ? `/${bare}` : '',
      }),
    }, { actionId: body.actionId, timeoutMillis: options.timeoutMillis, idempotent: options.idempotent })
    return res.json()
  }

  /** Bootstrap de la shell: el App raíz solo resuelve por el endpoint genérico.
   *  Static-bundle: la shell NO se exporta (el bundle guarda cargas de ruta, no el __load__ del App),
   *  así que en modo híbrido (bundle + backend) el menú sale del backend como siempre; pero si el
   *  backend NO está (despliegue estático puro) y el bundle trae la ruta raíz, se cae a ella para que
   *  la app arranque igual. Sólo en el fallo — el camino feliz no cambia. */
  async function bootstrapShell(base, initiator = 'shell') {
    await awaitBundle()
    try {
      const res = await fetchWithPolicy(`${base}/mateu/v3/components/_/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
      }, { actionId: '__load__' })
      return res.json()
    } catch (e) {
      if (hasBundle()) {
        const bundled = bundledIncrementFor('', initiator)
        if (bundled) return bundled
      }
      throw e
    }
  }

  /** Ruta INTERNA de un mediador/isla tras un flip de state._route: base del outbound +
   *  flip + marcadores query (los ?_embeddedMediator=1&_inline=1 deben seguir viajando). */
  function composeInnerRoute(outboundRoute, flip) {
    if (!flip || flip === '/' ) return outboundRoute
    const queryIndex = outboundRoute.indexOf('?')
    const base = queryIndex >= 0 ? outboundRoute.slice(0, queryIndex) : outboundRoute
    const query = queryIndex >= 0 ? outboundRoute.slice(queryIndex) : ''
    return base + flip + query
  }

  /** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…).
   *  Static-bundle: si hay manifest cargado, la carga se responde DESDE el bundle (sin backend);
   *  se espera al fetch del manifest en vuelo (la primera carga puede adelantarlo) y, si la ruta no
   *  está en el bundle, se cae al backend — así un despliegue híbrido (bundle + backend) sigue yendo. */
  const loadRoute = async (base, route, initiator = '', extra = {}) => {
    await awaitBundle()
    if (hasBundle()) {
      const bundled = bundledIncrementFor(route, initiator)
      if (bundled) return bundled
    }
    return callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })
  }

  /** Acción saliente: arma la request desde el CONTEXTO — "manda el estado que ya tienes".
   *  Los 4 campos de ruta salen del `outbound` que loadRouteInto estampó al cargar el
   *  contexto (un mediador necesita consumedRoute + serverSideType también en las acciones). */
  function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
    const outbound = (ctx && ctx.outbound) || {}
    const initiator = (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || ''
    // Guard de doble envío. Una lectura queda EXENTA de la exclusividad: el guard existe porque
    // un segundo POST de una escritura significa una segunda fila, mientras que una segunda
    // lectura sólo significa datos más frescos — y bloquearlas rompería el type-ahead, donde la
    // búsqueda de "mad" se descartaría por estar en vuelo la de "ma".
    const exclusive = !isIdempotentAction(actionId, extra && extra.idempotent)
    const key = pendingActions.key(initiator, actionId)
    if (exclusive && !pendingActions.begin(key)) {
      // Duplicado: se descarta ANTES de construir la petición.
      return Promise.resolve(null)
    }
    const release = () => { if (exclusive) pendingActions.end(key) }
    return callMateu(base, {
      route: outbound.route || route,
      consumedRoute: outbound.consumedRoute || '',
      actionId,
      componentState: componentState || (ctx && ctx.state) || {},
      serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
      initiatorComponentId: initiator,
      ...extra,
    }, { timeoutMillis: extra && extra.timeoutMillis, idempotent: extra && extra.idempotent })
      .then((inc) => { release(); return inc }, (e) => { release(); throw e })
  }

  /** Acción SSE (Action.sse(true), p.ej. LongTask): POST {base}/mateu/v3/sse/{route} con
   *  Accept text/event-stream — la respuesta es un STREAM de UIIncrements (data: …\n\n).
   *  Los increments se ENTREGAN EN VIVO vía `extra.onIncrement(inc)` (async; el diálogo de
   *  progreso del LongTask se pinta mientras el stream avanza); si el callback devuelve
   *  true, el increment se considera CONSUMIDO y se excluye de la lista devuelta. Sin
   *  callback, comportamiento clásico: lista completa al acabar. */
  async function runMateuActionSse(base, ctx, route, actionId, componentState, extra = {}) {
    const { onIncrement, ...bodyExtra } = extra || {}
    const outbound = (ctx && ctx.outbound) || {}
    const effectiveRoute = outbound.route || route || ''
    const bare = effectiveRoute.replace(/^\//, '')
    // Sin timeout: un LongTask mantiene el stream abierto por diseño, así que un ceiling lo
    // mataría a mitad. Pasa igualmente por la política para que el fallo llegue clasificado.
    const res = await fetchWithPolicy(`${base}/mateu/v3/sse/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        appState: {},
        componentState: componentState || (ctx && ctx.state) || {},
        parameters: {},
        initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
        consumedRoute: outbound.consumedRoute || '',
        serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
        ...bodyExtra,
        route: bare ? `/${bare}` : '',
        actionId,
      }),
    }, { actionId, timeoutMillis: -1 })
    const increments = []
    const handle = async (raw) => {
      const line = raw.trim()
      if (!line.startsWith('data:')) return
      const inc = JSON.parse(line.slice(5).trim())
      const consumed = onIncrement ? await onIncrement(inc) : false
      if (!consumed) increments.push(inc)
    }
    if (res.body && res.body.getReader) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let cut
        while ((cut = buffer.indexOf('\n\n')) >= 0) {
          await handle(buffer.slice(0, cut))
          buffer = buffer.slice(cut + 2)
        }
      }
      if (buffer.trim()) await handle(buffer)
    } else {
      for (const chunk of (await res.text()).split('\n\n')) await handle(chunk)
    }
    return increments
  }

  /**
   * Un mediador cuyo WRAPPER llega como App de chrome (ClientSide type App) en vez de envuelto en un
   * ServerSide. Es la forma que hoy manda el backend al abrir una opción de menú: el mismo App que en
   * el bootstrap, pero pedido para una SUB-ruta (route por debajo de rootRoute). reduceContexts lo
   * absorbe como shell y el contexto queda vacío, así que mediatorOf(host) no lo detecta y la 2ª carga
   * —la del contenido real: search form + listado del crud— nunca se dispara. Se lee entonces del
   * incremento: si trae un App cuyo rootRoute es prefijo de la ruta pedida, hay contenido que buscar.
   *
   * La raíz del app (route === rootRoute) es la shell/home y NO pasa por aquí: la resuelve el
   * bootstrap. Sólo una navegación por debajo de la raíz necesita el segundo salto.
   */
  function mediatorFromShellApp(increment, route) {
    for (const fr of increment?.fragments || []) {
      const c = fr.component
      const md = c?.metadata
      if (c?.type !== 'ClientSide' || md?.type !== 'App') continue
      const rootRoute = md.rootRoute || ''
      if (rootRoute && route && route.startsWith(`${rootRoute}/`)) {
        return {
          rootRoute: md.homeConsumedRoute || rootRoute,
          serverSideType: md.homeServerSideType ?? md.serverSideType,
        }
      }
    }
    return null
  }

  /**
   * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
   * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
   * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
   */
  async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
    // el INCREMENTO crudo se conserva: la 1ª carga de una opción de menú llega como App de mediador
    // (ClientSide type App), que reduceContexts encamina al CHROME (shell) y no al contexto —
    // mediatorOf(host) no lo ve, así que hay que sacar el mediador del incremento mismo.
    const firstIncrement = await loadRoute(base, route, targetId, extra)
    let next = reduceContexts(reg, firstIncrement)
    const ctxId = targetId === '' ? HOST_ID : targetId
    let outbound = { route, consumedRoute: '', serverSideType: undefined }
    // las ACTIONS del componente (con su flag sse) viajan en el WRAPPER del mediador —
    // la carga de contenido las pierde, así que se conservan aquí
    const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
    const wrapperActions = (wrapperTree && wrapperTree.actions) || []
    const info = mediatorOf(next.contexts[ctxId]) || mediatorFromShellApp(firstIncrement, route)
    if (info) {
      outbound = {
        route,
        consumedRoute: info.rootRoute || route,
        serverSideType: info.serverSideType,
      }
      next = reduceContexts(
        next,
        await loadRoute(base, route, targetId, {
          ...extra,
          consumedRoute: outbound.consumedRoute,
          serverSideType: outbound.serverSideType,
        }),
      )
    }
    // el contexto RECUERDA cómo se cargó: las acciones salientes reconstruyen los campos
    // de ruta desde aquí (structural sharing: solo cambia la ref de esta entrada).
    // sseActionIds: acciones anunciadas Action.sse(true) — van por el endpoint /sse
    next = {
      ...next,
      contexts: {
        ...next.contexts,
        [ctxId]: {
          ...next.contexts[ctxId],
          outbound,
          sseActionIds: wrapperActions.filter((a) => a && a.sse).map((a) => a.id),
        },
      },
    }
    return next
  }

  // ── menús federados ────────────────────────────────────────────────────────────────────────
  //
  // Una shell declara secciones que sirve OTRO pod: `RemoteMenu("/_workflow")`. El árbol que llega
  // en el bootstrap trae esas opciones marcadas `remote` y SIN hijos — los hijos son del pod, y hay
  // que ir a buscarlos. Hasta ahora este renderer no lo hacía: pintaba el rótulo que la shell había
  // escrito y nada debajo, que se lee como "ese servicio no tiene pantallas" en vez de como "nadie
  // se lo ha preguntado".
  //
  // Lo que sigue es la mitad fácil. La otra está en la navegación: una entrada traída de otro pod
  // solo se puede cargar llamando a ESE pod, y este bridge llamaba siempre al base de la shell. Por
  // eso cada opción adoptada queda registrada en `remoteRoutes`, y la cadena de navegación consulta
  // ahí a dónde tiene que ir. Sin esa segunda mitad, expandir el menú es peor que no expandirlo:
  // aparecen entradas que al pulsarlas no llevan a ninguna parte.

  /** Ruta de menú → dónde vive de verdad. La llena expandRemoteMenus; la lee la navegación. */
  const remoteRoutes = new Map()

  /** Dónde vive una ruta de menú, o undefined si la sirve la propia shell. */
  function remoteRouteOf(route) {
    if (route == null) return undefined
    return remoteRoutes.get(route) || remoteRoutes.get(String(route).replace(/^\//, ''))
  }

  const childrenOf = (option) => option.submenus || option.submenu || []

  /** Las opciones remotas del árbol, a cualquier profundidad.
   *  No se baja DENTRO de una remota: lo que cuelgue de ella es del pod, y aún no ha contestado. */
  function collectRemoteMenus(menu, found = []) {
    for (const option of menu || []) {
      if (option.remote) found.push(option)
      else if (childrenOf(option).length) collectRemoteMenus(childrenOf(option), found)
    }
    return found
  }

  /** El menú del App que contesta un pod, o null si no contestó con uno. */
  function appMenuOf(increment) {
    for (const fragment of (increment && increment.fragments) || []) {
      const md = (fragment.component && fragment.component.metadata) || {}
      if (fragment.component && fragment.component.type === 'ClientSide' && md.type === 'App') {
        return { menu: md.menu || [], route: md.route || '', serverSideType: md.serverSideType }
      }
    }
    return null
  }

  /**
   * Marca las hojas traídas de un pod con dónde vive ese pod.
   *
   * Solo las que no traen `baseUrl` propio: un pod puede a su vez federar, y su respuesta ya viene
   * resuelta. Un grupo no se marca, se recorre — lo que navega es la hoja.
   */
  function adoptRemote(menu, option, app) {
    const serverSideType = option.serverSideType ? option.serverSideType : app.serverSideType
    for (const child of menu || []) {
      if (child.baseUrl) continue
      if (childrenOf(child).length) {
        adoptRemote(childrenOf(child), option, app)
        continue
      }
      child.baseUrl = option.baseUrl
      child.consumedRoute = app.route || ''
      child.serverSideType = serverSideType
      child.uriPrefix = option.route
      const descriptor = {
        baseUrl: option.baseUrl,
        consumedRoute: app.route || '',
        serverSideType,
        uriPrefix: option.route,
      }
      // Por la ruta tal cual, y por la que verá la navegación cuando shellNavOf le quite el
      // prefijo del padre. Dos claves para la misma entrada es más barato que reconstruir
      // aquí el cálculo que hace el nav, y que se desincronicen luego.
      const route = child.route || child.path || ''
      remoteRoutes.set(route, descriptor)
      remoteRoutes.set(String(route).replace(/^\//, ''), descriptor)
    }
  }

  function spliceRemote(menu, answers) {
    const out = []
    for (const option of menu || []) {
      if (option.remote) {
        const app = answers.get(option)
        if (app) {
          adoptRemote(app.menu, option, app)
          out.push(...app.menu)
        } else {
          // El pod no contestó. Se queda el rótulo: una sección vacía se entiende, una que
          // desaparece parece que nunca existió.
          out.push(option)
        }
      } else if (childrenOf(option).length) {
        out.push({ ...option, submenus: spliceRemote(childrenOf(option), answers) })
      } else {
        out.push(option)
      }
    }
    return out
  }

  /**
   * Pide a cada pod su menú y lo pone donde estaba su opción.
   *
   * En paralelo, y un pod que falle no tumba al resto: su sección se queda como estaba en vez de
   * llevarse por delante las que sí contestaron.
   */
  async function expandRemoteMenus(menu) {
    const remotes = collectRemoteMenus(menu)
    if (!remotes.length) return menu
    const answers = new Map()
    await Promise.all(remotes.map(async (option) => {
      try {
        const increment = await callMateu(option.baseUrl || '', {
          route: option.route || '',
          actionId: '',
          consumedRoute: '_empty',
          initiatorComponentId: (option.baseUrl || '') + '#' + (option.route || ''),
          parameters: option.params || {},
        })
        const app = appMenuOf(increment)
        if (app) answers.set(option, app)
      } catch (e) {
        // Ya reportado por el transporte. Aquí solo se decide no propagarlo.
      }
    }))
    return spliceRemote(menu, answers)
  }

  return {
    HOST_ID,
    reduceContexts,
    collectFields,
    collectActions,
    collectIslands,
    mediatorOf,
    buildOverlay,
    dynFormMetadataOf,
    actionsOf,
    summarizeHost,
    findByType,
    listingOf,
    onLoadTriggers,
    fieldListOf,
    overlayOf,
    eventTriggersOf,
    dismissOverlay,
    shellNavOf,
    ojIconOf,
    longTaskWatcher,
    findAllByType,
    cardOf,
    welcomeOf,
    generalOverviewOf,
    itemOverviewOf,
    itemOverviewPageOf,
    autoSaveOf,
    taskQueueOf,
    emptyStateOf,
    interpolate,
    islandContentOf,
    mergeNestedContent,
    hostContentOf,
    wizardForwardOf,
    bannersOf,
    pageStyleOf,
    pageToolbarOf,
    entityHeaderOf,
    collectTexts,
    foldoutOf,
    wizardOf,
    callMateu,
    bootstrapShell,
    loadRoute,
    loadRouteInto,
    composeInnerRoute,
    // menús federados: la shell los expande al arrancar, la navegación consulta a qué pod ir
    expandRemoteMenus,
    remoteRouteOf,
    runMateuAction,
    runMateuActionSse,
    // resiliencia: la app las usa para pintar el estado de carga, la banda de sin-conexión
    // y el mensaje de error ya traducido
    classifyRequestFailure,
    isIdempotentAction,
    connectivity,
    pendingActions,
    setTransportHooks,
    DEFAULT_TIMEOUT_MS,
    // static bundle: la shell carga el manifest al arrancar; loadRoute responde desde él sin backend
    loadBundleManifest,
    hasBundle,
    awaitBundle,
    // accesibilidad: lo que los componentes oj-* no traen (una SPA no cambia de página, así
    // que no hay nada que un lector de pantalla anuncie por su cuenta)
    installAnnouncer,
    announce,
    announceNavigation,
    focusContent,
    focusContentSoon,
    mountSkipLink,
    resetNavigationState,
    markPending,
    clearPending,
    pressedControl,
    trackPressedControls,
    markPressedControlBusy,
    clearPressedControlBusy,
    setLastRetry,
    hasLastRetry,
    takeLastRetry,
  };
});

/* Tecleo EN VIVO en un input del host (raw-value): si el host declara un trigger
 * AutoSave (p.ej. buscar-al-teclear del posteo de cargos), cada pulsación actualiza el
 * borrador y re-lanza la acción debounced — sin esperar a Enter/blur. El repintado
 * recrea el input, así que al terminar se devuelve el foco con el cursor al final. */

define('flows/main/pages/main-start-page-chains/hostInputTyped',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  // token de debounce a nivel de módulo: la última pulsación gana
  let debounceToken = 0;

  class hostInputTyped extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId  id del campo Mateu
     * @param {Object} params.event    rawValueChanged de oj-input-text ({detail: {value}})
     */
    async run(context, { fieldId, event }) {
      const { $application, $page } = context;

      const value = event && event.detail ? event.detail.value : undefined;
      if (value === undefined || !fieldId) {
        return;
      }
      const host = ($application.variables.mateuRegistry.contexts || {})[bridge.HOST_ID];
      const auto = bridge.autoSaveOf(host);
      if (!auto) {
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      const previous = draft[fieldId] !== undefined
        ? draft[fieldId]
        : ((host && host.state && host.state[fieldId]) || '');
      if ((previous || '') === (value || '')) {
        return; // eco del re-render / sin cambio real
      }
      draft[fieldId] = value;
      $page.variables.mateuDraft = draft;

      const token = ++debounceToken;
      await new Promise((resolve) => setTimeout(resolve, auto.debounceMillis));
      if (token !== debounceToken) {
        return; // llegó otra pulsación después
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: auto.actionId },
      });
      // devolver el foco al input recreado (tick para que knockout re-ligue el subárbol)
      setTimeout(() => {
        const el = document.querySelector('[data-field-id="' + fieldId + '"]');
        if (!el) return;
        const inner = el.querySelector('input, textarea');
        if (inner) {
          inner.focus();
          const end = (inner.value || '').length;
          try { inner.setSelectionRange(end, end); } catch (ignored) { /* no aplica */ }
        } else if (el.focus) {
          el.focus();
        }
      }, 250);
    }
  }

  return hostInputTyped;
});

/* Fase 9: value-changed de un campo de la ISLA → borrador propio de la isla (separado del
 * host y del drawer). Solo ediciones del usuario (updatedFrom internal). */

define('flows/main/pages/main-start-page-chains/islandFieldEdited',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class islandFieldEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId
     * @param {Object} params.event
     */
    async run(context, { fieldId, event }) {
      const { $page } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      if (!fieldId) {
        return;
      }
      context.$application.variables.mateuDirty = true;
      const draft = Object.assign({}, $page.variables.mateuIslandDraft);
      draft[fieldId] = detail.value;
      $page.variables.mateuIslandDraft = draft;
    }
  }

  return islandFieldEdited;
});

/* Chip del selector RÁPIDO del listado (filtro enum junto al smart search): toggle del
 * valor (clic en el activo lo quita) y re-búsqueda conservando el texto del smart search.
 * El valor viaja en componentState[fieldId] (runMateuSearch lo mergea). */

define('flows/main/pages/main-start-page-chains/listingQuickFilter',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class listingQuickFilter extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId  id del campo filtro (p.ej. "vista")
     * @param {string} params.value    valor del chip pulsado
     */
    async run(context, { fieldId, value }) {
      const { $application } = context;

      if (!fieldId || !value) {
        return;
      }
      const current = $application.variables.mateuQuickFilter || {};
      $application.variables.mateuQuickFilter =
        (current.fieldId === fieldId && current.value === value)
          ? {} // clic en el chip activo → quitar el filtro
          : { fieldId: fieldId, value: value };
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: $application.variables.mateuLastSearchText || '' },
      });
    }
  }

  return listingQuickFilter;
});

/* Acción de FILA del listado (ColumnActionGroup): despacha action-on-row-<método> con el
 * id de la fila — Listing.handleActionOnRow invoca el método en el server; el refresco
 * llega por el bus (dispatchEvent + @Trigger OnCustomEvent → search). */

define('flows/main/pages/main-start-page-chains/listingRowAction',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class listingRowAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.methodName  método anunciado en el ColumnAction
     * @param {string} params.rowId       id de la fila
     */
    async run(context, { methodName, rowId }) {
      if (!methodName) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: {
          actionId: 'action-on-row-' + methodName,
          parameters: { id: rowId },
        },
      });
    }
  }

  return listingRowAction;
});

/* Edición inline (@InlineEditing): commit POR CELDA — al confirmar un valor (blur/Enter)
 * se envía la fila entera editada vía la acción update-row del crud con
 * parameters._editedRow (contrato: fixtures/real/update-row.json — responde SOLO un toast
 * success, sin fragments: el valor editado ya está en el cliente). Guardas: solo ediciones
 * del usuario (updatedFrom 'internal') y solo cambios reales (los oj-* re-emiten
 * value-changed al re-stampar la plantilla tras un refresco del listado). */

define('flows/main/pages/main-start-page-chains/mateuCellEdited',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuCellEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event        value-changed del editor de la celda
     * @param {Object} params.row          $current.row (fila del template de oj-table)
     * @param {Object} params.item         $current.item (variante item.data)
     * @param {number} params.columnIndex  $current.columnIndex
     */
    async run(context, { event, row, item, columnIndex }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // cambio programático (binding/re-stamp), no una edición del usuario
      }
      const listing = $application.variables.mateuListing;
      if (!listing || !listing.editable || columnIndex == null) {
        return;
      }
      const col = listing.columns[columnIndex];
      if (!col || !col.template) {
        return; // columna sin editor (p.ej. @ReadOnly)
      }
      const rowData = (row && row.data !== undefined) ? row.data
        : ((item && item.data) || row);
      if (!rowData) {
        return;
      }
      const value = detail.value;
      if (rowData[col.field] === value) {
        return; // no-op: mismo valor
      }
      const edited = Object.assign({}, rowData);
      edited[col.field] = value;
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'update-row', parameters: { _editedRow: edited } },
      });
    }
  }

  return mateuCellEdited;
});

/* Cierre del drawer SIN guardar (✕/Esc/backdrop): descarta el overlay del registro por puro
 * estado — no emite ningún evento (el camino "dismissed without saving" del contrato). */

define('flows/main/pages/main-start-page-chains/mateuDrawerDismissed',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class mateuDrawerDismissed extends ActionChain {

    async run(context) {
      const { $application, $page } = context;

      $application.variables.mateuRegistry = bridge.dismissOverlay($application.variables.mateuRegistry);
      $application.variables.mateuDrawerOpen = false;
      $application.variables.mateuDrawer = { title: '', fields: [], actions: [], blocks: [], texts: [], state: {} };
      $page.variables.mateuDrawerDraft = {};
    }
  }

  return mateuDrawerDismissed;
});

/* Two-way (Fases 3–5): cada value-changed acumula {fieldId: valor} en el borrador — el del
 * DRAWER si hay uno abierto, el del form del host si no. Solo ediciones del usuario
 * (updatedFrom internal): el set inicial del binding también dispara value-changed. */

define('flows/main/pages/main-start-page-chains/mateuFieldEdited',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuFieldEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId
     * @param {Object} params.event  value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { fieldId, event }) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      if (!fieldId) {
        return;
      }
      context.$application.variables.mateuDirty = true;
      if ($application.variables.mateuDrawerOpen) {
        const draft = Object.assign({}, $page.variables.mateuDrawerDraft);
        draft[fieldId] = detail.value;
        $page.variables.mateuDrawerDraft = draft;
      } else {
        const draft = Object.assign({}, $page.variables.mateuDraft);
        draft[fieldId] = detail.value;
        $page.variables.mateuDraft = draft;
      }
    }
  }

  return mateuFieldEdited;
});

/* Cierre del MODAL (✕ / programático): si el overlay superior sigue siendo el Dialog, se
 * descarta del registro (camino "dismissed"); un close tras navegación/CloseModal ya no
 * encuentra Dialog arriba y no toca nada. */

define('flows/main/pages/main-start-page-chains/mateuModalDismissed',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class mateuModalDismissed extends ActionChain {

    async run(context) {
      const { $application, $page } = context;

      const top = bridge.overlayOf($application.variables.mateuRegistry);
      if (top && top.isDialog) {
        $application.variables.mateuRegistry = bridge.dismissOverlay($application.variables.mateuRegistry);
      }
      $page.variables.mateuModalOpen = false;
    }
  }

  return mateuModalDismissed;
});

/* Clic en una fila del listing (ojRowAction de oj-table): resuelve la fila y dispara la
 * acción 'view' del crud con la fila como parameters — el server responde el drawer Edit.
 * Se usa ojRowAction y no la selección (la selección deja estado que la tabla re-emite al
 * refrescar tras guardar). DEDUPE por timeStamp: el runtime VB puede RE-INVOCAR el listener
 * con el mismo evento almacenado tras el refresco del listado (carrera observada: un 'view'
 * fantasma ~30ms después del save reabría el drawer; a nivel DOM solo hubo UN ojRowAction). */

define('flows/main/pages/main-start-page-chains/mateuRowClicked',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  let lastHandledStamp = -1;

  class mateuRowClicked extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojRowAction ({detail: {context: {key, item…}}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const listing = $application.variables.mateuListing;
      if (listing && listing.editable) {
        return; // tabla de TRABAJO: las celdas se editan in situ, el clic de fila no navega
      }
      const detail = (event && event.detail) || {};
      const stamp = (detail.originalEvent && detail.originalEvent.timeStamp) || event.timeStamp || 0;
      if (stamp === lastHandledStamp) {
        return; // replay del mismo evento — no es un clic nuevo
      }
      lastHandledStamp = stamp;

      const rowContext = detail.context || {};
      let row = rowContext.item && rowContext.item.data;
      if (!row && rowContext.key != null) {
        const rows = $application.variables.mateuListingRows || [];
        row = rows.find((r) => r._rowNumber === rowContext.key);
      }
      if (!row) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'view', parameters: row },
      });
    }
  }

  return mateuRowClicked;
});

/* Item Overview: selección de tab (oj-tab-bar) → mostrar el contenido de ese tab
 * (client-side: los tabs viajan enteros en el árbol). */

define('flows/main/pages/main-start-page-chains/onItemTabSelected',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onItemTabSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed ({detail: {value: 'itab-N'}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const item = $application.variables.mateuItemOv;
      if (!item || !detail.value) {
        return;
      }
      const selected = item.tabs.find((tab) => tab.id === detail.value);
      if (selected) {
        $application.variables.mateuItemTabTexts = selected.texts;
      }
    }
  }

  return onItemTabSelected;
});

/* Header de colección: acción secundaria (Delete…) — el detail trae el ITEM (por label);
 * se resuelve contra la toolbar del crud y se despacha su actionId. */

define('flows/main/pages/main-start-page-chains/onListSecondary',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onListSecondary extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSecondaryAction ({detail: {secondaryItem}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      const label = detail.secondaryItem && detail.secondaryItem.label
        ? detail.secondaryItem.label : detail.secondaryItem;
      const listing = $application.variables.mateuListing;
      if (!listing || label == null) {
        return;
      }
      const match = (listing.toolbar || []).find((b) => b.label === label);
      if (!match) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: match.actionId },
      });
    }
  }

  return onListSecondary;
});

/* General Overview: cambio de registro en el switcher del header → la acción switchRecord
 * del arquetipo con el nuevo valor (viaja en componentState vía el borrador). */

define('flows/main/pages/main-start-page-chains/onOverviewSwitch',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onOverviewSwitch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  select-object-value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { event }) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const overview = $application.variables.mateuOverview;
      if (!overview || detail.value == null || detail.value === overview.switcherValue) {
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      draft[overview.switcherField || 'record'] = detail.value;
      $page.variables.mateuDraft = draft;
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'switchRecord' },
      });
    }
  }

  return onOverviewSwitch;
});

/* Clic en una card del TaskQueue: despacha la acción de la cola (metadata.actionId,
 * p.ej. openGuest) con parameters._item = id del item — el MISMO contrato que el
 * renderer web compartido (mateu-task-queue.ts). El server responde el re-render del
 * host con la card marcada selected y el detalle en el panel derecho. */

define('flows/main/pages/main-start-page-chains/queueItemClicked',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class queueItemClicked extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.itemId  id del item de la cola ($current de la card)
     */
    async run(context, { itemId }) {
      const { $application } = context;

      // el botón de la OPCIÓN DE LÍNEA vive dentro de la card: su clic también dispara el
      // ojAction de la oj-action-card — si acaba de correr una acción de línea, este clic
      // de card es su eco y se ignora
      if (window.__mateuQueueRowActionAt && Date.now() - window.__mateuQueueRowActionAt < 800) {
        return;
      }
      const queue = $application.variables.mateuQueue;
      if (!queue || !queue.actionId || itemId == null) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: queue.actionId, parameters: { _item: itemId } },
      });
    }
  }

  return queueItemClicked;
});

/* Opción de LÍNEA de una card del TaskQueue (p.ej. "Check-out" en las reservas in house):
 * despacha el actionId del ITEM con {_item} contra el HOST. Deja marca temporal para que
 * el clic de card que el mismo gesto provoca (el botón vive dentro de la oj-action-card)
 * se reconozca como eco y no dispare además el openGuest. */

define('flows/main/pages/main-start-page-chains/queueRowAction',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class queueRowAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { actionId, parameters }) {
      if (!actionId) {
        return;
      }
      window.__mateuQueueRowActionAt = Date.now();
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId, parameters },
      });
    }
  }

  return queueRowAction;
});

/* Acción saliente (Fases 3–5). Manda el estado que ya tienes: si hay un drawer abierto, su
 * estado + su borrador (las acciones del drawer del crud van contra el HOST — el drawer no
 * lleva ServerSide propio); si no, el estado del host + el borrador del form. El increment
 * de vuelta se reduce y sus efectos se aplican: Add → proyectar el drawer; CloseModal →
 * cerrarlo y disparar los triggers OnCustomEvent suscritos al evento emitido (el refresco
 * del listing viaja EN el wire); toasts; NavigateTo → evento de aplicación mateuNavigate. */

define('flows/main/pages/main-start-page-chains/runMateuAction',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class runMateuAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId    id de la acción Mateu (del $current del botón)
     * @param {Object} params.parameters  parámetros extra (p.ej. la fila en el clic view)
     * @param {Object} params.event       evento ojAction (fallback: data-action-id)
     */
    async run(context, { actionId, parameters, event }) {
      const { $application, $page } = context;

      // El marcado del control pulsado lo hacen los hooks del transporte a nivel de documento
      // (bridge.trackPressedControls): así cubre TODAS las chains, no sólo ésta.
      try {
        return await this.dispatch(context, { actionId, parameters, event });
      } catch (e) {
        // "Reintentar" tiene que re-ejecutar la ACCIÓN entera, no sólo la petición: una
        // respuesta que nadie procesa no cambia nada en pantalla.
        bridge.setLastRetry({ kind: 'action', actionId: actionId || (event && event.target && event.target.dataset && event.target.dataset.actionId), parameters });
        throw e;
      }
    }

    async dispatch(context, { actionId, parameters, event }) {
      const { $application, $page } = context;

      let id = actionId;
      if (!id && event && event.target && event.target.dataset) {
        id = event.target.dataset.actionId;
      }
      if (!id) {
        return;
      }

      const base = $application.constants.mateuBaseUrl;
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const route = $application.variables.mateuSelectedRoute;
      const overlayBefore = bridge.overlayOf(before);
      const componentState = overlayBefore
        ? Object.assign({}, overlayBefore.state, $page.variables.mateuDrawerDraft)
        : Object.assign({}, host && host.state, $page.variables.mateuDraft);

      const appState = $application.variables.mateuAppState || {};
      // acciones anunciadas Action.sse(true) del HOST (p.ej. opFirma → tablet) van por el
      // endpoint /sse: se aplican TODOS los increments del stream y se ACUMULAN los
      // eventos/toasts de cada uno (cada reduce reemplaza effects)
      const isSse = ((host && host.sseActionIds) || []).indexOf(id) >= 0;
      let reg = before;
      const allEvents = [];
      const allToasts = [];
      // ¿algún incremento REPINTÓ el host? (cualquier fragmento no-Add: Replace/State/data;
      // los Add son overlays — abrir un drawer no toca el host). Señal para el remontaje
      // del foldout: comparar referencias/uuids no vale (proxies de VB, uuids estables).
      let hostRepainted = false;
      const touchesHost = (inc) =>
        ((inc && inc.fragments) || []).some((f) => f.action !== 'Add');
      const applyInc = (inc) => {
        reg = bridge.reduceContexts(reg, inc);
        if (touchesHost(inc)) hostRepainted = true;
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };
      if (isSse) {
        // LongTask: el diálogo de progreso se pinta EN VIVO según llega el stream; sus
        // increments (Add del Dialog + state-only del progreso) se CONSUMEN aquí y no se
        // reducen — los commands/messages del último (p.ej. el dispatchEvent del
        // refresco) sí, vía rest
        const progressWatcher = bridge.longTaskWatcher();
        let progressOpen = false;
        const increments = await bridge.runMateuActionSse(
          base, host, route, id, componentState, {
            parameters: parameters || {}, appState,
            onIncrement: async (inc) => {
              const ev = progressWatcher.consume(inc);
              if (!ev) return false;
              if (ev.title != null) $page.variables.mateuProgressTitle = ev.title;
              if (ev.text != null) $page.variables.mateuProgressText = ev.text;
              if (ev.value != null) $page.variables.mateuProgressValue = Math.round(ev.value * 100);
              if (ev.kind === 'open' && !progressOpen) {
                progressOpen = true;
                await Actions.callComponentMethod(context, {
                  selector: '#mateuProgressDialog', method: 'open',
                });
              }
              if (ev.rest.commands.length || ev.rest.messages.length) {
                applyInc(ev.rest);
              }
              return true;
            },
          });
        increments.forEach(applyInc);
        if (progressOpen) {
          await new Promise((resolve) => setTimeout(
            resolve, progressWatcher.closeAfter != null ? progressWatcher.closeAfter : 600));
          await Actions.callComponentMethod(context, {
            selector: '#mateuProgressDialog', method: 'close',
          });
        }
      } else {
        applyInc(await bridge.runMateuAction(
          base, host, route, id, componentState, { parameters: parameters || {}, appState }));
      }
      const effects = reg.effects;

      // eventos del bus (CloseModal/DispatchEvent) → triggers OnCustomEvent suscritos
      for (const busEvent of allEvents) {
        const hostNow = reg.contexts[bridge.HOST_ID];
        for (const triggerActionId of bridge.eventTriggersOf(hostNow, busEvent.name)) {
          const listing = bridge.listingOf(hostNow);
          const refresh = await bridge.runMateuAction(
            base, hostNow, route, triggerActionId,
            Object.assign({}, hostNow.state, busEvent.detail || {},
              { page: 0, size: (listing && listing.pageSize) || 20 }),
            { appState, parameters: busEvent.detail || {} },
          );
          reg = bridge.reduceContexts(reg, refresh);
          if (touchesHost(refresh)) hostRepainted = true;
          allToasts.push.apply(allToasts, reg.effects.toasts || []);
        }
      }

      $application.variables.mateuRegistry = reg;

      // proyecciones: drawer, listing, form
      const overlayNow = bridge.overlayOf(reg);
      $application.variables.mateuDrawer = overlayNow || { title: '', fields: [], actions: [], blocks: [], texts: [], state: {} };
      // un overlay Dialog va al MODAL (oj-dialog, decisión puntual); el resto al drawer
      const esModal = !!(overlayNow && overlayNow.isDialog);
      $application.variables.mateuDrawerOpen = !!overlayNow && !esModal;
      if (esModal && !$page.variables.mateuModalOpen) {
        $page.variables.mateuModalOpen = true;
        await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'open' });
      } else if (!esModal && $page.variables.mateuModalOpen) {
        $page.variables.mateuModalOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
      }
      if (!overlayNow || !overlayBefore || overlayNow.id !== overlayBefore.id) {
        $page.variables.mateuDrawerDraft = {};
      }

      const hostAfter = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(hostAfter);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];

      // REMONTAJE del foldout: los bindings dentro de oj-sp-foldout-panel no re-ligan
      // las application variables (gotcha del evaluador CSP) — null → tick → proyección
      // nueva hace que el oj-bind-if recree el subárbol con los bloques frescos.
      // SOLO si algún incremento REPINTÓ el host (hostRepainted) — abrir un drawer (Add)
      // no lo toca, y remontar aquí reseteaba el plegado/animación del foldout.
      if (hostRepainted) {
        const foldoutProjection = bridge.foldoutOf(hostAfter);
        const foldoutBefore = $application.variables.mateuFoldout;
        const contentOf = (proj) => proj
          ? { overview: proj.overview, panels: proj.panels }
          : { overview: { blocks: [] }, panels: [] };
        const mismaEstructura = foldoutBefore && foldoutProjection
          && (foldoutBefore.panels || []).length === (foldoutProjection.panels || []).length;
        if (mismaEstructura) {
          // actualización IN SITU: los paneles están estampados UNA vez (su for-each
          // pierde los anclajes si se re-stampa — cirugía DOM del foldout); el contenido
          // vive en mateuFoldoutContent, cuyos bindings SÍ re-evalúan dentro del panel
          $application.variables.mateuFoldoutContent = contentOf(foldoutProjection);
        } else {
          // estructura distinta (nº de paneles) o entra/sale del modo foldout:
          // remontaje completo null→tick
          if (foldoutBefore && foldoutProjection) {
            $application.variables.mateuFoldout = null;
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          // contenido ANTES que estructura (los paneles lo leen al estamparse)
          $application.variables.mateuFoldoutContent = contentOf(foldoutProjection);
          $application.variables.mateuFoldout = foldoutProjection;
        }
      }
      $application.variables.mateuWizard = bridge.wizardOf(hostAfter);

      // header de colección: toolbar del crud → primaryAction/secondaryActions
      const toolbar = listingSummary ? listingSummary.toolbar : [];
      const primaryToolbar = toolbar.length ? toolbar[0] : null;
      $application.variables.mateuListPrimary = primaryToolbar
        ? { label: primaryToolbar.label } : { label: '', display: 'off' };
      $application.variables.mateuListPrimaryId = primaryToolbar ? primaryToolbar.actionId : '';
      $application.variables.mateuListSecondary = toolbar.slice(1).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label }));
      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      const wizardNow = $application.variables.mateuWizard;
      if (wizardNow) {
        const forwardBtn = bridge.wizardForwardOf(hostAfter);
        const forward = forwardBtn
          || summary.actions.find((a) => a.actionId !== 'back');
        $application.variables.mateuWizardForwardId = forward ? forward.actionId : '';
        $application.variables.mateuFormActions = []; // atrás = clic en el rail; adelante = Continue
        // sin availableFromStep: el primary solo aparece en el ÚLTIMO paso del tren
        $application.variables.mateuWizardPrimary = forward
          ? { label: forward.label, disabled: false }
          : { label: 'Done', disabled: true };
        $application.variables.mateuWizardShownStep = wizardNow.currentStep || '';
      } else {
        $application.variables.mateuWizardForwardId = '';
        $application.variables.mateuWizardPrimary = { label: '', disabled: true };
        $application.variables.mateuWizardShownStep = '';
      }

      if (!overlayNow) {
        $page.variables.mateuDraft = {};
      }
      // isla aparecida con la acción (p.ej. el detalle del TaskQueue tras openGuest):
      // se carga su contenido si su contexto aún no existe y se (re)proyecta
      const islandsAfter = bridge.collectIslands(hostAfter.tree);
      const islandAfter = islandsAfter.length ? islandsAfter[0] : null;
      const islandSeed = islandAfter ? JSON.stringify(islandAfter.initialData || {}) : '';
      if (islandAfter && (!reg.contexts[islandAfter.id]
          || $application.variables.mateuIslandSeed !== islandSeed)) {
        // SIN atajo: el baile de 2 pasos captura las ACTIONS del wrapper (flag sse).
        // RECARGA también si el SEED cambió (p.ej. seleccionarPax re-siembra paxIndex)
        reg = await bridge.loadRouteInto(base, reg, islandAfter.route, islandAfter.id, {
          appState,
          componentState: islandAfter.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuIslandId = islandAfter ? islandAfter.id : '';
      $application.variables.mateuIslandSeed = islandSeed;
      const islandCtxAfter = islandAfter ? reg.contexts[islandAfter.id] : null;
      $application.variables.mateuIsland = islandCtxAfter
        ? { fields: bridge.fieldListOf(islandCtxAfter.tree, islandCtxAfter.state),
            actions: bridge.actionsOf(islandCtxAfter.tree),
            content: bridge.islandContentOf(islandCtxAfter) }
        : null;
      // isla ANIDADA dentro de la isla (App con initialData sembrado, p.ej. el documento):
      // cargar con el initialData como componentState; RECARGAR si el seed cambió (selectPax)
      const nestedList = islandCtxAfter ? bridge.collectIslands(islandCtxAfter.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        // SIN atajo consumedRoute/serverSideType: el baile de 2 pasos del mediador
        // captura las ACTIONS del wrapper (el flag sse solo viaja ahí → sseActionIds)
        reg = await bridge.loadRouteInto(base, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      $application.variables.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;
      // los átomos de la anidada se FUSIONAN en el contenido de la isla (fluyen por
      // $current — leer $application.variables en templates profundos no re-liga)
      if ($application.variables.mateuIsland && nestedBlocks) {
        $application.variables.mateuIsland = Object.assign({}, $application.variables.mateuIsland, {
          content: bridge.mergeNestedContent($application.variables.mateuIsland.content, nestedBlocks),
        });
      }


      // cola de trabajo del front-office (TaskQueue) + placeholder del detalle
      $application.variables.mateuQueue = bridge.taskQueueOf(hostAfter.tree);
      $application.variables.mateuHostEmpty = bridge.emptyStateOf(hostAfter.tree);
      // arquetipos compuestos (welcome / general overview / item overview)
      const welcome = bridge.welcomeOf(hostAfter);
      $application.variables.mateuWelcomeTrendItems =
        welcome && welcome.trend ? welcome.trend.items : [];
      const overviewProjection = bridge.generalOverviewOf(hostAfter);
      const itemProjection = bridge.itemOverviewOf(hostAfter);
      $application.variables.mateuWelcome = welcome;
      if (welcome) {
// los PARES color+ilustración del hero: las 5 parejas bg+fg de la galería
        // OFICIAL (fnd/gallery illust-welcome-banner-*-01..05) rotando con su tono
        const GALERIA = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/';
        const LOOKS = [
          ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
          ['dark-sienna', '04'], ['dark-teal', '05'],
        ];
        const look = LOOKS[Math.floor(Math.random() * LOOKS.length)];
        $application.variables.mateuWelcomeTheme = look[0];
        $application.variables.mateuWelcomeIlluBg = GALERIA + 'illust-welcome-banner-bg-' + look[1] + '.png';
        $application.variables.mateuWelcomeIllu = GALERIA + 'illust-welcome-banner-fg-' + look[1] + '.png';
      }
      $application.variables.mateuOverview = overviewProjection;
      $application.variables.mateuOverviewOptions = overviewProjection ? overviewProjection.switcherOptions : [];
      $application.variables.mateuItemOv = itemProjection;
      $application.variables.mateuItemTabTexts = itemProjection && itemProjection.tabs.length
        ? itemProjection.tabs[0].texts : [];
      if (welcome || overviewProjection || itemProjection) {
        // sus campos/botones los pintan las ramas del arquetipo, no el form genérico
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
      }
      // contenido display del HOST / de los pasos del wizard (detalle standalone)
      const islandRawBlocks2 = islandCtxAfter ? bridge.islandContentOf(islandCtxAfter) : null;
      const esWizard2 = !!$application.variables.mateuWizard;
      const sinOtrasRamas2 = !listingSummary && !welcome && !overviewProjection && !itemProjection
        && !$application.variables.mateuQueue && !$application.variables.mateuFoldout;
      // foldout con EntityHeader (la 360): el header de pantalla se conserva
      const hostEntity2 = (!esWizard2 && (sinOtrasRamas2 || $application.variables.mateuFoldout))
        ? bridge.entityHeaderOf(hostAfter) : null;
      const hostBlocks2 = (!esWizard2 && sinOtrasRamas2)
        ? bridge.hostContentOf(hostAfter, islandRawBlocks2,
            { title: summary.title, dropEntityHeader: !!hostEntity2 }) : null;
      // los bloques MANDAN cuando son ricos (EntityHeader/Meter/Ledger…): el form genérico
      // y el texto plano se suprimen — misma regla que los arquetipos
      const hostBlocksRicos2 = !!(hostBlocks2 && hostBlocks2.some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isTaskProgress || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow)));
      // las acciones del toolbar de la Page (se calculan antes del header por si algún
      // template de página de entidad las recoloca)
      const hostToolbarA = bridge.pageToolbarOf(hostAfter);
      // GENERAL OVERVIEW nativo: página de entidad con DOS bloques-columna → el
      // template oj-sp-general-overview-page (slots main/info, header integrado)
      const zonedGop2 = (hostBlocks2 || []).filter((b) => /oj-md-/.test(b.blockClass || ''));
      const gopOn2 = !!(hostEntity2 && (hostBlocks2 || []).length === 2 && zonedGop2.length === 2);
      const gopFold2 = (block) => {
        const items = (block.items || []);
        const conTitulo = items.length && items[0].isHeading && items[0].isH2;
        return {
          title: conTitulo ? items[0].text : '',
          blocks: [Object.assign({}, block, {
            blockClass: 'oj-flex-item oj-sm-12',
            items: conTitulo ? items.slice(1) : items,
          })],
        };
      };
      $application.variables.mateuGop = gopOn2
        ? { on: true, main: gopFold2(zonedGop2[0]), info: gopFold2(zonedGop2[1]) }
        : { on: false, main: { title: '', blocks: [] }, info: { title: '', blocks: [] } };
      $application.variables.mateuHostContent = (!gopOn2 && hostBlocksRicos2 ? hostBlocks2 : null) || [];
      if (hostBlocksRicos2) {
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
        $application.variables.mateuHostText = '';
      }
      $application.variables.mateuWizardContent = (esWizard2
        ? bridge.hostContentOf(hostAfter, islandRawBlocks2, { forWizard: true, title: summary.title }) : null) || [];
      // si los bloques del paso son RICOS, el form genérico del paso sobra (duplica lo
      // que ya muestran el header/las property rows) — misma regla que en el host
      if (($application.variables.mateuWizardContent || []).some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isTaskProgress || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow))) {
        $application.variables.mateuFormFieldsList = [];
      }

      // regla general: el header de página lo pinta SIEMPRE un header de vb; solo los
      // templates que ya integran el suyo (guided process / general overview / welcome /
      // smart-filter-search del listado) lo suprimen
      const integratedHeader = !!($application.variables.mateuWizard || welcome
        || overviewProjection || listingSummary
        || ($application.variables.mateuFoldout && !hostEntity2));
      const showHeaderA = !integratedHeader;
      const pwAfter = $application.variables.mateuMenuDrawerMode
        ? 'edgeToEdge' : ((hostAfter && hostAfter.pageWidth) || 'fixed');
      const showBandA = showHeaderA && pwAfter !== 'edgeToEdge';
      const showListBandA = !!listingSummary && pwAfter !== 'edgeToEdge';
      // las acciones del toolbar de la Page van al HEADER (primary/secondary de la banda)
      const primaryBtnA = hostToolbarA.find((b) => b.chroming === 'callToAction') || null;
      $application.variables.mateuPageHeader = {
        // con EntityHeader en el host (la 360), el header de PANTALLA muestra al huésped
        title: hostEntity2 ? hostEntity2.title : (summary.title || ''),
        subtitle: hostEntity2 ? hostEntity2.subtitle : '',
        facts: hostEntity2 ? hostEntity2.facts : [],
        showBand: showBandA && !gopOn2,
        showInline: showHeaderA && !showBandA && !gopOn2,
        showListBand: showListBandA,
        showListInline: !!listingSummary && !showListBandA,
        primary: primaryBtnA ? { label: primaryBtnA.label, display: primaryBtnA.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
        primaryId: primaryBtnA ? primaryBtnA.actionId : '',
        secondary: hostToolbarA.filter((b) => b !== primaryBtnA).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
        toolbar: hostToolbarA,
      };
      $application.variables.mateuShellPageLayout = pwAfter === 'fixed' ? 'fixedWidth' : pwAfter;
      // los márgenes del contenido se RECALCULAN también tras una acción (una acción
      // puede cambiar la rama/el formato de página: p.ej. en-casa → check-out) — misma
      // lógica que onMateuNavigate (sin recalcular, el -40px de solape de banda del
      // estado anterior se arrastraba a la pantalla siguiente)
      const pageStyleA = $application.variables.mateuMenuDrawerMode
        ? bridge.pageStyleOf({ pageWidth: 'edgeToEdge' })
        : bridge.pageStyleOf(hostAfter);
      $application.variables.mateuPageMaxWidth = pageStyleA.maxWidth;
      $application.variables.mateuPageMargin = pageStyleA.margin;
      $application.variables.mateuPagePadding = pageStyleA.padding;
      if ($application.variables.mateuWelcome || $application.variables.mateuOverview
          || $application.variables.mateuWizard || listingSummary
          || $application.variables.mateuPageHeader) {
        $application.variables.mateuPagePadding = '0';
      }
      if (showBandA || showListBandA) {
        $application.variables.mateuBandBoxMargin = $application.variables.mateuPageMargin;
        const marginPartsA = ($application.variables.mateuPageMargin || '0').split(' ');
        marginPartsA[0] = '-40px';
        if (marginPartsA.length === 1) marginPartsA.push('auto');
        $application.variables.mateuPageMargin = marginPartsA.join(' ');
      } else {
        $application.variables.mateuBandBoxMargin = '0 auto';
      }
      $application.variables.mateuDirty = false;

      // toast con el patrón del starter: variable + open() del oj-sp-messages-toast local
      for (const toast of allToasts) {
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#mateuToast',
          method: 'open',
        });
      }
      if (effects.docTitle) {
        document.title = effects.docTitle;
      }
      if (effects.navigate && effects.navigate.route) {
        if ($page.variables.mateuModalOpen) {
          $page.variables.mateuModalOpen = false;
          await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
        }
        await Actions.fireEvent(context, {
          name: 'application:mateuNavigate',
          payload: { route: effects.navigate.route },
        });
      }
    }
  }

  return runMateuAction;
});

/* Fase 9: acción de la ISLA (Edit/Save/toolbar del mediador embebido) — se postea contra
 * el contexto de la isla (outbound estampado al cargarla) y en general SOLO la isla se
 * re-proyecta. Si la respuesta trae EVENTOS de bus (p.ej. el "Check-out" del toolbar del
 * 360 emite checkout-solicitado), se disparan los triggers OnCustomEvent suscritos en el
 * HOST y se re-proyecta todo — incluida la posible SUSTITUCIÓN de la isla (el host decide
 * mostrar otra pantalla de detalle). */

define('flows/main/pages/main-start-page-chains/runMateuIslandAction',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class runMateuIslandAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { actionId, parameters }) {
      const { $application, $page } = context;

      const islandId = $application.variables.mateuIslandId;
      if (!actionId || !islandId) {
        return;
      }
      const before = $application.variables.mateuRegistry;
      const islandContext = before.contexts[islandId];
      if (!islandContext) {
        return;
      }
      const base = $application.constants.mateuBaseUrl;
      const appState = $application.variables.mateuAppState || {};
      // el SEED de la isla (initialData del wrapper: stayId/paxIndex…) debe viajar en CADA
      // acción — el server no lo eca y el estado del modelo cargado no lo lleva (mismo
      // gotcha que la isla anidada); un null del estado NO pisa el seed
      let islandSeed = {};
      try { islandSeed = JSON.parse($application.variables.mateuIslandSeed || '{}'); } catch (e) { islandSeed = {}; }
      const componentState = Object.assign(
        {}, islandContext.state, $page.variables.mateuIslandDraft);
      for (const seedKey of Object.keys(islandSeed)) {
        if (componentState[seedKey] == null) {
          componentState[seedKey] = islandSeed[seedKey];
        }
      }
      const outbound = islandContext.outbound || {};

      let reg = before;
      const allEvents = [];
      const allToasts = [];
      const apply = (increment) => {
        reg = bridge.reduceContexts(reg, increment);
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };

      // acciones anunciadas Action.sse(true) (LongTask, p.ej. escanear) → endpoint /sse
      const isSse = (islandContext.sseActionIds || []).indexOf(actionId) >= 0;
      let lastIncrement = null;
      if (isSse) {
        // LongTask: diálogo de progreso en vivo (mismo tratamiento que runMateuAction)
        const progressWatcher = bridge.longTaskWatcher();
        let progressOpen = false;
        const increments = await bridge.runMateuActionSse(
          base, islandContext, outbound.route || '',
          actionId, componentState, {
            appState, parameters: parameters || {},
            onIncrement: async (inc) => {
              const ev = progressWatcher.consume(inc);
              if (!ev) return false;
              if (ev.title != null) $page.variables.mateuProgressTitle = ev.title;
              if (ev.text != null) $page.variables.mateuProgressText = ev.text;
              if (ev.value != null) $page.variables.mateuProgressValue = Math.round(ev.value * 100);
              if (ev.kind === 'open' && !progressOpen) {
                progressOpen = true;
                await Actions.callComponentMethod(context, {
                  selector: '#mateuProgressDialog', method: 'open',
                });
              }
              if (ev.rest.commands.length || ev.rest.messages.length) {
                apply(ev.rest);
              }
              return true;
            },
          });
        increments.forEach((inc) => { lastIncrement = inc; apply(inc); });
        if (progressOpen) {
          await new Promise((resolve) => setTimeout(
            resolve, progressWatcher.closeAfter != null ? progressWatcher.closeAfter : 600));
          await Actions.callComponentMethod(context, {
            selector: '#mateuProgressDialog', method: 'close',
          });
        }
      } else {
        lastIncrement = await bridge.runMateuAction(
          base, islandContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} });
        apply(lastIncrement);
      }

      // ROUTE-FLIP del mediador embebido: una respuesta state-only con _route nuevo
      // significa "recarga mi ruta interna" (p.ej. edit → /edit, save → /view).
      // OJO: nada de comparar por IDENTIDAD (proxies de VB) — criterio semántico.
      let after = reg.contexts[islandId];
      const flippedRoute = after && after.state ? after.state._route : null;
      const previousRoute = islandContext.state ? islandContext.state._route : null;
      const stateOnly = lastIncrement && (lastIncrement.fragments || []).length > 0
        && (lastIncrement.fragments || []).every((f) => !f.component);
      if (after && stateOnly && flippedRoute != null && flippedRoute !== previousRoute) {
        const innerRoute = bridge.composeInnerRoute(outbound.route || '', flippedRoute);
        // el reload del flip también lleva el seed (el nuevo estado se hidrata de él)
        const flipState = Object.assign({}, islandSeed, after.state);
        for (const seedKey of Object.keys(islandSeed)) {
          if (flipState[seedKey] == null) {
            flipState[seedKey] = islandSeed[seedKey];
          }
        }
        apply(await bridge.loadRoute(base, innerRoute, islandId, {
          consumedRoute: outbound.consumedRoute || outbound.route || '',
          serverSideType: outbound.serverSideType,
          appState,
          componentState: flipState,
        }));
      }

      // eventos de bus → triggers suscritos en el HOST (p.ej. checkout-solicitado →
      // checkoutGuest en ReservasQueue); el host se re-renderiza
      let hostChanged = false;
      for (const busEvent of allEvents.splice(0)) {
        const hostNow = reg.contexts[bridge.HOST_ID];
        if (!hostNow) continue;
        for (const triggerActionId of bridge.eventTriggersOf(hostNow, busEvent.name)) {
          apply(await bridge.runMateuAction(
            base, hostNow, '', triggerActionId,
            Object.assign({}, hostNow.state, busEvent.detail || {}),
            { appState, parameters: busEvent.detail || {} }));
          hostChanged = true;
        }
      }

      // qué isla toca proyectar: si el host cambió, puede haber SUSTITUIDO la isla
      let effectiveIslandId = islandId;
      if (hostChanged) {
        const hostAfter = reg.contexts[bridge.HOST_ID];
        const islandsAfter = bridge.collectIslands(hostAfter.tree);
        const islandAfter = islandsAfter.length ? islandsAfter[0] : null;
        if (islandAfter && !reg.contexts[islandAfter.id]) {
          reg = await bridge.loadRouteInto(base, reg, islandAfter.route, islandAfter.id, {
            appState,
            componentState: islandAfter.initialData || {},
          });
        }
        effectiveIslandId = islandAfter ? islandAfter.id : '';
        $application.variables.mateuIslandId = effectiveIslandId;
        $application.variables.mateuIslandSeed = islandAfter
          ? JSON.stringify(islandAfter.initialData || {}) : '';
        $application.variables.mateuQueue = bridge.taskQueueOf(hostAfter.tree);
        $application.variables.mateuHostEmpty = bridge.emptyStateOf(hostAfter.tree);
      }

      const islandNow = effectiveIslandId ? reg.contexts[effectiveIslandId] : null;

      // isla ANIDADA dentro de la isla (App con initialData sembrado): cargar con el
      // seed como componentState; RECARGAR si el seed cambió. SIN atajo consumedRoute/
      // serverSideType: el baile de 2 pasos captura las ACTIONS del wrapper (flag sse)
      const nestedList = islandNow ? bridge.collectIslands(islandNow.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        reg = await bridge.loadRouteInto(base, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
      }
      $application.variables.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      $application.variables.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;

      $application.variables.mateuRegistry = reg;
      // los átomos de la anidada se FUSIONAN en el contenido de la isla (fluyen por
      // $current — leer $application.variables en templates profundos no re-liga)
      $application.variables.mateuIsland = islandNow
        ? { fields: bridge.fieldListOf(islandNow.tree, islandNow.state),
            actions: bridge.actionsOf(islandNow.tree),
            content: bridge.mergeNestedContent(bridge.islandContentOf(islandNow), nestedBlocks) }
        : null;

      // contenido display del HOST / del wizard standalone: re-fusionar con la isla
      const hostFinal = reg.contexts[bridge.HOST_ID];
      const islandRawBlocksNow = islandNow ? bridge.islandContentOf(islandNow) : null;
      if ($application.variables.mateuWizard) {
        if (hostChanged) {
          $application.variables.mateuWizard = bridge.wizardOf(hostFinal);
        }
        $application.variables.mateuWizardContent = bridge.hostContentOf(
          hostFinal, islandRawBlocksNow,
          { forWizard: true, title: $application.variables.mateuHostTitle }) || [];
      } else if (($application.variables.mateuHostContent || []).length) {
        // mismas opts que runMateuAction: sin ellas el título de página y el EntityHeader
        // reaparecían DUPLICADOS en el contenido tras una acción de la isla
        const hostEntityNow = bridge.entityHeaderOf(hostFinal);
        $application.variables.mateuHostContent = bridge.hostContentOf(hostFinal, islandRawBlocksNow,
          { title: $application.variables.mateuHostTitle, dropEntityHeader: !!hostEntityNow }) || [];
      }

      $page.variables.mateuIslandDraft = {};
      $application.variables.mateuDirty = false;

      for (const toast of allToasts) {
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#mateuToast',
          method: 'open',
        });
      }
    }
  }

  return runMateuIslandAction;
});

/* Acción de la isla ANIDADA (App dentro de la isla, p.ej. el documento del check-in).
 * Se postea contra el contexto anidado con su estado + el SEED del host (stayId,
 * paxIndex… — el server no lo eca en sus respuestas). Las acciones anunciadas
 * Action.sse(true) (p.ej. escanear, un LongTask) van por el endpoint /sse y devuelven un
 * STREAM de increments que se reducen en orden. Los EVENTOS de bus resultantes (p.ej.
 * documento-escaneado) disparan los triggers OnCustomEvent suscritos en la propia
 * anidada, la isla madre y el host — con manejo del route-flip semántico tras cada uno. */

define('flows/main/pages/main-start-page-chains/runMateuNestedAction',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class runMateuNestedAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { actionId, parameters }) {
      const { $application, $page } = context;

      const nestedId = $application.variables.mateuNestedId;
      const islandId = $application.variables.mateuIslandId;
      if (!actionId || !nestedId) {
        return;
      }
      let reg = $application.variables.mateuRegistry;
      const nestedContext = reg.contexts[nestedId];
      if (!nestedContext) {
        return;
      }
      const base = $application.constants.mateuBaseUrl;
      const appState = $application.variables.mateuAppState || {};
      let seed = {};
      try { seed = JSON.parse($application.variables.mateuNestedSeed || '{}'); } catch (ignored) { /* sin seed */ }

      const allEvents = [];
      const allToasts = [];
      const apply = (increment) => {
        reg = bridge.reduceContexts(reg, increment);
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };
      // route-flip semántico: una respuesta state-only con _route nuevo pide recargar la
      // ruta interna del contexto (se re-consulta tras CADA tanda de increments)
      const maybeFlip = async (ctxId, previousRoute) => {
        const ctx = reg.contexts[ctxId];
        const flipped = ctx && ctx.state ? ctx.state._route : null;
        if (ctx && flipped != null && flipped !== previousRoute) {
          const outboundNow = ctx.outbound || {};
          const innerRoute = bridge.composeInnerRoute(outboundNow.route || '', flipped);
          const reload = await bridge.loadRoute(base, innerRoute, ctxId, {
            consumedRoute: outboundNow.consumedRoute || outboundNow.route || '',
            serverSideType: outboundNow.serverSideType,
            appState,
            componentState: Object.assign({}, seed, ctx.state),
          });
          apply(reload);
        }
      };

      const outbound = nestedContext.outbound || {};
      const previousRoute = nestedContext.state ? nestedContext.state._route : null;
      const componentState = Object.assign({}, seed, nestedContext.state);
      const isSse = (nestedContext.sseActionIds || []).indexOf(actionId) >= 0;
      if (isSse) {
        const increments = await bridge.runMateuActionSse(
          base, nestedContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} });
        increments.forEach(apply);
      } else {
        apply(await bridge.runMateuAction(
          base, nestedContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} }));
      }
      await maybeFlip(nestedId, previousRoute);

      // eventos de bus → triggers suscritos (la anidada primero: p.ej. documento-escaneado
      // → reloadDocumento, que responde un flip)
      for (const busEvent of allEvents.splice(0)) {
        for (const target of [nestedId, islandId, bridge.HOST_ID]) {
          const ctx = target ? reg.contexts[target] : null;
          if (!ctx) continue;
          for (const triggerActionId of bridge.eventTriggersOf(ctx, busEvent.name)) {
            const prev = ctx.state ? ctx.state._route : null;
            const trigState = target === nestedId
              ? Object.assign({}, seed, ctx.state) : Object.assign({}, ctx.state);
            apply(await bridge.runMateuAction(
              base, ctx, (ctx.outbound || {}).route || '',
              triggerActionId, trigState, { appState }));
            await maybeFlip(target, prev);
          }
        }
      }

      $application.variables.mateuRegistry = reg;

      // re-proyección: anidada + isla madre (fusionando la anidada en su contenido)
      const nestedNow = reg.contexts[nestedId];
      const nestedBlocks = nestedNow ? bridge.islandContentOf(nestedNow) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;
      const islandNow = islandId ? reg.contexts[islandId] : null;
      $application.variables.mateuIsland = islandNow
        ? { fields: bridge.fieldListOf(islandNow.tree, islandNow.state),
            actions: bridge.actionsOf(islandNow.tree),
            content: bridge.mergeNestedContent(bridge.islandContentOf(islandNow), nestedBlocks) }
        : null;

      for (const toast of allToasts) {
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#mateuToast',
          method: 'open',
        });
      }
    }
  }

  return runMateuNestedAction;
});

/* Fase 4: búsqueda del listing — el texto viaja en componentState.searchText (así lo lee
 * SearchActionHandler); la respuesta es un fragmento data-only que mergea las filas en
 * ctx.data.crud.page y aquí se re-proyecta la tabla. */

define('flows/main/pages/main-start-page-chains/runMateuSearch',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class runMateuSearch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.searchText
     */
    async run(context, { searchText }) {
      const { $application } = context;

      const base = $application.constants.mateuBaseUrl;
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const listing = bridge.listingOf(host);
      if (!listing) {
        return;
      }

      const componentState = Object.assign({}, host.state, {
        searchText: searchText == null ? '' : searchText,
        page: 0,
        size: listing.pageSize,
      });
      // selector rápido activo (chips junto al smart search) → viaja como filtro
      const quick = $application.variables.mateuQuickFilter || {};
      if (quick.fieldId && quick.value) {
        componentState[quick.fieldId] = quick.value;
      }
      $application.variables.mateuLastSearchText = searchText == null ? '' : searchText;
      const route = $application.variables.mateuSelectedRoute;
      const increment = await bridge.runMateuAction(base, host, route, 'search', componentState, { appState: $application.variables.mateuAppState || {} });
      const reg = bridge.reduceContexts(before, increment);
      $application.variables.mateuRegistry = reg;

      const refreshed = bridge.listingOf(reg.contexts[bridge.HOST_ID]);
      $application.variables.mateuListing = refreshed;
      $application.variables.mateuListingRows = refreshed ? refreshed.rows : [];
    }
  }

  return runMateuSearch;
});

/* Smart Search de vb (header de colección): el usuario teclea y Enter añade un chip
 * {filter:'keyword', value} a smartFilters.value (quitarlo lo elimina) — se concatenan
 * los keywords y se relanza el search del listado con ese texto. */

define('flows/main/pages/main-start-page-chains/smartFiltersChanged',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class smartFiltersChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  smartFiltersChanged ({detail: {value, updatedFrom}})
     */
    async run(context, { event }) {
      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // cambio programático (seed del binding), no una búsqueda del usuario
      }
      const filters = (detail.value && detail.value.value) || [];
      const searchText = filters
        .filter((f) => f.filter === 'keyword')
        .map((f) => f.value)
        .join(' ');
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText },
      });
    }
  }

  return smartFiltersChanged;
});

/* Fase 8: Cancel del guided-process (spCancel) = abandonar el proceso — navega a la
 * home de la app; al reentrar, el wizard arranca de cero (instancia fresca por request). */

define('flows/main/pages/main-start-page-chains/wizardCancel',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class wizardCancel extends ActionChain {

    async run(context) {
      const { $application } = context;

      const home = $application.variables.mateuHomeRoute;
      if (!home) {
        return;
      }
      await Actions.fireEvent(context, {
        name: 'application:mateuNavigate',
        payload: { route: home },
      });
    }
  }

  return wizardCancel;
});

/* Fase 8: el Continue del oj-sp-guided-process (spBeforeNext) dispara la acción de AVANCE
 * del wire del wizard (next, o confirm en el penúltimo paso — la separó la proyección). */

define('flows/main/pages/main-start-page-chains/wizardNext',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class wizardNext extends ActionChain {

    async run(context) {
      const { $application } = context;

      // el OVERVIEW y su botón Start los gestiona el PROPIO componente (writeback
      // interno de currentStep, sin evento) — aquí solo llega el avance de pasos
      const forwardId = $application.variables.mateuWizardForwardId;
      if (!forwardId) {
        return; // pantalla de resultado: no hay avance
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: forwardId },
      });
    }
  }

  return wizardNext;
});

/* Fase 8: clic en un paso del RAIL del guided-process (spBeforeStepNavigate,
 * triggeredFrom 'step') — hacia ATRÁS ejecuta los 'back' necesarios contra Mateu (que
 * valida por pasos); hacia delante no navega (se avanza con Continue) y se restaura el
 * paso mostrado (el evento es cancelable pero el chain corre async: preventDefault llega
 * tarde — el componente ya movió su currentStep localmente). */

define('flows/main/pages/main-start-page-chains/wizardStepNavigate',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class wizardStepNavigate extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spBeforeStepNavigate ({detail: {currentStep, nextStep, triggeredFrom}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.triggeredFrom !== 'step') {
        return; // el camino del Continue lo lleva spBeforeNext
      }
      const wizard = $application.variables.mateuWizard;
      if (!wizard) {
        return;
      }
      const ids = wizard.steps.map((s) => s.id);
      const fromIndex = ids.indexOf(wizard.currentStep);
      const toIndex = ids.indexOf(detail.nextStep);
      if (fromIndex < 0 || toIndex < 0 || toIndex >= fromIndex) {
        // adelante por el rail no navega — restaurar el paso mostrado
        const el = document.getElementById('mateuWizardEl');
        if (el) {
          el.currentStep = $application.variables.mateuWizardShownStep;
        }
        return;
      }
      for (let i = 0; i < fromIndex - toIndex; i++) {
        await Actions.callChain(context, {
          chain: 'runMateuAction',
          params: { actionId: 'back' },
        });
      }
    }
  }

  return wizardStepNavigate;
});


define('text!flows/main/pages/main-start-page.html',[],function () { return ' <oj-bind-if test="[[ $application.variables.mateuPageHeader.showListBand ]]"> <div class="oj-bg-neutral-30 oj-sm-padding-10x-bottom"> <div :style.max-width="[[ $application.variables.mateuPageMaxWidth ]]" :style.margin="[[ $application.variables.mateuBandBoxMargin ]]"> <oj-sp-smart-filter-search id="mateuListHeader" page-title="[[ $application.variables.mateuHostTitle ]]" primary-action="[[ $application.variables.mateuListPrimary ]]" secondary-actions="[[ $application.variables.mateuListSecondary ]]" smart-filters="{{ $page.variables.mateuSmartFilters }}" on-smart-filters-changed="[[ $listeners.smartFiltersChanged ]]" on-sp-primary-action="[[ $listeners.listPrimary ]]" on-sp-secondary-action="[[ $listeners.listSecondary ]]"> <oj-input-search id="mateuSearch" slot="search" placeholder="Buscar…" on-oj-value-action="[[ $listeners.mateuSearchAction ]]"></oj-input-search> </oj-sp-smart-filter-search> <oj-bind-if test="[[ (($application.variables.mateuListing || {}).quickFilters || []).length > 0 ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-3x-top oj-sm-margin-6x-bottom"> <oj-bind-for-each data="[[ $application.variables.mateuListing.quickFilters[0].options ]]"> <template> <oj-bind-if test="[[ ($application.variables.mateuQuickFilter || {}).value === $current.data.value ]]"> <oj-sp-filter-chip class="oj-sm-margin-2x-end" type="applied" close-icon="always" actionable="true" label="[[ $application.variables.mateuListing.quickFilters[0].label ]]" value="[[ $current.data.label ]]" :data-field-id="[[ $application.variables.mateuListing.quickFilters[0].fieldId ]]" :data-value="[[ $current.data.value ]]" on-sp-action="[[ $listeners.quickFilterClicked ]]" on-sp-label-action="[[ $listeners.quickFilterClicked ]]" on-sp-close="[[ $listeners.quickFilterClicked ]]"></oj-sp-filter-chip> </oj-bind-if> <oj-bind-if test="[[ ($application.variables.mateuQuickFilter || {}).value !== $current.data.value ]]"> <oj-sp-filter-chip class="oj-sm-margin-2x-end" type="nonApplied" actionable="true" label="[[ $current.data.label ]]" :data-field-id="[[ $application.variables.mateuListing.quickFilters[0].fieldId ]]" :data-value="[[ $current.data.value ]]" on-sp-action="[[ $listeners.quickFilterClicked ]]" on-sp-label-action="[[ $listeners.quickFilterClicked ]]"></oj-sp-filter-chip> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $application.variables.mateuPageHeader.showBand ]]"> <div class="oj-bg-neutral-30 oj-sm-padding-10x-bottom"> <div :style.max-width="[[ $application.variables.mateuPageMaxWidth ]]" :style.margin="[[ $application.variables.mateuBandBoxMargin ]]"> <oj-sp-header-general-overview id="mateuPageHeaderEl" page-title="[[ $application.variables.mateuPageHeader.title ]]" page-subtitle="[[ $application.variables.mateuPageHeader.subtitle ]]" contextual-info="[[ $application.variables.mateuPageHeader.facts ]]" primary-action="[[ $application.variables.mateuPageHeader.primary ]]" secondary-actions="[[ $application.variables.mateuPageHeader.secondary ]]" on-sp-primary-action="[[ $listeners.headerPrimary ]]" on-sp-secondary-action="[[ $listeners.headerSecondary ]]" display-options.go-to-parent="false" display-options.contextual-info-label="true"></oj-sp-header-general-overview> </div> </div> </oj-bind-if> <div class="oj-sp-public-primary-content-container" :style.max-width="[[ $application.variables.mateuPageMaxWidth ]]" :style.margin="[[ $application.variables.mateuPageMargin ]]" :style.padding="[[ $application.variables.mateuPagePadding ]]"> <oj-sp-messages-toast primary-text="[[ $variables.mateuToastText ]]" id="mateuToast"></oj-sp-messages-toast> <oj-dialog id="mateuModal" cancel-behavior="icon" drag-affordance="none" on-oj-before-close="[[ $listeners.mateuModalClosed ]]"> <div slot="header"> <span class="oj-dialog-title"><oj-bind-text value="[[ $application.variables.mateuDrawer.title ]]"></oj-bind-text></span> </div> <div slot="body" style="max-width: 26rem;"> <oj-bind-for-each data="[[ $application.variables.mateuDrawer.texts ]]"> <template> <div class="oj-typography-body-md oj-sm-margin-2x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> <div slot="footer"> <oj-bind-for-each data="[[ $application.variables.mateuDrawer.actions ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.mateuActionClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-dialog> <oj-dialog id="mateuProgressDialog" cancel-behavior="none" drag-affordance="none"> <div slot="header"> <span class="oj-dialog-title"><oj-bind-text value="[[ $variables.mateuProgressTitle ]]"></oj-bind-text></span> </div> <div slot="body" style="min-width: 22rem;"> <div class="oj-typography-body-md oj-sm-margin-2x-bottom"><oj-bind-text value="[[ $variables.mateuProgressText ]]"></oj-bind-text></div> <oj-c-progress-bar style="width: 100%;" value="[[ $variables.mateuProgressValue ]]" max="100"></oj-c-progress-bar> </div> </oj-dialog> <oj-bind-if test="[[ $application.variables.mateuPageHeader.showInline ]]"> <oj-sp-header-general-overview id="mateuPageHeaderInline" class="oj-bg-neutral-0" page-title="[[ $application.variables.mateuPageHeader.title ]]" page-subtitle="[[ $application.variables.mateuPageHeader.subtitle ]]" contextual-info="[[ $application.variables.mateuPageHeader.facts ]]" primary-action="[[ $application.variables.mateuPageHeader.primary ]]" secondary-actions="[[ $application.variables.mateuPageHeader.secondary ]]" on-sp-primary-action="[[ $listeners.headerPrimary ]]" on-sp-secondary-action="[[ $listeners.headerSecondary ]]" display-options.go-to-parent="false" display-options.contextual-info-label="true"></oj-sp-header-general-overview> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuHostText ]]"> <div class="oj-flex oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <div class="oj-flex-item oj-sm-12 oj-md-12"> <oj-bind-text value="[[ $application.variables.mateuHostText ]]"></oj-bind-text> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuFoldout ]]"> <oj-sp-foldout-layout id="mateuFoldoutEl" display-options.go-to-parent="false" display-options.background="transparent"> <oj-sp-foldout-panel panel-title="[[ $application.variables.mateuFoldout.headerTitle || $application.variables.mateuHostTitle ]]" class="mateu-fixed-panel" style="flex: 0 0 25rem; width: 25rem; min-width: 25rem; max-width: 25rem;"> <div class="oj-flex"> <oj-bind-for-each data="[[ $application.variables.mateuFoldoutContent.overview.blocks ]]"> <template> <oj-bind-if test="[[ $current.data.isCard ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-panel oj-sm-margin-3x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPlain ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-sp-foldout-panel> <oj-bind-for-each data="[[ $application.variables.mateuFoldout.panels ]]"> <template> <oj-sp-foldout-panel panel-title="[[ ($application.variables.mateuFoldoutContent.panels[$current.index] || $current.data).headerLabel || $current.data.title ]]" :class="[[ {\'mateu-fixed-panel\': !!$current.data.width} ]]" :style.flex="[[ $current.data.width ? \'0 0 \' + $current.data.width : null ]]" :style.width="[[ $current.data.width || null ]]" :style.min-width="[[ $current.data.width || null ]]" :style.max-width="[[ $current.data.width || null ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ ($application.variables.mateuFoldoutContent.panels[$current.index] || $current.data).blocks ]]"> <template> <oj-bind-if test="[[ $current.data.isCard ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-panel oj-sm-margin-3x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPlain ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-sp-foldout-panel> </template> </oj-bind-for-each> </oj-sp-foldout-layout> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuWelcome ]]"> <oj-sp-header-welcome-banner id="mateuWelcomeBanner" themed-image="none" illustration-background="[[ $application.variables.mateuWelcomeIlluBg ]]" illustration-foreground="[[ $application.variables.mateuWelcomeIllu ]]" background-color="[[ $application.variables.mateuWelcomeTheme ]]" page-title="[[ $application.variables.mateuWelcome.title ]]" description-text="[[ $application.variables.mateuWelcome.subtitle ]]" primary-action="[[ $application.variables.mateuWelcome.primaryCta ]]" secondary-action="[[ $application.variables.mateuWelcome.secondaryCta ]]" on-sp-primary-action="[[ $listeners.welcomePrimary ]]" on-sp-secondary-action="[[ $listeners.welcomeSecondary ]]"></oj-sp-header-welcome-banner> <div class="oj-flex oj-sm-margin-6x-top oj-sm-padding-12x-horizontal"> <oj-bind-for-each data="[[ $application.variables.mateuWelcome.tiles ]]"> <template> <div class="oj-flex-item oj-sm-12 oj-md-4"> <div class="oj-panel oj-sm-margin-2x"> <oj-bind-if test="[[ $current.data.isKpi ]]"> <oj-action-card style="display: block;" on-oj-action="[[ $listeners.welcomeKpiClicked ]]" :data-action-id="[[ $current.data.kpiActionId ]]"> <div class="oj-sm-padding-2x"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.kpiTitle ]]"></oj-bind-text></div> <div class="oj-typography-heading-lg"><oj-bind-text value="[[ $current.data.kpiValue ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.kpiCaption ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ !$current.data.isKpi ]]"> <div class="oj-typography-subheading-sm oj-sm-margin-2x-bottom"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <oj-bind-for-each data="[[ $current.data.texts ]]"> <template> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </oj-bind-if> </div> </div> </template> </oj-bind-for-each> </div> <oj-bind-if test="[[ !!$application.variables.mateuWelcome.trend ]]"> <div class="oj-flex oj-sm-padding-12x-horizontal"> <div class="oj-flex-item oj-sm-12"> <div class="oj-panel oj-sm-margin-2x"> <div class="oj-typography-subheading-sm oj-sm-margin-2x-bottom"><oj-bind-text value="[[ $application.variables.mateuWelcome.trend.title ]]"></oj-bind-text></div> <oj-chart type="bar" data="[[ $page.variables.welcomeTrendADP ]]" animation-on-display="auto" style="width: 100%; height: 260px;"> <template slot="itemTemplate" data-oj-as="item"> <oj-chart-item value="[[ item.data.value ]]" group-id="[[ item.data.group ]]" series-id="[[ item.data.series ]]"></oj-chart-item> </template> </oj-chart> </div> </div> </div> </oj-bind-if> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuOverview ]]"> <oj-sp-header-general-overview id="mateuOverviewHeader" class="oj-bg-neutral-0" page-title="[[ $application.variables.mateuOverview.title ]]" page-subtitle="[[ $application.variables.mateuOverview.subtitle ]]" contextual-info="[[ $application.variables.mateuOverview.facts ]]" select-object="[[ $variables.overviewSelectConfig ]]" select-object-value="[[ $application.variables.mateuOverview.switcherValue ]]" translations="[[ $application.variables.mateuOverviewTranslations ]]" on-select-object-value-changed="[[ $listeners.overviewSwitched ]]"></oj-sp-header-general-overview> <div class="oj-flex oj-sm-margin-6x-top oj-sm-padding-12x-horizontal"> <oj-bind-for-each data="[[ $application.variables.mateuOverview.cards ]]"> <template> <div class="oj-flex-item oj-sm-12 oj-md-6"> <div class="oj-panel oj-sm-margin-2x"> <div class="oj-typography-subheading-sm oj-sm-margin-2x-bottom"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <oj-bind-for-each data="[[ $current.data.texts ]]"> <template> <div class="oj-typography-body-md oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuItemOv ]]"> <div class="oj-flex oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <div class="oj-flex-item oj-sm-12 oj-md-4"> <div class="oj-panel oj-sm-margin-2x"> <oj-bind-for-each data="[[ $application.variables.mateuItemOv.key.texts ]]"> <template> <div class="oj-typography-body-md oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </div> <div class="oj-flex-item oj-sm-12 oj-md-8"> <oj-tab-bar id="mateuItemTabs" on-selection-changed="[[ $listeners.itemTabChanged ]]"> <ul> <oj-bind-for-each data="[[ $application.variables.mateuItemOv.tabs ]]"> <template> <li :id="[[ $current.data.id ]]"><a href="#"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></a></li> </template> </oj-bind-for-each> </ul> </oj-tab-bar> <div class="oj-sm-padding-4x"> <oj-bind-for-each data="[[ $application.variables.mateuItemTabTexts ]]"> <template> <div class="oj-typography-body-md oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuListing ]]"> <oj-bind-if test="[[ $application.variables.mateuPageHeader.showListInline ]]"> <oj-sp-smart-filter-search id="mateuListHeaderInline" page-title="[[ $application.variables.mateuHostTitle ]]" primary-action="[[ $application.variables.mateuListPrimary ]]" secondary-actions="[[ $application.variables.mateuListSecondary ]]" smart-filters="{{ $page.variables.mateuSmartFilters }}" on-smart-filters-changed="[[ $listeners.smartFiltersChanged ]]" on-sp-primary-action="[[ $listeners.listPrimary ]]" on-sp-secondary-action="[[ $listeners.listSecondary ]]"> <oj-input-search id="mateuSearchInline" slot="search" placeholder="Buscar…" on-oj-value-action="[[ $listeners.mateuSearchAction ]]"></oj-input-search> </oj-sp-smart-filter-search> <oj-bind-if test="[[ (($application.variables.mateuListing || {}).quickFilters || []).length > 0 ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-3x-top oj-sm-margin-6x-bottom"> <oj-bind-for-each data="[[ $application.variables.mateuListing.quickFilters[0].options ]]"> <template> <oj-bind-if test="[[ ($application.variables.mateuQuickFilter || {}).value === $current.data.value ]]"> <oj-sp-filter-chip class="oj-sm-margin-2x-end" type="applied" close-icon="always" actionable="true" label="[[ $application.variables.mateuListing.quickFilters[0].label ]]" value="[[ $current.data.label ]]" :data-field-id="[[ $application.variables.mateuListing.quickFilters[0].fieldId ]]" :data-value="[[ $current.data.value ]]" on-sp-action="[[ $listeners.quickFilterClicked ]]" on-sp-label-action="[[ $listeners.quickFilterClicked ]]" on-sp-close="[[ $listeners.quickFilterClicked ]]"></oj-sp-filter-chip> </oj-bind-if> <oj-bind-if test="[[ ($application.variables.mateuQuickFilter || {}).value !== $current.data.value ]]"> <oj-sp-filter-chip class="oj-sm-margin-2x-end" type="nonApplied" actionable="true" label="[[ $current.data.label ]]" :data-field-id="[[ $application.variables.mateuListing.quickFilters[0].fieldId ]]" :data-value="[[ $current.data.value ]]" on-sp-action="[[ $listeners.quickFilterClicked ]]" on-sp-label-action="[[ $listeners.quickFilterClicked ]]"></oj-sp-filter-chip> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </oj-bind-if> <div class="oj-bg-body oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <div class="oj-flex"> <div class="oj-flex-item oj-sm-12 oj-md-12"> <oj-table id="mateuTable" class="oj-sm-12" display="[[ $application.variables.mateuListing.display ]]" data="[[ $variables.listingADP ]]" columns="[[ $application.variables.mateuListing.columns ]]" on-oj-row-action="[[ $listeners.mateuRowAction ]]"> <template slot="noData"> <oj-sp-empty-state primary-text="[[ $application.variables.mateuListing.emptyStateMessage ]]" secondary-text=""></oj-sp-empty-state> </template> <template slot="cellEditText"> <oj-input-text class="oj-form-control-full-width" value="[[ $current.data ]]" on-value-changed="[[ $listeners.mateuCellEdited ]]"></oj-input-text> </template> <template slot="cellEditNumber"> <oj-input-number class="oj-form-control-full-width" value="[[ $current.data ]]" on-value-changed="[[ $listeners.mateuCellEdited ]]"></oj-input-number> </template> <template slot="cellEditBoolean"> <oj-switch value="[[ $current.data ]]" on-value-changed="[[ $listeners.mateuCellEdited ]]"></oj-switch> </template> <template slot="cellStatusBadge"> <span :class="[[ ($current.data && $current.data.badgeClass) || \'\' ]]"><oj-bind-text value="[[ ($current.data && $current.data.message) || $current.data ]]"></oj-bind-text></span> </template> <template slot="cellRowActions" data-oj-as="cell"> <oj-bind-for-each data="[[ (cell.data && cell.data.actions) || [] ]]"> <template> <oj-button chroming="outlined" class="oj-button-sm oj-sm-margin-1x-end" :data-method="[[ $current.data.methodNameInCrud ]]" :data-row-id="[[ cell.row.id ]]" on-oj-action="[[ $listeners.rowActionClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </template> </oj-table> </div> </div> </div> </oj-bind-if> <oj-drawer-popup id="mateuDrawerPanel" edge="end" modality="modal" opened="[[ $application.variables.mateuDrawerOpen ]]" on-oj-before-close="[[ $listeners.mateuDrawerClosed ]]"> <div class="oj-sm-padding-6x oj-flex oj-sm-flex-direction-column" style="min-height: 100vh; box-sizing: border-box; max-width: 90vw;" :style.width="[[ $application.variables.mateuDrawer.width || \'26rem\' ]]"> <h2 class="oj-typography-heading-md"><oj-bind-text value="[[ $application.variables.mateuDrawer.title ]]"></oj-bind-text></h2> <oj-bind-if test="[[ $application.variables.mateuDrawer.hasContent ]]"> <div class="oj-sm-margin-4x-top"> <oj-bind-for-each data="[[ $application.variables.mateuDrawer.content ]]"> <template> <div> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-form-layout id="mateuDrawerForm"> <oj-bind-for-each data="[[ $application.variables.mateuDrawer.fields ]]"> <template> <oj-bind-if test="[[ $current.data.isText ]]"> <oj-input-text label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-input-text> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTextArea ]]"> <oj-text-area label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" rows="4" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-text-area> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNumber ]]"> <oj-input-number label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-input-number> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBoolean ]]"> <oj-switch label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-switch> </oj-bind-if> </template> </oj-bind-for-each> </oj-form-layout> <oj-bind-if test="[[ $application.variables.mateuDrawer.actions.length > 0 ]]"> <div class="oj-flex oj-divider-top oj-sm-padding-4x-top" style="margin-top: auto; padding-top: 16px;"> <oj-bind-for-each data="[[ $application.variables.mateuDrawer.actions ]]"> <template> <oj-button class="oj-sm-margin-2x-end oj-sm-margin-1x-bottom" :data-action-id="[[ $current.data.actionId ]]" chroming="[[ $current.data.chroming ]]" on-oj-action="[[ $listeners.mateuActionClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </oj-drawer-popup> <oj-bind-if test="[[ !!$application.variables.mateuWizard ]]"> <oj-sp-guided-process id="mateuWizardEl" process-title="[[ $application.variables.mateuHostTitle ]]" steps="[[ $application.variables.mateuWizard.steps ]]" current-step="[[ $application.variables.mateuWizardShownStep ]]" primary-action="[[ $application.variables.mateuWizardPrimary ]]" on-sp-primary-action="[[ $listeners.mateuWizardPrimaryAction ]]" on-sp-before-next="[[ $listeners.mateuWizardContinue ]]" on-sp-before-step-navigate="[[ $listeners.mateuWizardStepNavigate ]]" on-sp-cancel="[[ $listeners.mateuWizardCancel ]]"> <div class="oj-sm-padding-4x"> <oj-bind-if test="[[ $application.variables.mateuWizardContent.length ]]"> <oj-bind-for-each data="[[ $application.variables.mateuWizardContent ]]"> <template> <oj-bind-if test="[[ $current.data.isCard ]]"> <div class="oj-panel oj-sm-margin-3x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPlain ]]"> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </template> </oj-bind-for-each> </oj-bind-if> <oj-form-layout id="mateuWizardForm"> <oj-bind-for-each data="[[ $application.variables.mateuFormFieldsList ]]"> <template> <oj-bind-if test="[[ $current.data.isText ]]"> <oj-input-text label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-input-text> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNumber ]]"> <oj-input-number label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-input-number> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBoolean ]]"> <oj-switch label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-switch> </oj-bind-if> </template> </oj-bind-for-each> </oj-form-layout> <div class="oj-flex oj-sm-margin-6x-top"> <oj-bind-for-each data="[[ $application.variables.mateuFormActions ]]"> <template> <oj-button class="oj-sm-margin-2x-end" :data-action-id="[[ $current.data.actionId ]]" chroming="[[ $current.data.chroming ]]" on-oj-action="[[ $listeners.mateuActionClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </div> </oj-sp-guided-process> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuFormMetadata && !$application.variables.mateuWizard ]]"> <div class="oj-flex oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <div class="oj-flex-item oj-sm-12 oj-md-6"> <oj-form-layout id="mateuForm"> <oj-bind-for-each data="[[ $application.variables.mateuFormFieldsList ]]"> <template> <oj-bind-if test="[[ $current.data.isText ]]"> <oj-input-text label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-input-text> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNumber ]]"> <oj-input-number label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-input-number> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBoolean ]]"> <oj-switch label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuFieldChanged ]]"></oj-switch> </oj-bind-if> </template> </oj-bind-for-each> </oj-form-layout> <div class="oj-flex oj-sm-margin-6x-top"> <oj-bind-for-each data="[[ $application.variables.mateuFormActions ]]"> <template> <oj-button class="oj-sm-margin-2x-end" :data-action-id="[[ $current.data.actionId ]]" chroming="[[ $current.data.chroming ]]" on-oj-action="[[ $listeners.mateuActionClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuQueue ]]"> <div class="oj-flex oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <div class="oj-flex-item oj-sm-12 oj-md-5 oj-lg-4"> <oj-bind-for-each data="[[ $application.variables.mateuQueue.groups ]]"> <template> <div class="oj-typography-subheading-xs oj-sm-margin-2x-vertical"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-action-card :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.queueItemClicked ]]"> <div class="oj-sm-padding-3x"> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <oj-bind-if test="[[ $current.data.hasAction ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-1x-top"> <oj-button chroming="outlined" display="all" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.queueRowAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </div> </oj-bind-if> </div> </oj-action-card> </template> </oj-bind-for-each> </template> </oj-bind-for-each> </div> <div class="oj-flex-item oj-sm-12 oj-md-7 oj-lg-8"> <oj-bind-if test="[[ !!$application.variables.mateuHostEmpty ]]"> <oj-sp-empty-state primary-text="[[ $application.variables.mateuHostEmpty.title ]]" secondary-text="[[ $application.variables.mateuHostEmpty.description ]]"></oj-sp-empty-state> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuIsland && !!$application.variables.mateuIsland.content ]]"> <div class="oj-sm-padding-4x-start"> <oj-bind-for-each data="[[ $application.variables.mateuIsland.content ]]"> <template> <oj-bind-if test="[[ $current.data.isCard ]]"> <div class="oj-panel oj-sm-margin-3x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.addonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.paymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPlain ]]"> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.addonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.paymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.islandBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$application.variables.mateuQueue && !!$application.variables.mateuHostEmpty ]]"> <div class="oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <oj-sp-empty-state primary-text="[[ $application.variables.mateuHostEmpty.title ]]" secondary-text="[[ $application.variables.mateuHostEmpty.description ]]"></oj-sp-empty-state> </div> </oj-bind-if> <oj-bind-if test="[[ $application.variables.mateuGop.on ]]"> <oj-sp-general-overview-page page-title="[[ $application.variables.mateuPageHeader.title ]]" page-subtitle="[[ $application.variables.mateuPageHeader.subtitle ]]" contextual-info="[[ $application.variables.mateuPageHeader.facts ]]" display-options.contextual-info-label="true" primary-action="[[ $application.variables.mateuPageHeader.primary ]]" secondary-actions="[[ $application.variables.mateuPageHeader.secondary ]]" on-sp-primary-action="[[ $listeners.headerPrimary ]]" on-sp-secondary-action="[[ $listeners.headerSecondary ]]"> <div slot="main"> <oj-bind-if test="[[ !!$application.variables.mateuGop.main.title ]]"> <div class="oj-sm-margin-6x-bottom"> <h2 class="oj-typography-heading-sm" style="margin: 0;"><oj-bind-text value="[[ $application.variables.mateuGop.main.title ]]"></oj-bind-text></h2> <div class="mateu-fold-title-underline oj-sm-margin-2x-top"></div> </div> </oj-bind-if> <div class="oj-flex"> <oj-bind-for-each data="[[ $application.variables.mateuGop.main.blocks ]]"> <template> <oj-bind-if test="[[ $current.data.isCard ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-panel oj-sm-margin-3x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPlain ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> <div slot="info"> <oj-bind-if test="[[ !!$application.variables.mateuGop.info.title ]]"> <div class="oj-sm-margin-6x-bottom"> <h2 class="oj-typography-heading-sm" style="margin: 0;"><oj-bind-text value="[[ $application.variables.mateuGop.info.title ]]"></oj-bind-text></h2> <div class="mateu-fold-title-underline oj-sm-margin-2x-top"></div> </div> </oj-bind-if> <div class="oj-flex"> <oj-bind-for-each data="[[ $application.variables.mateuGop.info.blocks ]]"> <template> <oj-bind-if test="[[ $current.data.isCard ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-panel oj-sm-margin-3x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPlain ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-sp-general-overview-page> </oj-bind-if> <oj-bind-if test="[[ $application.variables.mateuHostContent.length ]]"> <div class="oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <div class="oj-flex"> <oj-bind-for-each data="[[ $application.variables.mateuHostContent ]]"> <template> <oj-bind-if test="[[ $current.data.isCard ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-panel oj-sm-margin-3x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPlain ]]"> <div :class="[[ $current.data.blockClass ]]"> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.isText && !$current.data.isHeading ]]"> <div class="oj-sm-margin-1x-bottom" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isHeading ]]"> <h3 class="oj-sm-margin-1x-bottom mateu-atom-heading" :class="[[ $current.data.cls ]]"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isProgress ]]"> <oj-train class="oj-sm-margin-4x-bottom" steps="[[ $current.data.steps ]]" selected-step="[[ $current.data.selectedId ]]"></oj-train> </oj-bind-if> <oj-bind-if test="[[ $current.data.isEntityHeader ]]"> <div class="oj-sm-margin-3x-bottom"> <span class="oj-typography-heading-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.badges ]]"> <template> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </template> </oj-bind-for-each> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-flex oj-sm-margin-1x-top"> <oj-bind-for-each data="[[ $current.data.facts ]]"> <template> <div class="oj-flex-item oj-sm-margin-4x-end"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNotice ]]"> <div :class="[[ $current.data.noticeClass ]]"> <span class="oj-typography-body-md oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.text ]]"></oj-bind-text></span> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBullets ]]"> <ul class="oj-sm-margin-2x-bottom mateu-atom-bullets"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <li class="oj-typography-body-md"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></li> </template> </oj-bind-for-each> </ul> </oj-bind-if> <oj-bind-if test="[[ $current.data.isSeparator ]]"> <div class="oj-sm-margin-3x-vertical"></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isButtons ]]"> <div class="oj-flex oj-sm-justify-content-flex-end oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.buttons ]]"> <template> <oj-button class="oj-sm-margin-1x-start" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBadge ]]"> <span class="oj-sm-margin-1x-end" :class="[[ $current.data.badgeClass ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> </oj-bind-if> <oj-bind-if test="[[ $current.data.isResourceGrid ]]"> <div class="oj-flex"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div :class="[[ $current.data.colClass ]]"> <oj-bind-if test="[[ $current.data.enabled ]]"> <oj-action-card class="oj-sm-margin-1x" :class="[[ $current.data.cardClass ]]" :data-item-id="[[ $current.data.id ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-sm-padding-2x"> <span class="oj-typography-body-md oj-typography-bold oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-xs"><oj-bind-text value="[[ $current.data.recommendedLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.note ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.disabled ]]"> <div class="oj-panel oj-sm-margin-1x"> <span class="oj-typography-body-md oj-text-color-disabled oj-sm-margin-1x-end"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></span> <span :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.statusLabel ]]"></oj-bind-text></span> <div class="oj-typography-body-xs oj-text-color-disabled"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> </div> </oj-bind-if> </div> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isOffer ]]"> <div class="oj-panel oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.tag ]]"></oj-bind-text></div> <div class="oj-typography-subheading-sm"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.subtitle ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.features ]]"></oj-bind-text></div> <div class="oj-typography-body-sm oj-text-color-success oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.currentLabel ]]"></oj-bind-text></div> <div class="oj-typography-body-md oj-typography-bold"><oj-bind-text value="[[ $current.data.priceLabel ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-sm-margin-2x-top" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isAddOns ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.icon + \' \' + $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm oj-sm-margin-2x-end"><oj-bind-text value="[[ $current.data.priceText ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.selectable ]]"> <oj-switch class="oj-flex-item oj-sm-flex-initial" value="[[ $current.data.added ]]" :data-item-id="[[ $current.data.id ]]" on-value-changed="[[ $listeners.hostAddonToggled ]]"></oj-switch> </oj-bind-if> <oj-bind-if test="[[ !$current.data.selectable ]]"> <span class="oj-badge oj-badge-success oj-badge-subtle"><oj-bind-text value="[[ $current.data.includedLabel ]]"></oj-bind-text></span> </oj-bind-if> </div> </template> </oj-bind-for-each> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStatusList ]]"> <div :class="[[ $current.data.wrapClass ]]"> <oj-bind-for-each data="[[ $current.data.items ]]"> <template> <oj-bind-if test="[[ $current.data.rowClickable ]]"> <oj-action-card class="oj-sm-margin-1x-bottom mateu-row-card" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-2x"> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> </div> </oj-action-card> </oj-bind-if> <oj-bind-if test="[[ $current.data.gridCell ]]"> <div :class="[[ $current.data.cellClass ]]"> <div class="oj-flex-item oj-flex oj-sm-flex-direction-column"> <div class="oj-flex-item oj-sm-flex-initial"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> </div> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasActions ]]"> <div class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && ($current.data.hasActions || $current.data.hasLines) ]]"> <div class="oj-sm-margin-4x-bottom mateu-list-item"> <div class="oj-flex oj-sm-align-items-center mateu-item-head"> <oj-bind-if test="[[ !$current.data.isH4 ]]"> <h3 class="oj-flex-item oj-typography-subheading-xs oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h3> </oj-bind-if> <oj-bind-if test="[[ $current.data.isH4 ]]"> <h4 class="oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-margin-2x-end" style="margin: 0;"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></h4> </oj-bind-if> <span class="oj-flex-item oj-sm-flex-initial" :class="[[ $current.data.statusBadgeClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></span> </div> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-top"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.hasLines ]]"> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-typography-body-xs oj-text-color-secondary oj-sm-margin-1x-bottom"><oj-bind-text value="[[ $current.data ]]"></oj-bind-text></div> </template> </oj-bind-for-each> </div> </oj-bind-if> <div class="oj-sm-margin-2x-top"> <oj-bind-for-each data="[[ $current.data.actions ]]"> <template> <oj-bind-if test="[[ $current.data.iconClass ]]"> <oj-button class="oj-button-sm" display="icons" chroming="borderless" title="[[ $current.data.label ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"> <span slot="startIcon" :class="[[ $current.data.iconClass ]]"></span> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> </oj-button> </oj-bind-if> <oj-bind-if test="[[ !$current.data.iconClass ]]"> <oj-button class="oj-button-sm oj-sm-margin-1x-end" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !$current.data.rowClickable && !$current.data.gridCell && !$current.data.hasActions && !$current.data.hasLines ]]"> <div :class="[[ $current.data.rowClass ]]"> <oj-avatar class="oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-end" size="xs" initials="[[ $current.data.avatar ]]"></oj-avatar> <div class="oj-flex-item"> <div class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.title ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.description ]]"></oj-bind-text></div> </div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-sm" :class="[[ $current.data.statusClass ]]"><oj-bind-text value="[[ $current.data.status ]]"></oj-bind-text></div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-button-sm oj-flex-item oj-sm-flex-initial oj-sm-margin-2x-start" chroming="outlined" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isLedger ]]"> <oj-bind-for-each data="[[ $current.data.lines ]]"> <template> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-md"><oj-bind-text value="[[ $current.data.concept ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md" :class="[[ $current.data.amountClass ]]"><oj-bind-text value="[[ $current.data.amountText ]]"></oj-bind-text></div> </div> </template> </oj-bind-for-each> <div class="oj-flex oj-sm-margin-2x-top"> <div class="oj-flex-item oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-subheading-xs"><oj-bind-text value="[[ $current.data.totalText ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPayment ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom"> <div class="oj-flex-item oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.contextLabel ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.contextValue ]]"></oj-bind-text></div> </div> <div class="oj-sm-margin-2x-bottom"> <oj-bind-for-each data="[[ $current.data.methods ]]"> <template> <oj-button class="oj-sm-margin-1x-end" chroming="[[ $current.data.chroming ]]" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> <oj-button chroming="callToAction" class="oj-sm-margin-1x-top" :data-action-id="[[ $current.data.confirmActionId ]]" on-oj-action="[[ $listeners.hostPaymentConfirm ]]"><oj-bind-text value="[[ $current.data.confirmLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.isTaskProgress ]]"> <div :class="[[ $current.data.panelClass ]]"> <div class="oj-flex oj-sm-align-items-center"> <div class="oj-flex-item"> <span class="oj-typography-body-md"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-start"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></span> </div> <oj-bind-if test="[[ $current.data.actionLabel ]]"> <oj-button class="oj-flex-item oj-sm-flex-initial" chroming="callToAction" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.hostBlockAction ]]"><oj-bind-text value="[[ $current.data.actionLabel ]]"></oj-bind-text></oj-button> </oj-bind-if> </div> <oj-c-progress-bar class="oj-sm-margin-2x-top" style="width: 100%;" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isMeter ]]"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <oj-c-progress-bar class="oj-sm-margin-1x-vertical" value="[[ $current.data.value ]]" max="[[ $current.data.max ]]"></oj-c-progress-bar> <div class="oj-typography-body-sm"><oj-bind-text value="[[ $current.data.valueText ]]"></oj-bind-text></div> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.caption ]]"></oj-bind-text></div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isStat ]]"> <div class="oj-sm-margin-2x-bottom"> <div class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-typography-heading-sm"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isPropertyRow ]]"> <div class="oj-flex oj-sm-margin-1x-bottom"> <div class="oj-flex-item oj-typography-body-sm oj-text-color-secondary"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></div> <div class="oj-flex-item oj-sm-flex-initial oj-typography-body-md"><oj-bind-text value="[[ $current.data.value ]]"></oj-bind-text></div> </div> </oj-bind-if> <oj-bind-if test="[[ $current.data.isInput ]]"> <oj-input-text class="oj-form-control-max-width-md" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.hostInputChanged ]]" on-raw-value-changed="[[ $listeners.hostInputTyped ]]"></oj-input-text> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> </template> </oj-bind-for-each> </div> </div> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuIsland && !$application.variables.mateuIsland.content ]]"> <div class="oj-flex oj-sm-padding-12x-horizontal oj-sm-padding-6x-vertical"> <div class="oj-flex-item oj-sm-12 oj-md-6"> <oj-form-layout id="mateuIslandForm"> <oj-bind-for-each data="[[ $application.variables.mateuIsland.fields ]]"> <template> <oj-bind-if test="[[ $current.data.isText ]]"> <oj-input-text label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuIslandFieldChanged ]]"></oj-input-text> </oj-bind-if> <oj-bind-if test="[[ $current.data.isNumber ]]"> <oj-input-number label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" required="[[ $current.data.required ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuIslandFieldChanged ]]"></oj-input-number> </oj-bind-if> <oj-bind-if test="[[ $current.data.isBoolean ]]"> <oj-switch label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" readonly="[[ $current.data.readonly ]]" :data-field-id="[[ $current.data.fieldId ]]" on-value-changed="[[ $listeners.mateuIslandFieldChanged ]]"></oj-switch> </oj-bind-if> </template> </oj-bind-for-each> </oj-form-layout> <div class="oj-flex oj-sm-margin-4x-top"> <oj-bind-for-each data="[[ $application.variables.mateuIsland.actions ]]"> <template> <oj-button class="oj-sm-margin-2x-end" :data-action-id="[[ $current.data.actionId ]]" chroming="[[ $current.data.chroming ]]" on-oj-action="[[ $listeners.mateuIslandActionClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </template> </oj-bind-for-each> </div> </div> </div> </oj-bind-if> </div>';});

/* Copyright (c) 2026, Oracle and/or its affiliates */

define('flows/main/pages/main-start-page',[], function() {
  'use strict';

  class PageModule {
  }

  return PageModule;
});


define('text!flows/main/pages/main-start-page.json',[],function () { return '{"title":"","description":"Contenido alimentado por Mateu: título + form / listado + drawer del crud; la carga la orquesta la shell","variables":{"listingADP":{"type":"vb/ArrayDataProvider2","defaultValue":{"data":"{{ $application.variables.mateuListingRows }}","keyAttributes":"_rowNumber"},"description":"envuelve las filas del listing de Mateu para oj-table (_rowNumber siempre presente)"},"mateuDraft":{"type":"any","defaultValue":{},"description":"edición en curso del form del host ({fieldId: valor})"},"mateuDrawerDraft":{"type":"any","defaultValue":{},"description":"edición en curso del form del drawer"},"mateuToastText":{"type":"string","defaultValue":""},"mateuIslandDraft":{"type":"any","defaultValue":{},"description":"edición en curso del form de la isla"},"overviewADP":{"type":"vb/ArrayDataProvider2","defaultValue":{"data":"{{ $application.variables.mateuOverviewOptions }}","keyAttributes":"value"}},"welcomeTrendADP":{"type":"vb/ArrayDataProvider2","defaultValue":{"data":"{{ $application.variables.mateuWelcomeTrendItems }}","keyAttributes":"id"},"description":"items del chart de previsión de la welcome para el oj-chart"},"overviewSelectConfig":{"type":"any","defaultValue":{"data":"{{ $page.variables.overviewADP }}","itemText":"label","labelHint":"Record"},"description":"selectObject del header-general-overview (el DataProvider va DENTRO del objeto)"},"mateuSmartFilters":{"type":"any","defaultValue":{"askHint":"Buscar…","value":[]},"description":"config/estado del smart filter del header de colección (chips keyword)"},"mateuProgressTitle":{"type":"string","defaultValue":""},"mateuProgressText":{"type":"string","defaultValue":""},"mateuProgressValue":{"type":"number","defaultValue":0},"mateuModalOpen":{"type":"boolean","defaultValue":false}},"metadata":{},"types":{},"chains":{},"eventListeners":{"mateuFieldChanged":{"chains":[{"parameters":{"fieldId":"{{ $current.data.fieldId }}","event":"{{ $event }}"},"chain":"mateuFieldEdited"}]},"mateuActionClicked":{"chains":[{"parameters":{"actionId":"{{ $current.data.actionId }}","parameters":"{{ $current.data.parameters }}","event":"{{ $event }}"},"chain":"runMateuAction"}]},"mateuRowAction":{"chains":[{"parameters":{"event":"{{ $event }}"},"chain":"mateuRowClicked"}]},"mateuDrawerClosed":{"chains":[{"chain":"mateuDrawerDismissed"}]},"mateuSearchAction":{"chains":[{"parameters":{"searchText":"{{ $event.detail.value }}"},"chain":"runMateuSearch"}]},"mateuWizardContinue":{"chains":[{"chain":"wizardNext"}]},"mateuWizardPrimaryAction":{"chains":[{"chain":"wizardNext"}]},"mateuWizardStepNavigate":{"chains":[{"chain":"wizardStepNavigate","parameters":{"event":"{{ $event }}"}}]},"mateuWizardCancel":{"chains":[{"chain":"wizardCancel"}]},"mateuIslandFieldChanged":{"chains":[{"chain":"islandFieldEdited","parameters":{"fieldId":"{{ $current.data.fieldId }}","event":"{{ $event }}"}}]},"mateuIslandActionClicked":{"chains":[{"chain":"runMateuIslandAction","parameters":{"actionId":"{{ $current.data.actionId }}"}}]},"welcomePrimary":{"chains":[{"chain":"runMateuAction","parameters":{"actionId":"{{ $application.variables.mateuWelcome.primaryCtaId }}"}}]},"welcomeSecondary":{"chains":[{"chain":"runMateuAction","parameters":{"actionId":"{{ $application.variables.mateuWelcome.secondaryCtaId }}"}}]},"overviewSwitched":{"chains":[{"chain":"onOverviewSwitch","parameters":{"event":"{{ $event }}"}}]},"itemTabChanged":{"chains":[{"chain":"onItemTabSelected","parameters":{"event":"{{ $event }}"}}]},"listPrimary":{"chains":[{"chain":"runMateuAction","parameters":{"actionId":"{{ $application.variables.mateuListPrimaryId }}"}}]},"listSecondary":{"chains":[{"chain":"onListSecondary","parameters":{"event":"{{ $event }}"}}]},"mateuCellEdited":{"chains":[{"chain":"mateuCellEdited","parameters":{"event":"{{ $event }}","row":"{{ $current.row }}","item":"{{ $current.item }}","columnIndex":"{{ $current.columnIndex }}"}}]},"queueItemClicked":{"chains":[{"chain":"queueItemClicked","parameters":{"itemId":"{{ $current.data.id }}"}}]},"islandBlockAction":{"chains":[{"chain":"dispatchIslandAction","parameters":{"actionId":"{{ $current.data.actionId }}","parameters":"{{ $current.data.parameters }}","fromNested":"{{ $current.data.fromNested }}"}}]},"addonToggled":{"chains":[{"chain":"addonToggled","parameters":{"event":"{{ $event }}","itemId":"{{ $current.data.id }}"}}]},"paymentConfirm":{"chains":[{"chain":"runMateuIslandAction","parameters":{"actionId":"{{ $current.data.confirmActionId }}","parameters":"{{ $current.data.confirmParameters }}"}}]},"nestedBlockAction":{"chains":[{"chain":"runMateuNestedAction","parameters":{"actionId":"{{ $current.data.actionId }}","parameters":"{{ $current.data.parameters }}"}}]},"queueRowAction":{"chains":[{"chain":"queueRowAction","parameters":{"actionId":"{{ $current.data.actionId }}","parameters":"{{ $current.data.parameters }}"}}]},"hostBlockAction":{"chains":[{"chain":"dispatchHostBlockAction","parameters":{"actionId":"{{ $current.data.actionId }}","parameters":"{{ $current.data.parameters }}","fromNested":"{{ $current.data.fromNested }}"}}]},"hostPaymentConfirm":{"chains":[{"chain":"runMateuAction","parameters":{"actionId":"{{ $current.data.confirmActionId }}","parameters":"{{ $current.data.confirmParameters }}"}}]},"hostAddonToggled":{"chains":[{"chain":"hostAddonToggled","parameters":{"event":"{{ $event }}","itemId":"{{ $current.data.id }}"}}]},"smartFiltersChanged":{"chains":[{"chain":"smartFiltersChanged","parameters":{"event":"{{ $event }}"}}]},"hostInputChanged":{"chains":[{"chain":"hostInputChanged","parameters":{"event":"{{ $event }}","fieldId":"{{ $current.data.fieldId }}","fromNested":"{{ $current.data.fromNested }}"}}]},"headerPrimary":{"chains":[{"chain":"runMateuAction","parameters":{"actionId":"{{ $application.variables.mateuPageHeader.primaryId }}"}}]},"headerSecondary":{"chains":[{"chain":"headerSecondaryAction","parameters":{"event":"{{ $event }}"}}]},"mateuModalClosed":{"chains":[{"chain":"mateuModalDismissed"}]},"hostInputTyped":{"chains":[{"chain":"hostInputTyped","parameters":{"fieldId":"{{ $current.data.fieldId }}","event":"{{ $event }}"}}]},"quickFilterClicked":{"chains":[{"chain":"listingQuickFilter","parameters":{"fieldId":"{{ $application.variables.mateuListing.quickFilters[0].fieldId }}","value":"{{ $current.data.value }}"}}]},"welcomeKpiClicked":{"chains":[{"chain":"runMateuAction","parameters":{"actionId":"{{ $current.data.kpiActionId }}"}}]},"rowActionClicked":{"chains":[{"chain":"listingRowAction","parameters":{"methodName":"{{ $event.target.dataset.method }}","rowId":"{{ $event.target.dataset.rowId }}"}}]},"mateuRetryAction":{"chains":[{"parameters":{"actionId":"{{ $event.actionId }}","parameters":"{{ $event.parameters }}"},"chain":"runMateuAction"}]}},"imports":{"components":{"oj-form-layout":{"path":"ojs/ojformlayout"},"oj-input-text":{"path":"ojs/ojinputtext"},"oj-input-number":{"path":"ojs/ojinputnumber"},"oj-switch":{"path":"ojs/ojswitch"},"oj-button":{"path":"ojs/ojbutton"},"oj-sp-messages-toast":{"path":"oj-sp/messages-toast/loader"},"oj-table":{"path":"ojs/ojtable"},"oj-input-search":{"path":"ojs/ojinputsearch"},"oj-sp-empty-state":{"path":"oj-sp/empty-state/loader"},"oj-drawer-popup":{"path":"ojs/ojdrawerpopup"},"oj-sp-foldout-layout":{"path":"oj-sp/foldout-layout/loader"},"oj-sp-foldout-panel":{"path":"oj-sp/foldout-panel/loader"},"oj-sp-guided-process":{"path":"oj-sp/guided-process/loader"},"oj-sp-header-welcome-banner":{"path":"oj-sp/header-welcome-banner/loader"},"oj-sp-header-general-overview":{"path":"oj-sp/header-general-overview/loader"},"oj-tab-bar":{"path":"ojs/ojtabbar"},"oj-sp-smart-filter-search":{"path":"oj-sp/smart-filter-search/loader"},"oj-action-card":{"path":"ojs/ojactioncard"},"oj-train":{"path":"ojs/ojtrain"},"oj-avatar":{"path":"ojs/ojavatar"},"oj-progress-bar":{"path":"ojs/ojprogress"},"oj-sp-general-overview-page":{"path":"oj-sp/general-overview-page/loader"},"oj-sp-filter-chip":{"path":"oj-sp/filter-chip/loader"},"oj-chart":{"path":"ojs/ojchart"}}}}';});

/* Fila del Ask Oracle: cierra la paleta y navega; una "vista rápida" deja además el
 * filtro del listado PENDIENTE — onMateuNavigate lo aplica en la búsqueda OnLoad en
 * lugar de resetearlo (el chip aparece aplicado al aterrizar). */

define('pages/shell-page-chains/askOracleGo',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class askOracleGo extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.item  destino ({route, quickField?, quickValue?})
     */
    async run(context, { item }) {
      const { $application } = context;
      if (!item || !item.route) {
        return;
      }
      await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'close' });
      if (item.quickField && item.quickValue) {
        $application.variables.mateuQuickFilter = { fieldId: item.quickField, value: item.quickValue };
        $application.variables.mateuQuickFilterPending = true;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { route: item.route } }, force: true },
      });
    }
  }

  return askOracleGo;
});

/* Ask Oracle (FAB del shell): abre la paleta con TODOS los destinos (navegación + las
 * vistas rápidas del listado) y el foco en el buscador. */

define('pages/shell-page-chains/askOracleOpen',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  // catálogo de destinos: navegación del app + vistas rápidas del listado de reservas
  const buildResults = ($application, text) => {
    const items = [];
    const home = $application.variables.mateuHomeRoute;
    if (home) {
      items.push({ label: 'Inicio', route: home, icon: 'oj-ux-ico-home', kind: 'Ir a' });
    }
    for (const nav of $application.variables.mateuNavItems || []) {
      items.push({ label: nav.label, route: nav.id,
        icon: nav.icon || 'oj-ux-ico-arrow-circle-right', kind: 'Ir a' });
    }
    for (const vista of [
      ['Llegadas hoy', 'LLEGADAS_HOY'],
      ['Salidas hoy', 'SALIDAS_HOY'],
      ['In house', 'IN_HOUSE'],
    ]) {
      items.push({ label: 'Reservas — ' + vista[0], route: '/reservas',
        quickField: 'vista', quickValue: vista[1],
        icon: 'oj-ux-ico-filter', kind: 'Vista rápida' });
    }
    const busca = (text || '').trim().toLowerCase();
    return busca
      ? items.filter((item) => item.label.toLowerCase().indexOf(busca) >= 0)
      : items;
  };

  class askOracleOpen extends ActionChain {

    async run(context) {
      const { $application, $page } = context;
      $page.variables.mateuAskResults = buildResults($application, '');
      await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'open' });
      setTimeout(() => {
        const input = document.querySelector('#mateuAskInput input');
        if (input) input.focus();
      }, 300);
    }
  }

  askOracleOpen.buildResults = buildResults;
  return askOracleOpen;
});

/* Tecleo en el buscador del Ask Oracle: re-filtra los destinos en vivo. */

define('pages/shell-page-chains/askOracleTyped',[
  'vb/action/actionChain',
  './askOracleOpen',
], (
  ActionChain,
  askOracleOpen,
) => {
  'use strict';

  class askOracleTyped extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  rawValueChanged ({detail: {value}})
     */
    async run(context, { event }) {
      const { $application, $page } = context;
      const text = event && event.detail ? event.detail.value : '';
      $page.variables.mateuAskResults = askOracleOpen.buildResults($application, text);
    }
  }

  return askOracleTyped;
});

/* Copyright (c) 2026, Oracle and/or its affiliates */

define('pages/shell-page-chains/closeMessageBanner',[
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class closeMessageBanner extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context, { event }) {
      const { $page } = context;

      await Actions.fireDataProviderEvent(context, {
        target: $page.variables.messagesBannerADP,
        remove: {
          keys: [event.detail.messageId],
        },
      });

    }
  }

  return closeMessageBanner;
});

/* Cierra la banda de error del transporte. El mensaje ya viene TRADUCIDO desde
 * poc/resilience.mjs (classifyRequestFailure): aquí sólo se descarta. */

define('pages/shell-page-chains/dismissMateuError',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
) => {
  'use strict';

  class dismissMateuError extends ActionChain {

    async run(context) {
      const { $application } = context;
      $application.variables.mateuLastError = '';
    }
  }

  return dismissMateuError;
});

/* Bootstrap de la shell (Fases 2/6): el App de Mateu configura menú (con grupos),
 * selectores @AppContext y acciones de cabecera; se navega a la primera opción no-grupo. */

define('pages/shell-page-chains/loadMateuShell',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  /**
   * Pone nombre a los iconos de expandir/colapsar de los grupos del menú.
   *
   * Los genera oj-navigation-list por dentro como `<a role="button">` VACÍOS: un lector de
   * pantalla los anuncia como "botón", sin decir de qué. No es marcado nuestro y no podemos
   * cambiar cómo los emite JET, pero sí nombrarlos después, tomando el texto del grupo al
   * que pertenecen — que es lo que el usuario necesita oír.
   */
  const nameCollapseIcons = () => {
    const list = document.querySelector('#mateuNavList');
    if (!list) return;
    list.querySelectorAll('.oj-navigationlist-collapse-icon').forEach((icon) => {
      const item = icon.closest('li');
      const label = item ? (item.textContent || '').trim().split('\n')[0].trim() : '';
      icon.setAttribute('aria-label', label ? `Desplegar ${label}` : 'Desplegar grupo');
    });
  };

  class loadMateuShell extends ActionChain {

    async run(context) {
      const { $application } = context;

      const base = $application.constants.mateuBaseUrl;

      // Static-bundle (modo sin backend): si hay un mateuBundleUrl configurado, se arranca la carga
      // del manifest AQUÍ, antes del bootstrap. bootstrapShell/loadRoute esperan al fetch en vuelo
      // (awaitBundle) y responden desde el bundle cuando la ruta está — así las cargas van sin
      // backend y, si el backend no está, hasta la shell cae a la ruta raíz bundleada.
      const bundleUrl = $application.constants.mateuBundleUrl;
      if (bundleUrl) bridge.loadBundleManifest(bundleUrl);

      // Resiliencia del transporte (mismo contrato que los renderers web, ver poc/resilience.mjs).
      // Se cablea ANTES del primer bootstrapShell para que hasta la carga inicial cuente: si el
      // backend está caído al arrancar, el usuario ve un mensaje en vez de una pantalla muerta.
      bridge.connectivity.start();
      // Las regiones vivas tienen que EXISTIR antes de que nada escriba en ellas: una creada
      // y rellenada en el mismo tick a menudo no se anuncia.
      bridge.installAnnouncer();
      bridge.mountSkipLink();
      // El control pulsado se sigue a nivel de documento: los botones de la app pasan por
      // chains distintas y enhebrar el evento por todas ellas se olvidaría en la siguiente.
      bridge.trackPressedControls();
      bridge.setTransportHooks({
        onStart: () => { $application.variables.mateuBusy = true; bridge.markPressedControlBusy(); },
        onSettle: ({ failure }) => {
          $application.variables.mateuBusy = false;
          bridge.clearPressedControlBusy();
          // 'cancelled' es una decisión nuestra (navegación, abort): nunca es noticia.
          if (failure && failure.kind !== 'cancelled') {
            $application.variables.mateuLastError = failure.message;
            // La banda es una señal visual; quien usa lector de pantalla no se enteraría.
            bridge.announce(failure.message, { politeness: 'assertive' });
          }
        },
      });
      // Perder la conexión es un ESTADO, no un evento: mientras dura se sostiene una banda,
      // en vez de un aviso por clic que el usuario ve pasar cinco segundos cada vez.
      bridge.connectivity.subscribe((online) => {
        $application.variables.mateuOffline = !online;
      });
      const reg = bridge.reduceContexts(
        { contexts: {}, stack: [], shell: null },
        await bridge.bootstrapShell(base),
      );
      $application.variables.mateuRegistry = reg;

      // Las secciones que sirve otro pod llegan marcadas y sin hijos: hay que ir a
      // buscarlos antes de construir el nav, o la barra sale con rótulos y nada debajo.
      // Un pod que no conteste deja su rótulo y no impide arrancar.
      if (reg.shell && reg.shell.menu) {
        reg.shell.menu = await bridge.expandRemoteMenus(reg.shell.menu);
      }

      const nav = bridge.shellNavOf(reg);
      const appState = $application.variables.mateuAppState || {};
      $application.variables.mateuNavItems = nav.items;
      $application.variables.mateuMenuTabs = nav.mode === 'tabs';
      $application.variables.mateuMenuTopbar = nav.mode === 'topbar';
      $application.variables.mateuMenuDrawerMode = nav.mode === 'drawer';
      $application.variables.mateuNavDrawerOpen = nav.mode === 'drawer'; // abierto de inicio
      $application.variables.mateuMenuTree = nav.menuTree;
      $application.variables.mateuContextSelectors = nav.selectors.map((selector) => Object.assign({}, selector, {
        value: appState[selector.fieldName] != null ? appState[selector.fieldName] : null,
      }));
      $application.variables.mateuHeaderActions = nav.headerActions;
      $application.variables.mateuShellSST = nav.serverSideType || '';
      // logo del @App (URL relativa al backend Mateu) → imagen de marca en el header
      $application.variables.mateuShellLogo = reg.shell && reg.shell.logo
        ? base + reg.shell.logo : '';
      if (reg.shell && reg.shell.title) {
        document.title = reg.shell.title;
      }

      if (nav.mode === 'drawer') {
        // el navigation-list parsea su <ul> en el init; los li estampados llegan después
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuNavList', method: 'refresh' });
          nameCollapseIcons();
        } catch (ignored) { /* aún no montado: el refresh del toggle lo cubrirá */ }
      }

      const firstLeaf = nav.menuTree.find((entry) => !entry.hasChildren);
      const firstGroup = nav.menuTree.find((entry) => entry.hasChildren);
      const first = firstLeaf || (firstGroup && firstGroup.children[0]);
      // la HOME del app (@HomeRoute, p.ej. la welcome page) manda sobre la primera
      // opción del menú
      const homeRoute = nav.homeRoute || (first ? first.id : '');
      $application.variables.mateuHomeRoute = homeRoute;

      // 1.5: URL de la shell — modo PATH (/ruta) cuando la app la sirve el backend Mateu
      // (jar de renderer: el controller generado inyecta un <mateu-ui> oculto, la señal),
      // modo HASH (#/ruta) en serving estático (vb-serve local / VB hosteado en Oracle,
      // donde el server no puede reescribir paths arbitrarios al index)
      const pathMode = !!document.querySelector('mateu-ui');
      window.__mateuUrlPathMode = pathMode;
      const urlRoute = () => (pathMode
        ? (window.location.pathname === '/' ? '' : window.location.pathname)
        : (window.location.hash || '').replace(/^#/, ''));

      // deep-link — si la URL trae ruta, bootear ESA ruta
      const deepLink = urlRoute();
      const startRoute = deepLink || homeRoute;
      if (startRoute) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: startRoute } }, fromUrl: !!deepLink },
        });
      }

      // 1.5: back/forward — el listener reutiliza el context del chain (los scopes de VB
      // siguen vivos tras el vbEnter); popstate en modo path, hashchange en modo hash
      if (!window.__mateuHashWired) {
        window.__mateuHashWired = true;
        window.addEventListener(pathMode ? 'popstate' : 'hashchange', () => {
          // en modo path, volver a '/' es volver a la home
          const route = urlRoute() || (pathMode ? ($application.variables.mateuHomeRoute || '') : '');
          if (route) {
            Actions.callChain(context, {
              chain: 'onMateuNavigate',
              params: { event: { detail: { currentId: route } }, fromUrl: true },
            });
          }
        });
      }
    }
  }

  return loadMateuShell;
});

/* Selector @AppContext del header (Fase 6): fija el valor en el appState de aplicación
 * (viaja en CADA request) y recarga la ruta actual contra el nuevo contexto — la
 * reactividad uniforme de Mateu (la pantalla se reconstruye con el contexto nuevo). */

define('pages/shell-page-chains/onMateuContextChanged',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuContextChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldName
     * @param {Object} params.event  value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { fieldName, event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // eco del set inicial del binding
      }
      if (!fieldName) {
        return;
      }

      const appState = Object.assign({}, $application.variables.mateuAppState);
      appState[fieldName] = detail.value == null ? null : detail.value;
      $application.variables.mateuAppState = appState;
      $application.variables.mateuContextSelectors =
        ($application.variables.mateuContextSelectors || []).map((selector) =>
          selector.fieldName === fieldName
            ? Object.assign({}, selector, { value: appState[fieldName] })
            : selector);

      const route = $application.variables.mateuSelectedRoute;
      if (route) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: route } }, force: true },
        });
      }
    }
  }

  return onMateuContextChanged;
});

/* Selección en el oj-navigation-list del navigator-drawer: un GRUPO solo se expande
 * (colapsable — no navega: su ruta compuesta no resuelve); una hoja navega y cierra
 * el drawer. Guarda updatedFrom internal contra el eco del set inicial. */

define('pages/shell-page-chains/onMateuNavDrawerSelect',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuNavDrawerSelect extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed ({detail: {value}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const route = detail.value;
      if (!route) {
        return;
      }
      const tree = $application.variables.mateuMenuTree || [];
      const group = tree.find((entry) => entry.id === route && entry.hasChildren);
      if (group) {
        return; // el clic en el grupo solo expande/colapsa
      }
      // el navigator es PERSISTENTE: navegar no lo cierra
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { currentId: route } } },
      });
    }
  }

  return onMateuNavDrawerSelect;
});

/* Navegación (Fases 2–6): un GRUPO del menú no toca el server (pinta su landing de submenú
 * en el contenido); una ruta normal carga en el host (mediador + triggers OnLoad incluidos)
 * y proyecta título/texto/form/listado. El @AppContext viaja como appState en cada request.
 * force=true (cambio de contexto) recarga aunque la ruta no cambie. */

define('pages/shell-page-chains/onMateuNavigate',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class onMateuNavigate extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSelectionChanged ({currentId}) o mateuNavigate ({route})
     * @param {boolean} params.force recargar aunque sea la misma ruta (cambio de contexto)
     */
    async run(context, { event, force, fromUrl }) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      let route = detail.currentId != null ? detail.currentId
        : detail.selectedValue != null ? detail.selectedValue
        : detail.value != null ? detail.value : detail.route;
      if (route == null || route === '') {
        return;
      }
      // Cualquier fallo de transporte durante esta navegación deja registrado un reintento
      // que la repite entera (la banda de error lo ofrece).
      const registerRetry = () => bridge.setLastRetry({ kind: 'navigate', route });
      // ?campo=valor en la ruta (p.ej. /reservas?vista=LLEGADAS_HOY, los KPIs de la
      // home): el filtro rápido viaja en la URL — se consume aquí como filtro
      // PENDIENTE (misma mecánica que el Ask Oracle) y la ruta queda limpia
      const queryIdx = route.indexOf('?');
      if (queryIdx >= 0) {
        const par = route.slice(queryIdx + 1).split('&')[0].split('=');
        route = route.slice(0, queryIdx);
        if (par.length === 2 && par[0] && par[1]) {
          $application.variables.mateuQuickFilter = {
            fieldId: par[0], value: decodeURIComponent(par[1]) };
          $application.variables.mateuQuickFilterPending = true;
          force = true; // aunque ya estemos en la ruta, hay que re-buscar filtrado
        }
      }
      // el eco del writeback de selection tras cada navegación — no recargar
      if (!force && route === $application.variables.mateuSelectedRoute) {
        return;
      }
      // dirtyGuard (1.5): edición local sin guardar → confirmar; al cancelar, restaurar la URL
      if (!force && $application.variables.mateuDirty) {
        if (!window.confirm('Hay cambios sin guardar. ¿Salir de esta pantalla?')) {
          const previous = $application.variables.mateuSelectedRoute;
          if (previous) {
            window.history.replaceState(null, '', '#' + previous);
          }
          return;
        }
        $application.variables.mateuDirty = false;
      }

      const base = $application.constants.mateuBaseUrl;
      const appState = $application.variables.mateuAppState || {};
      // Una entrada traída de otro pod SOLO se puede cargar llamando a ese pod. El bridge
      // registró a dónde va cada una al expandir el menú; sin esta consulta la petición saldría
      // al base de la shell, que no conoce esa ruta, y la pantalla quedaría vacía.
      const remote = bridge.remoteRouteOf(route);
      const callBase = (remote && remote.baseUrl) ? remote.baseUrl : base;
      const extra = remote
        ? { appState, consumedRoute: remote.consumedRoute, serverSideType: remote.serverSideType }
        : { appState };
      let reg;
      try {
        reg = await bridge.loadRouteInto(
          callBase, $application.variables.mateuRegistry, route, '', extra);
      } catch (e) {
        // La banda de error ya la puso el transporte (onSettle); aquí sólo se deja el
        // reintento a mano, y se corta: sin registro no hay nada que proyectar.
        registerRetry();
        return;
      }

      // triggers OnLoad del host (p.ej. el listing pide 'search' al cargar → llegan las filas)
      const loaded = reg.contexts[bridge.HOST_ID];
      // una vista rápida del Ask Oracle deja el filtro PENDIENTE: la búsqueda OnLoad
      // aterriza ya filtrada (y el chip aparece aplicado)
      const quickNav = $application.variables.mateuQuickFilterPending
        ? ($application.variables.mateuQuickFilter || {}) : {};
      for (const triggerActionId of bridge.onLoadTriggers(loaded)) {
        const listing = bridge.listingOf(loaded);
        const componentState = Object.assign(
          {}, loaded.state, { page: 0, size: (listing && listing.pageSize) || 20 });
        if (quickNav.fieldId && quickNav.value) {
          componentState[quickNav.fieldId] = quickNav.value;
        }
        const increment = await bridge.runMateuAction(
          base, loaded, route, triggerActionId, componentState, { appState });
        reg = bridge.reduceContexts(reg, increment);
      }

      // islas embebidas: cada frontera ServerSide del host se carga como superficie
      // propia (initiator = id de la frontera → sus fragments van a SU contexto)
      let hostForIslands = reg.contexts[bridge.HOST_ID];
      const islands = hostForIslands ? bridge.collectIslands(hostForIslands.tree) : [];
      const firstIsland = islands.length ? islands[0] : null;
      if (firstIsland) {
        // SIN atajo: el baile de 2 pasos captura las ACTIONS del wrapper (flag sse)
        reg = await bridge.loadRouteInto(base, reg, firstIsland.route, firstIsland.id, {
          appState,
          componentState: firstIsland.initialData || {},
        });
      }
      $application.variables.mateuIslandId = firstIsland ? firstIsland.id : '';
      $application.variables.mateuIslandSeed = firstIsland
        ? JSON.stringify(firstIsland.initialData || {}) : '';

      $application.variables.mateuRegistry = reg;
      $application.variables.mateuSelectedRoute = route;

      const host = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(host);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];

      // mismo remontaje que en runMateuAction: si venimos de OTRO foldout, recrear el
      // subárbol para que los bindings internos no se queden con los bloques viejos
      const foldoutProjection = bridge.foldoutOf(host);
      if ($application.variables.mateuFoldout && foldoutProjection) {
        $application.variables.mateuFoldout = null;
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      // el CONTENIDO se siembra ANTES de estampar la estructura: los paneles leen
      // mateuFoldoutContent.panels[i] al montarse
      $application.variables.mateuFoldoutContent = foldoutProjection
        ? { overview: foldoutProjection.overview, panels: foldoutProjection.panels }
        : { overview: { blocks: [] }, panels: [] };
      $application.variables.mateuFoldout = foldoutProjection;
      $application.variables.mateuWizard = bridge.wizardOf(host);
      const islandContext = firstIsland ? reg.contexts[firstIsland.id] : null;
      $application.variables.mateuIsland = islandContext
        ? { fields: bridge.fieldListOf(islandContext.tree, islandContext.state),
            actions: bridge.actionsOf(islandContext.tree),
            content: bridge.islandContentOf(islandContext) }
        : null;
      // isla ANIDADA dentro de la isla (App con initialData sembrado, p.ej. el documento):
      // cargar con el initialData como componentState; RECARGAR si el seed cambió (selectPax)
      const nestedList = islandContext ? bridge.collectIslands(islandContext.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        // SIN atajo consumedRoute/serverSideType: el baile de 2 pasos del mediador
        // captura las ACTIONS del wrapper (el flag sse solo viaja ahí → sseActionIds)
        reg = await bridge.loadRouteInto(base, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      $application.variables.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;
      // los átomos de la anidada se FUSIONAN en el contenido de la isla (fluyen por
      // $current — leer $application.variables en templates profundos no re-liga)
      if ($application.variables.mateuIsland && nestedBlocks) {
        $application.variables.mateuIsland = Object.assign({}, $application.variables.mateuIsland, {
          content: bridge.mergeNestedContent($application.variables.mateuIsland.content, nestedBlocks),
        });
      }



      // header de colección: toolbar del crud → primaryAction/secondaryActions
      const toolbar = listingSummary ? listingSummary.toolbar : [];
      const primaryToolbar = toolbar.length ? toolbar[0] : null;
      $application.variables.mateuListPrimary = primaryToolbar
        ? { label: primaryToolbar.label } : { label: '', display: 'off' };
      $application.variables.mateuListPrimaryId = primaryToolbar ? primaryToolbar.actionId : '';
      $application.variables.mateuListSecondary = toolbar.slice(1).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label }));
      // Si la carga falló, el reintento vuelve a entrar en ESTA chain con la misma ruta.
      bridge.setLastRetry(null);
      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      // Navegar en una SPA no cambia la página, así que no hay nada que un lector de pantalla
      // anuncie solo, y el foco se queda en el enlace del menú recién pulsado. Sólo aquí, en
      // una navegación REAL: en un re-render arrancaría el foco del campo que se esté editando.
      bridge.announceNavigation(summary.title || route);
      $application.variables.mateuOverviewTranslations = { goToParent: summary.title };
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      const wizardNow = $application.variables.mateuWizard;
      if (wizardNow) {
        const forwardBtn = bridge.wizardForwardOf(host);
        const forward = forwardBtn
          || summary.actions.find((a) => a.actionId !== 'back');
        $application.variables.mateuWizardForwardId = forward ? forward.actionId : '';
        $application.variables.mateuFormActions = []; // atrás = clic en el rail; adelante = Continue
        // sin availableFromStep: el primary solo aparece en el ÚLTIMO paso del tren
        // (y nunca null: el componente lee primaryAction.label incondicionalmente)
        $application.variables.mateuWizardPrimary = forward
          ? { label: forward.label, disabled: false }
          : { label: 'Done', disabled: true };
        // entrada fresca al wizard: arrancar por el OVERVIEW del guided-process
        // (el Start del componente pasa a paso 1 por writeback interno, sin evento)
        $application.variables.mateuWizardShownStep = '';
      } else {
        $application.variables.mateuWizardForwardId = '';
        $application.variables.mateuWizardPrimary = { label: '', disabled: true };
        $application.variables.mateuWizardShownStep = '';
      }


      // cola de trabajo del front-office (TaskQueue) + placeholder del detalle
      $application.variables.mateuQueue = bridge.taskQueueOf(host.tree);
      $application.variables.mateuHostEmpty = bridge.emptyStateOf(host.tree);
      // arquetipos compuestos (welcome / general overview / item overview)
      const welcome = bridge.welcomeOf(host);
      $application.variables.mateuWelcomeTrendItems =
        welcome && welcome.trend ? welcome.trend.items : [];
      const overviewProjection = bridge.generalOverviewOf(host);
      const itemProjection = bridge.itemOverviewOf(host);
      $application.variables.mateuWelcome = welcome;
      if (welcome) {
// los PARES color+ilustración del hero: las 5 parejas bg+fg de la galería
        // OFICIAL (fnd/gallery illust-welcome-banner-*-01..05) rotando con su tono
        const GALERIA = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/';
        const LOOKS = [
          ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
          ['dark-sienna', '04'], ['dark-teal', '05'],
        ];
        const look = LOOKS[Math.floor(Math.random() * LOOKS.length)];
        $application.variables.mateuWelcomeTheme = look[0];
        $application.variables.mateuWelcomeIlluBg = GALERIA + 'illust-welcome-banner-bg-' + look[1] + '.png';
        $application.variables.mateuWelcomeIllu = GALERIA + 'illust-welcome-banner-fg-' + look[1] + '.png';
      }
      $application.variables.mateuOverview = overviewProjection;
      $application.variables.mateuOverviewOptions = overviewProjection ? overviewProjection.switcherOptions : [];
      $application.variables.mateuItemOv = itemProjection;
      $application.variables.mateuItemTabTexts = itemProjection && itemProjection.tabs.length
        ? itemProjection.tabs[0].texts : [];
      if (itemProjection) {
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuItemTabs', method: 'refresh' });
        } catch (ignored) { /* aún sin montar */ }
      }
      if (welcome || overviewProjection || itemProjection) {
        // sus campos/botones los pintan las ramas del arquetipo, no el form genérico
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
      }
      // contenido display del HOST (detalle standalone) / de los pasos del wizard:
      // los bloques de islandContentOf con la isla del host (documento) fusionada
      const islandRawBlocks = islandContext ? bridge.islandContentOf(islandContext) : null;
      const esWizard = !!$application.variables.mateuWizard;
      const sinOtrasRamas = !listingSummary && !welcome && !overviewProjection && !itemProjection
        && !$application.variables.mateuQueue && !$application.variables.mateuFoldout;
      // un foldout con EntityHeader (p.ej. la Reserva 360) CONSERVA el header de pantalla:
      // el huésped + el CTA van en la banda, el foldout es solo el cuerpo
      const hostEntity = (!esWizard && (sinOtrasRamas || $application.variables.mateuFoldout))
        ? bridge.entityHeaderOf(host) : null;
      const hostBlocks = (!esWizard && sinOtrasRamas)
        ? bridge.hostContentOf(host, islandRawBlocks,
            { title: summary.title, dropEntityHeader: !!hostEntity }) : null;
      // los bloques MANDAN cuando son ricos (EntityHeader/Meter/Ledger…): el form genérico
      // y el texto plano se suprimen — misma regla que los arquetipos
      const hostBlocksRicos = !!(hostBlocks && hostBlocks.some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isTaskProgress || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow)));
      // las acciones del toolbar de la Page (se calculan aquí porque los templates de
      // página de entidad las recolocan: iop → goToParent/secondaryActions del panel)
      const hostToolbar = bridge.pageToolbarOf(host);
      // ITEM OVERVIEW nativo: página de entidad con la zona ESTRECHA primero (panel de
      // datos clave + main ancho) → oj-sp-item-overview-page + oj-sp-item-overview
      const iop = bridge.itemOverviewPageOf(hostEntity, hostBlocks, hostToolbar);
      const iopOn = !!iop;
      $application.variables.mateuIop = iop || {
        on: false,
        overview: { title: '', subtitle: '', badge: null, facts: [], blocks: [] },
        main: { blocks: [] },
        back: { show: false, actionId: '' },
        secondary: [],
      };
      // GENERAL OVERVIEW nativo: página de entidad con DOS bloques-columna (la ancha
      // primero) → el template oj-sp-general-overview-page (slots main/info, header integrado)
      const zonedGop = (hostBlocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''));
      const gopOn = !iopOn && !!(hostEntity && (hostBlocks || []).length === 2 && zonedGop.length === 2);
      const gopFold = (block) => {
        const items = (block.items || []);
        const conTitulo = items.length && items[0].isHeading && items[0].isH2;
        return {
          title: conTitulo ? items[0].text : '',
          blocks: [Object.assign({}, block, {
            blockClass: 'oj-flex-item oj-sm-12',
            items: conTitulo ? items.slice(1) : items,
          })],
        };
      };
      $application.variables.mateuGop = gopOn
        ? { on: true, main: gopFold(zonedGop[0]), info: gopFold(zonedGop[1]) }
        : { on: false, main: { title: '', blocks: [] }, info: { title: '', blocks: [] } };
      $application.variables.mateuHostContent = (!gopOn && !iopOn && hostBlocksRicos ? hostBlocks : null) || [];
      if (hostBlocksRicos) {
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
        $application.variables.mateuHostText = '';
      }
      $application.variables.mateuWizardContent = (esWizard
        ? bridge.hostContentOf(host, islandRawBlocks, { forWizard: true, title: summary.title }) : null) || [];
      // si los bloques del paso son RICOS, el form genérico del paso sobra (duplica lo
      // que ya muestran el header/las property rows) — misma regla que en el host
      if (($application.variables.mateuWizardContent || []).some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isTaskProgress || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow))) {
        $application.variables.mateuFormFieldsList = [];
      }

      // regla general: el header de página lo pinta SIEMPRE un header de vb; solo los
      // templates que ya integran el suyo (guided process / general overview / welcome /
      // smart-filter-search del listado) lo suprimen
      const integratedHeader = !!($application.variables.mateuWizard || welcome
        || overviewProjection || listingSummary
        || ($application.variables.mateuFoldout && !hostEntity));
      const showHeader = !integratedHeader;
      // 1.3: banners de página → el oj-sp-messages-banner del starter (shell).
      // El ADP se muta con fireDataProviderEvent (asignar .data no refresca)
      // el selector rápido del listado no sobrevive a la navegación — salvo que el
      // Ask Oracle lo haya dejado pendiente para ESTA carga
      if ($application.variables.mateuQuickFilterPending) {
        $application.variables.mateuQuickFilterPending = false;
      } else {
        $application.variables.mateuQuickFilter = {};
        $application.variables.mateuLastSearchText = '';
      }
      const banners = bridge.bannersOf(host);
      const staleKeys = $application.variables.mateuBannerKeys || [];
      if (staleKeys.length) {
        await Actions.fireDataProviderEvent(context, {
          target: $page.variables.messagesBannerADP,
          remove: { keys: staleKeys },
        });
      }
      for (const banner of banners) {
        await Actions.fireDataProviderEvent(context, {
          target: $page.variables.messagesBannerADP,
          add: { data: banner },
        });
      }
      $application.variables.mateuBannerKeys = banners.map((banner) => banner.id);
      // 1.6: anatomía pageWidth del contexto host
      // con navigator persistente a la izquierda, el formato pasa a edge-to-edge
      // automáticamente: centrar un fixed en el área restante queda raro (el drawer ya
      // consume el lateral); el gutter del contenido lo ponen las ramas (12x/6x)
      const drawerNav = $application.variables.mateuMenuDrawerMode;
      // con el template iop activo el FORMATO lo pone el template (ni fixed ni fullWidth:
      // sus zonas van directamente sobre el fondo de página) → wrapper a sangre
      const pageStyle = (drawerNav || iopOn)
        ? bridge.pageStyleOf({ pageWidth: 'edgeToEdge' })
        : bridge.pageStyleOf(host);
      // el shell adapta su chrome (p.ej. el chat FAB) al formato de página
      const pw = (drawerNav || iopOn) ? 'edgeToEdge' : ((host && host.pageWidth) || 'fixed');
      $application.variables.mateuShellPageLayout = pw === 'fixed' ? 'fixedWidth' : pw;
      $application.variables.mateuPageMaxWidth = pageStyle.maxWidth;
      $application.variables.mateuPageMargin = pageStyle.margin;
      $application.variables.mateuPagePadding = pageStyle.padding;
      if ($application.variables.mateuWelcome || $application.variables.mateuOverview
          || $application.variables.mateuWizard || listingSummary
          || $application.variables.mateuPageHeader) {
        // header Redwood a sangre: el gutter lo recupera cada rama de contenido
        $application.variables.mateuPagePadding = '0';
      }
      // anatomía RDS del header (feedback 2026-07-26): en fixed/fullWidth el header va
      // sobre una BANDA a sangre (fondo blanco de viewport a viewport) con su contenido
      // capado a la caja; la tarjeta de contenido SOLAPA la banda (margen -40px) para que
      // la banda asome por detrás de su arranque — como el fondo general del lienzo
      const showBand = showHeader && pw !== 'edgeToEdge';
      const showListBand = !!listingSummary && pw !== 'edgeToEdge';
      // las acciones del toolbar de la Page van al HEADER (primary/secondary de la banda)
      const primaryBtn = hostToolbar.find((b) => b.chroming === 'callToAction') || null;
      $application.variables.mateuPageHeader = {
        // con EntityHeader en el host (la 360), el header de PANTALLA muestra al huésped
        title: hostEntity ? hostEntity.title : (summary.title || ''),
        subtitle: hostEntity ? hostEntity.subtitle : '',
        facts: hostEntity ? hostEntity.facts : [],
        showBand: showBand && !gopOn && !iopOn,
        showInline: showHeader && !showBand && !gopOn && !iopOn,
        showListBand: showListBand,
        showListInline: !!listingSummary && !showListBand,
        primary: primaryBtn ? { label: primaryBtn.label, display: primaryBtn.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
        primaryId: primaryBtn ? primaryBtn.actionId : '',
        secondary: hostToolbar.filter((b) => b !== primaryBtn).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
        toolbar: hostToolbar,
      };
      // el solape -40px de la banda NO aplica con el template iop (sus sticky internos
      // calculan contra el flujo y el solape los descuadra)
      if ((showBand && !iopOn) || showListBand) {
        // la caja de la banda usa la MISMA fórmula horizontal que el contenido…
        $application.variables.mateuBandBoxMargin = $application.variables.mateuPageMargin;
        // …y el contenido gana el solape vertical (-40px) sobre la banda
        const marginParts = ($application.variables.mateuPageMargin || '0').split(' ');
        marginParts[0] = '-40px';
        if (marginParts.length === 1) marginParts.push('auto');
        $application.variables.mateuPageMargin = marginParts.join(' ');
      } else {
        $application.variables.mateuBandBoxMargin = '0 auto';
      }
      // 1.5: la URL refleja la ruta — path (/ruta) servida por el backend Mateu, hash
      // (#/ruta) en serving estático (el modo lo fija loadMateuShell en el bootstrap)
      if (!fromUrl) {
        if (window.__mateuUrlPathMode) {
          // la home (incluido el sentinel _no_home_route del server) es '/', no un path
          const home = $application.variables.mateuHomeRoute || '';
          const target = (!route || route === home) ? '/' : route;
          if (window.location.pathname !== target) {
            window.history.pushState(null, '', target);
          }
        } else if (window.location.hash !== '#' + route) {
          window.history.pushState(null, '', '#' + route);
        }
      }
      $application.variables.mateuDirty = false;

      if (reg.effects && reg.effects.docTitle) {
        document.title = reg.effects.docTitle;
      }
    }
  }

  return onMateuNavigate;
});

/* Clic en una opción de primer nivel del topbar (variante MENU_ON_TOP): la ruta viaja en
 * el data-route del botón. */

define('pages/shell-page-chains/onMateuTopbarNav',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuTopbarNav extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojAction del oj-button
     */
    async run(context, { event }) {
      const route = event && event.target && event.target.dataset && event.target.dataset.route;
      if (!route) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { currentId: route } } },
      });
    }
  }

  return onMateuTopbarNav;
});

/* "Reintentar" de la banda de error: vuelve a entrar en la CHAIN que falló, con sus mismos
 * parámetros — reenviar sólo la petición no valdría, porque una respuesta que nadie procesa
 * no cambia nada en pantalla. El cierre lo dejó registrado quien falló (bridge.setLastRetry). */

define('pages/shell-page-chains/retryMateuAction',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class retryMateuAction extends ActionChain {

    async run(context) {
      const { $application } = context;
      $application.variables.mateuLastError = '';
      const retry = bridge.takeLastRetry();
      if (!retry) return;
      if (retry.kind === 'navigate') {
        // Misma página que esta chain: se la llama directamente, con ESTE contexto (vivo).
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { route: retry.route }, force: true },
        });
        return;
      }
      // La acción vive en la página de CONTENIDO, que es otra: no se puede llamar su chain
      // desde aquí, así que viaja como evento de aplicación y allí se reencamina.
      await Actions.fireEvent(context, {
        name: 'application:mateuRetryAction',
        payload: { actionId: retry.actionId, parameters: retry.parameters },
      });
    }
  }

  return retryMateuAction;
});

/* Acción de cabecera (Fase 6): se despacha APP-LEVEL — route '' + serverSideType del App
 * (así lo exime Mateu de la resolución de menú) con el appState del contexto; los toasts
 * salen por el oj-sp-messages-toast de la propia shell. */

define('pages/shell-page-chains/runMateuHeaderAction',[
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class runMateuHeaderAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     */
    async run(context, { actionId }) {
      const { $application, $page } = context;

      if (!actionId) {
        return;
      }
      const base = $application.constants.mateuBaseUrl;
      const increment = await bridge.callMateu(base, {
        route: '',
        actionId,
        componentState: {},
        serverSideType: $application.variables.mateuShellSST || undefined,
        appState: $application.variables.mateuAppState || {},
      });
      const reg = bridge.reduceContexts($application.variables.mateuRegistry, increment);
      $application.variables.mateuRegistry = reg;

      for (const toast of reg.effects.toasts) {
        $page.variables.messageToast = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#messageToast',
          method: 'open',
        });
      }
      if (reg.effects.navigate && reg.effects.navigate.route) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: reg.effects.navigate.route } } },
        });
      }
    }
  }

  return runMateuHeaderAction;
});

/* Copyright (c) 2026, Oracle and/or its affiliates */

define('pages/shell-page-chains/showMessageToast',[
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class showMessageToast extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{message:string}} params.event
     */
    async run(context, { event }) {
      const { $page } = context;

      $page.variables.messageToast = event.message;

      await Actions.callComponentMethod(context, {
        selector: '#messageToast',
        method: 'open',
      });

    }
  }

  return showMessageToast;
});

/* Copyright (c) 2026, Oracle and/or its affiliates */

define('pages/shell-page-chains/showNotificationMessage',[
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class showNotificationMessage extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{summary:string,message:string,displayMode:string,type:string,key:string,target:string}} params.event
     */
    async run(context, { event }) {
      const { $page } = context;

      let msg = {
        messageType: event.type === "confirmation" ? "general-success" : "general-"+event.type,
        primaryText: event.summary,
        secondaryText: event.message,
        id: $page.variables.messageId
      };
      $page.variables.messageId++;

      await Actions.fireDataProviderEvent(context, {
        target: $page.variables.messagesBannerADP,
        add: {
          data: msg,
        },
      });

      if (event.displayMode === "transient") {
        setTimeout(() => {
          Actions.fireDataProviderEvent(context, {
            target: $page.variables.messagesBannerADP,
            remove: {
              keys: [msg.id],
            },
          });
        }, 5000);
      }


    }
  }

  return showNotificationMessage;
});

/* Abre/cierra el drawer lateral de CONTEXTO (@AppContext) desde el icono del header. */

define('pages/shell-page-chains/toggleMateuContextDrawer',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class toggleMateuContextDrawer extends ActionChain {

    async run(context) {
      const { $page } = context;
      $page.variables.mateuContextDrawerOpen = !$page.variables.mateuContextDrawerOpen;
    }
  }

  return toggleMateuContextDrawer;
});

/* Abre/cierra el navigator-drawer izquierdo (variante HAMBURGUER_MENU). */

define('pages/shell-page-chains/toggleMateuNavDrawer',[
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class toggleMateuNavDrawer extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.open  sin valor = alternar (la hamburguesa pliega/despliega)
     */
    async run(context, { open }) {
      const { $application } = context;
      const next = open == null ? !$application.variables.mateuNavDrawerOpen : !!open;
      $application.variables.mateuNavDrawerOpen = next;
      if (next) {
        // el navigation-list parsea su <ul> en el init; los li estampados por
        // oj-bind-for-each llegan después → refresh para que los decore
        try {
          await Actions.callComponentMethod(context, {
            selector: '#mateuNavList',
            method: 'refresh',
          });
        } catch (ignored) {
          // el primer open puede llegar antes de que el elemento exista — el
          // segundo refresh (tras el stamping) es el que decora
        }
      }
    }
  }

  return toggleMateuNavDrawer;
});


define('text!pages/shell-page.html',[],function () { return ' <oj-sp-simple-ui-shell id="shell" page-layout="[[ $application.variables.mateuShellPageLayout ]]" on-oj-sp-chat-action="[[ $listeners.askOracleOpen ]]"> <oj-sp-global-header slot="globalHeader" id="globalHeader" on-oj-sp-home-click="[[ $listeners.homeClicked ]]"> <div slot="start" class="oj-flex oj-sm-flex-wrap-nowrap oj-sm-align-items-center"> <oj-bind-if test="[[ !!$application.variables.mateuShellLogo ]]"> <img :src="[[ $application.variables.mateuShellLogo ]]" alt="logo" class="oj-sm-margin-3x-end" style="height: 22px; display: block;"> </oj-bind-if> <oj-bind-if test="[[ $application.variables.mateuMenuDrawerMode ]]"> <oj-button id="mateuHamburger" chroming="borderless" display="icons" on-oj-action="[[ $listeners.hamburgerClicked ]]"> <span slot="startIcon" class="oj-ux-ico-menu"></span> Menu </oj-button> </oj-bind-if> <oj-bind-if test="[[ $application.variables.mateuMenuTopbar ]]"> <oj-bind-for-each data="[[ $application.variables.mateuMenuTree ]]"> <template> <oj-bind-if test="[[ !$current.data.hasChildren ]]"> <oj-button chroming="borderless" :data-route="[[ $current.data.id ]]" on-oj-action="[[ $listeners.topbarNavClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.hasChildren ]]"> <oj-menu-button chroming="borderless"> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> <oj-menu slot="menu" on-oj-menu-action="[[ $listeners.menuNavAction ]]"> <oj-bind-for-each data="[[ $current.data.children ]]"> <template> <oj-option :value="[[ $current.data.id ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-option> </template> </oj-bind-for-each> </oj-menu> </oj-menu-button> </oj-bind-if> </template> </oj-bind-for-each> </oj-bind-if> </div> <div slot="end" class="oj-flex oj-sm-flex-wrap-nowrap oj-sm-align-items-center"> <oj-bind-if test="[[ $application.variables.mateuContextSelectors.length > 0 ]]"> <oj-button chroming="borderless" display="icons" class="oj-color-invert oj-sm-margin-3x-end" on-oj-action="[[ $listeners.contextDrawerToggle ]]"> <span slot="startIcon" class="oj-ux-ico-settings"></span> Contexto </oj-button> </oj-bind-if> <oj-bind-for-each data="[[ $application.variables.mateuHeaderActions ]]"> <template> <oj-bind-if test="[[ !$current.data.hasChildren ]]"> <oj-button class="oj-sm-margin-1x-start" chroming="borderless" :data-action-id="[[ $current.data.actionId ]]" on-oj-action="[[ $listeners.headerActionClicked ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-button> </oj-bind-if> <oj-bind-if test="[[ $current.data.hasChildren ]]"> <oj-menu-button class="oj-sm-margin-1x-start" chroming="borderless"> <oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text> <oj-menu slot="menu" on-oj-menu-action="[[ $listeners.headerMenuAction ]]"> <oj-bind-for-each data="[[ $current.data.children ]]"> <template> <oj-option :value="[[ $current.data.actionId ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-option> </template> </oj-bind-for-each> </oj-menu> </oj-menu-button> </oj-bind-if> </template> </oj-bind-for-each> </div> </oj-sp-global-header> <div slot="stretchingContents" id="pageContent" class="oj-web-applayout-page"> <oj-dialog id="mateuAskOracle" cancel-behavior="icon" drag-affordance="none" dialog-title="Ask Oracle"> <div slot="body" style="width: 560px; max-width: 90vw; min-height: 320px;"> <oj-input-search id="mateuAskInput" class="oj-form-control-full-width" placeholder="Buscar o ir a…" on-raw-value-changed="[[ $listeners.askOracleTyped ]]"></oj-input-search> <div class="oj-sm-margin-4x-top"> <oj-bind-for-each data="[[ $variables.mateuAskResults ]]"> <template> <oj-action-card class="oj-sm-margin-1x-bottom" style="width: 100%; display: block;" on-oj-action="[[ $listeners.askOracleGo ]]"> <div class="oj-flex oj-sm-align-items-center oj-sm-padding-3x"> <span class="oj-sm-margin-3x-end oj-ux-icon-size-5x" :class="[[ $current.data.icon ]]"></span> <span class="oj-typography-body-md oj-flex-item"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></span> <span class="oj-typography-body-xs oj-text-color-secondary"><oj-bind-text value="[[ $current.data.kind ]]"></oj-bind-text></span> </div> </oj-action-card> </template> </oj-bind-for-each> </div> </div> </oj-dialog> <oj-drawer-popup edge="end" opened="{{ $variables.mateuContextDrawerOpen }}"> <div class="oj-sm-padding-6x" style="width: 320px;"> <h2 class="oj-typography-heading-xs oj-sm-margin-4x-bottom">Contexto de trabajo</h2> <oj-bind-for-each data="[[ $application.variables.mateuContextSelectors ]]"> <template> <div class="oj-sm-margin-4x-bottom"> <oj-select-one class="oj-form-control-full-width" label-hint="[[ $current.data.label ]]" value="[[ $current.data.value ]]" on-value-changed="[[ $listeners.contextChanged ]]"> <oj-bind-for-each data="[[ $current.data.options ]]"> <template> <oj-option :value="[[ $current.data.value ]]"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></oj-option> </template> </oj-bind-for-each> </oj-select-one> </div> </template> </oj-bind-for-each> </div> </oj-drawer-popup> <oj-drawer-layout style="flex: 1 1 auto" id="mateuNavDrawer" start-opened="[[ $application.variables.mateuNavDrawerOpen ]]" on-oj-before-close="[[ $listeners.navDrawerClosed ]]"> <div slot="start" class="oj-sm-padding-4x-vertical" style="width:280px"> <oj-navigation-list id="mateuNavList" drill-mode="collapsible" selection="[[ $application.variables.mateuSelectedRoute ]]" on-selection-changed="[[ $listeners.navDrawerSelected ]]"> <ul> <oj-bind-for-each data="[[ $application.variables.mateuMenuTree ]]"> <template> <oj-bind-if test="[[ !$current.data.hasChildren ]]"> <li :id="[[ $current.data.id ]]"><a href="#"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></a></li> </oj-bind-if> <oj-bind-if test="[[ $current.data.hasChildren ]]"> <li :id="[[ $current.data.id ]]"><a href="#"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></a> <ul> <oj-bind-for-each data="[[ $current.data.children ]]"> <template> <li :id="[[ $current.data.id ]]"><a href="#"><oj-bind-text value="[[ $current.data.label ]]"></oj-bind-text></a></li> </template> </oj-bind-for-each> </ul> </li> </oj-bind-if> </template> </oj-bind-for-each> </ul> </oj-navigation-list> </div> <div class="oj-web-applayout-content-nopad"> <oj-bind-if test="[[ $application.variables.mateuOffline ]]"> <div class="mateu-offline-band" role="status"> Sin conexión — los cambios que hagas ahora no se guardarán. </div> </oj-bind-if> <oj-bind-if test="[[ $application.variables.mateuBusy ]]"> <div class="mateu-busy-bar" role="status" aria-label="Cargando"></div> </oj-bind-if> <oj-bind-if test="[[ !!$application.variables.mateuLastError ]]"> <div class="mateu-error-band" role="alert"> <span><oj-bind-text value="[[ $application.variables.mateuLastError ]]"></oj-bind-text></span> <oj-button chroming="callToAction" display="all" on-oj-action="[[ $listeners.retryMateuAction ]]">Reintentar</oj-button> <oj-button chroming="borderless" display="all" on-oj-action="[[ $listeners.dismissMateuError ]]">Cerrar</oj-button> </div> </oj-bind-if> <div class="oj-flex"> <oj-sp-messages-banner data="[[ $variables.messagesBannerADP ]]" class="oj-flex-item oj-sm-12 oj-md-12" on-sp-close="[[$listeners.messagesBannerSpClose]]"></oj-sp-messages-banner> </div> <oj-sp-messages-toast primary-text="[[ $variables.messageToast ]]" id="messageToast"></oj-sp-messages-toast> <oj-bind-if test="[[ $application.variables.mateuBusy && !$application.variables.mateuHostTitle ]]"> <div class="mateu-skeleton" aria-hidden="true"> <div class="mateu-skeleton-bone mateu-skeleton-title"></div> <div class="mateu-skeleton-pair"><div class="mateu-skeleton-bone mateu-skeleton-label"></div><div class="mateu-skeleton-bone mateu-skeleton-field"></div></div> <div class="mateu-skeleton-pair"><div class="mateu-skeleton-bone mateu-skeleton-label"></div><div class="mateu-skeleton-bone mateu-skeleton-field"></div></div> <div class="mateu-skeleton-pair"><div class="mateu-skeleton-bone mateu-skeleton-label"></div><div class="mateu-skeleton-bone mateu-skeleton-field"></div></div> <div class="mateu-skeleton-pair"><div class="mateu-skeleton-bone mateu-skeleton-label"></div><div class="mateu-skeleton-bone mateu-skeleton-field"></div></div> </div> </oj-bind-if> <div class="oj-flex"> <oj-vb-content id="vbRouterContent" role="main" class="oj-flex-item" style="min-width:0" config="[[vbRouterFlow]]"> </oj-vb-content> </div> </div> </oj-drawer-layout> <oj-bind-if test="[[ $application.variables.mateuMenuTabs && $application.variables.mateuSelectedRoute !== $application.variables.mateuHomeRoute ]]"> <oj-sp-in-app-navigation id="mateuNav" navigation-items="[[ $application.variables.mateuNavItems ]]" selection="[[ $application.variables.mateuSelectedRoute ]]" on-sp-selection-changed="[[ $listeners.navSelectionChanged ]]"></oj-sp-in-app-navigation> </oj-bind-if> </div> </oj-sp-simple-ui-shell> ';});

/* Copyright (c) 2026, Oracle and/or its affiliates */

define('pages/shell-page',[], () => {
  'use strict';
  
  class PageModule {
  }
    
  return PageModule;
});
  

define('text!pages/shell-page.json',[],function () { return '{"description":"","routerFlow":"main","variables":{"messageToast":{"type":"string"},"messagesBannerADP":{"type":"vb/ArrayDataProvider2","defaultValue":{"itemType":"MessagesBannerType","keyAttributes":"id"}},"messageId":{"type":"string"},"mateuContextDrawerOpen":{"type":"boolean","defaultValue":false,"description":"drawer lateral con los selectores @AppContext (se abre desde el icono del header)"},"mateuAskResults":{"type":"any","defaultValue":[],"description":"destinos de la paleta Ask Oracle (navegación + vistas rápidas), filtrados por el buscador"}},"metadata":{},"types":{"MessagesBannerType":{"id":"string","messageType":"string","primaryText":"string","primaryActionLabel":"string","secondaryText":"any","secondaryActionLabel":"string"}},"eventListeners":{"vbEnter":{"chains":[{"chain":"loadMateuShell"}]},"navSelectionChanged":{"chains":[{"parameters":{"event":"{{ $event }}"},"chain":"onMateuNavigate"}]},"application:mateuNavigate":{"chains":[{"parameters":{"event":"{{ $event }}"},"chain":"onMateuNavigate"}]},"menuNavAction":{"chains":[{"parameters":{"event":"{{ $event }}"},"chain":"onMateuNavigate"}]},"contextChanged":{"chains":[{"parameters":{"fieldName":"{{ $current.data.fieldName }}","event":"{{ $event }}"},"chain":"onMateuContextChanged"}]},"headerActionClicked":{"chains":[{"parameters":{"actionId":"{{ $current.data.actionId }}"},"chain":"runMateuHeaderAction"}]},"headerMenuAction":{"chains":[{"parameters":{"actionId":"{{ $event.detail.selectedValue }}"},"chain":"runMateuHeaderAction"}]},"application:spShowToast":{"chains":[{"parameters":{"event":"{{ $event }}"},"chain":"showMessageToast"}]},"messagesBannerSpClose":{"chains":[{"parameters":{"event":"{{ $event }}"},"chain":"closeMessageBanner"}]},"vbNotification":{"chains":[{"parameters":{"event":"{{ $event }}"},"chain":"showNotificationMessage"}]},"hamburgerClicked":{"chains":[{"chain":"toggleMateuNavDrawer"}]},"navDrawerClosed":{"chains":[{"chain":"toggleMateuNavDrawer","parameters":{"open":false}}]},"navDrawerSelected":{"chains":[{"chain":"onMateuNavDrawerSelect","parameters":{"event":"{{ $event }}"}}]},"topbarNavClicked":{"chains":[{"chain":"onMateuTopbarNav","parameters":{"event":"{{ $event }}"}}]},"contextDrawerToggle":{"chains":[{"chain":"toggleMateuContextDrawer"}]},"homeClicked":{"chains":[{"chain":"onMateuNavigate","parameters":{"event":{"detail":{"route":"{{ $application.variables.mateuHomeRoute }}"}}}}]},"askOracleOpen":{"chains":[{"chain":"askOracleOpen"}]},"askOracleTyped":{"chains":[{"chain":"askOracleTyped","parameters":{"event":"{{ $event }}"}}]},"askOracleGo":{"chains":[{"chain":"askOracleGo","parameters":{"item":"{{ $current.data }}"}}]},"dismissMateuError":{"chains":[{"chain":"dismissMateuError"}]},"retryMateuAction":{"chains":[{"chain":"retryMateuAction"}]}},"imports":{"components":{"oj-sp-messages-banner":{"path":"oj-sp/messages-banner/loader"},"oj-sp-messages-toast":{"path":"oj-sp/messages-toast/loader"},"oj-sp-simple-ui-shell":{"path":"oj-sp/simple-ui-shell/loader"},"oj-sp-global-header":{"path":"oj-sp/global-header/loader"},"oj-sp-in-app-navigation":{"path":"oj-sp/in-app-navigation/loader"},"oj-select-one":{"path":"ojs/ojselectcombobox"},"oj-button":{"path":"ojs/ojbutton"},"oj-menu-button":{"path":"ojs/ojbutton"},"oj-menu":{"path":"ojs/ojmenu"},"oj-option":{"path":"ojs/ojoption"},"oj-navigation-list":{"path":"ojs/ojnavigationlist"},"oj-drawer-layout":{"path":"ojs/ojdrawerlayout"},"oj-drawer-popup":{"path":"ojs/ojdrawerpopup"},"oj-dialog":{"path":"ojs/ojdialog"},"oj-input-search":{"path":"ojs/ojinputsearch"},"oj-action-card":{"path":"ojs/ojactioncard"}}},"translations":{}}';});


define('css!resources/css/app',[],function(){});
define('resources/strings/appBundle/nls/appBundle-strings',[],function() {
 'use strict';

 return {
    "root": true
};
});
define('resources/strings/appBundle/nls/root/appBundle-strings',[],function() {
 'use strict';

 return {
    "sample_page_title": "Welcome to your First Redwood App!!!",
    "sample_page_description": "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\""
};
});

define('text!services/catalog.json',[],function () { return '"#{env.catalogJson}#"';});


define('text!settings/dependencies.json',[],function () { return '{"component-dependencies":{}}';});


(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('body{background-color:var(--oj-core-neutral-30,#f1efed)}body::after{content:\'\';position:fixed;inset:270px 0 0 0;z-index:-1;pointer-events:none;background-image:url(\'https://static.oracle.com/cdn/fnd/gallery/2604.0.2/images/background-shell-generic-start.png\'),url(\'https://static.oracle.com/cdn/fnd/gallery/2604.0.2/images/background-shell-generic-end.png\');background-repeat:no-repeat,no-repeat;background-position:left bottom,right bottom}oj-sp-global-header a[id$=\'_HOa1\']{order:99}#mateuTable tbody tr{cursor:pointer}body:has(.oj-applayout-fixed-bottom) .oj-sp-guided-process-step-details-footer{bottom:64px}#mateuListHeader .oj-sp-public-primary-content-container,#mateuListHeaderInline .oj-sp-public-primary-content-container{display:none}.oj-sp-foldout-layout-last-panel:not(.mateu-fixed-panel){width:calc(100% - 394px)!important;flex:0 0 calc(100% - 394px)!important;min-width:0!important;overflow-x:hidden}.oj-sp-foldout-layout-last-panel:not(.mateu-fixed-panel) .oj-sp-foldout-panel-container,.oj-sp-foldout-layout-last-panel:not(.mateu-fixed-panel) .oj-sp-foldout-panel-container>div{width:100%!important;max-width:100%!important;column-count:unset!important;column-width:auto!important}.oj-sp-foldout-layout-last-panel:not(.mateu-fixed-panel) .oj-sp-foldout-panel-root{width:100%}oj-sp-foldout-panel.mateu-fixed-panel{overflow-x:hidden}oj-sp-foldout-panel.mateu-fixed-panel .oj-sp-foldout-panel-container,oj-sp-foldout-panel.mateu-fixed-panel .oj-sp-foldout-panel-container>div,oj-sp-foldout-panel.mateu-fixed-panel .oj-sp-foldout-panel-content,oj-sp-foldout-panel.mateu-fixed-panel .oj-sp-foldout-panel-slot-wrapper{width:100%!important;max-width:100%!important;column-count:unset!important;column-width:auto!important}oj-sp-foldout-panel.mateu-fixed-panel .oj-sp-foldout-panel-root{width:100%}.oj-sp-foldout-layout-children-container{justify-content:space-between}oj-sp-foldout-panel .oj-sp-foldout-panel-container,oj-sp-foldout-panel .oj-sp-foldout-panel-header{padding-left:24px!important;padding-right:24px!important}oj-sp-foldout-panel .oj-sp-foldout-panel-container>.oj-flex-item{padding-left:0!important;padding-right:0!important}oj-sp-foldout-panel div:has(> .oj-sp-foldout-panel-title-underline){padding-left:0!important;padding-right:0!important}.mateu-grid{column-gap:40px;row-gap:28px}.mateu-list-item{margin-bottom:40px!important}.mateu-grid-cell{flex:0 0 min(22rem,100%);max-width:22rem}.mateu-grid>.mateu-grid-cell{margin-bottom:0!important}.mateu-item-head{flex-wrap:nowrap;min-width:min(20rem,100%);width:100%}.mateu-item-head .oj-flex-item:not(.oj-sm-flex-initial){min-width:0}.mateu-item-head .oj-typography-body-md,.mateu-item-head h3{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}oj-sp-foldout-panel.mateu-fixed-panel .oj-panel.oj-sm-padding-4x{padding:.625rem .875rem!important}oj-sp-foldout-panel.mateu-fixed-panel .oj-panel.oj-sm-padding-3x{padding:.5rem .75rem!important}oj-sp-foldout-panel.mateu-fixed-panel .oj-flex-item.oj-sm-margin-4x-bottom{margin-bottom:.5rem!important}.mateu-drawer-scrim{position:fixed;inset:0;z-index:1050;background:rgba(22,21,19,.4)}.mateu-drawer-panel{position:fixed;top:0;right:0;bottom:0;z-index:1051;width:400px;background:var(--oj-core-bg-color-content,#fff);box-shadow:-8px 0 24px rgba(0,0,0,.18);padding:24px;overflow-y:auto;box-sizing:border-box}.mateu-atom-heading{margin:0}.mateu-atom-bullets{padding-inline-start:1.1rem;padding-inline-end:0;margin-top:0}.mateu-fold-title-underline{width:2.25rem;min-height:.25rem;max-height:.25rem;background-color:var(--oj-sp-theme-accent,#f0cc71)}.oj-sp-foldout-layout-header-horizontal{display:none}oj-action-card.mateu-row-card{display:block;width:100%}oj-action-card.mateu-row-card:first-of-type{margin-top:.75rem}.oj-sp-logo-global-header-logo-container{display:none!important}.mateu-busy-bar{position:fixed;inset-block-start:0;inset-inline:0;height:3px;z-index:1200;background:var(--oj-core-brand-color-1,#3b5bdb);transform-origin:0 50%;opacity:0;animation:mateu-busy-appear .2s linear .5s forwards,mateu-busy-slide 1.4s ease-in-out .5s infinite}@keyframes mateu-busy-appear{to{opacity:1}}@keyframes mateu-busy-slide{0%{transform:scaleX(0)}50%{transform:scaleX(.7)}100%{transform:scaleX(1);opacity:.2}}.mateu-error-band,.mateu-offline-band{display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.5rem 1rem;font-weight:500;color:#1a1a1a}.mateu-offline-band{background:#ffe0b2}.mateu-error-band{background:#ffcdd2}@media (prefers-reduced-motion:reduce){.mateu-busy-bar{animation:mateu-busy-appear .2s linear .5s forwards;transform:scaleX(1)}}oj-sp-global-header .oj-button-text,oj-sp-global-header oj-button .oj-button-text,oj-sp-global-header oj-menu-button .oj-button-text{color:var(--oj-core-text-color-inverse,#fff)}oj-sp-global-header oj-button .oj-button-icon,oj-sp-global-header oj-menu-button .oj-button-icon{color:var(--oj-core-text-color-inverse,#fff)}.mateu-skip-link{position:fixed;inset-block-start:0;inset-inline-start:0;z-index:4000;transform:translateY(-200%);margin:.5rem;padding:.5rem 1rem;font:inherit;font-weight:600;color:#fff;background:var(--oj-core-brand-color-1,#3b5bdb);border:2px solid var(--oj-core-brand-color-1,#3b5bdb);border-radius:6px;cursor:pointer;transition:transform .15s ease}.mateu-skip-link:focus,.mateu-skip-link:focus-visible{transform:none;outline:2px solid #161513;outline-offset:2px}[data-mateu-pending]{pointer-events:none;cursor:progress;animation:mateu-pending-pulse 1.1s ease-in-out infinite}@keyframes mateu-pending-pulse{0%,100%{opacity:.45}50%{opacity:.85}}.mateu-skeleton{padding:1.25rem;max-width:40rem}.mateu-skeleton-bone{background:linear-gradient(90deg,rgba(0,0,0,.08) 25%,rgba(0,0,0,.04) 37%,rgba(0,0,0,.08) 63%);background-size:400% 100%;animation:mateu-skeleton-shimmer 1.4s ease infinite;border-radius:6px}@keyframes mateu-skeleton-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}.mateu-skeleton-title{height:1.6rem;width:14rem;margin-block-end:1.5rem}.mateu-skeleton-pair{display:flex;flex-direction:column;gap:.4rem;margin-block:.9rem}.mateu-skeleton-label{height:.8rem;width:30%}.mateu-skeleton-field{height:2.25rem;width:100%}@media (prefers-reduced-motion:reduce){[data-mateu-pending]{animation:none;opacity:.55}.mateu-skeleton-bone{animation:none}}');

define("bundles/vb-app-bundle", function(){});

//# sourceMappingURL=vb-app-bundle.js.map