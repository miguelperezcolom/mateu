"""Fluent components -> wire components (Java's componentmapper dispatchers: Layout/Display/Overlay ComponentDispatcher)."""

from __future__ import annotations

import dataclasses

from mateu_dtos import (
    ActionPanelCategoryRecord,
    ActionPanelItemRecord,
    ActionPanelMetadata,
    AddOnPickerMetadata,
    AddOnRecord,
    AnchorMetadata,
    BulletedListMetadata,
    ButtonMetadata,
    CalendarDayRecord,
    CalendarEventRecord,
    CalendarMetadata,
    CalloutCardMetadata,
    ChecklistItemRecord,
    ChecklistMetadata,
    ChipRecord,
    ClientSideComponent,
    CommentRecord,
    CommentThreadMetadata,
    ComparisonCardMetadata,
    ContentLayoutMetadata,
    CustomComponentMetadata,
    DashboardLayoutMetadata,
    DashboardPanelMetadata,
    DialogMetadata,
    DrawerMetadata,
    DropZoneMetadata,
    EmptyStateMetadata,
    EntityHeaderMetadata,
    FactRecord,
    FaqItemRecord,
    FaqMetadata,
    FeatureGridMetadata,
    FeatureRecord,
    FileItemRecord,
    FileListMetadata,
    FoldoutLayoutMetadata,
    FoldoutNavigation as FoldoutNavigationWire,
    FoldoutPanelInfo,
    FormFieldMetadata,
    FunnelMetadata,
    FunnelStageRecord,
    GanttMetadata,
    GanttTaskRecord,
    HeatCellRecord,
    HeatmapMetadata,
    HeroSectionMetadata,
    HorizontalLayoutMetadata,
    KanbanCardRecord,
    KanbanColumnRecord,
    KanbanMetadata,
    LedgerLineRecord,
    LedgerMetadata,
    MapMarkerRecord,
    MapMetadata,
    MatrixCellRecord,
    MatrixColumnRecord,
    MatrixGridMetadata,
    MatrixRowRecord,
    MatrixSectionRecord,
    MeterMetadata,
    MetricCardMetadata,
    MicroFrontendMetadata,
    NoticeMetadata,
    OfferCardMetadata,
    Option,
    OrgChartMetadata,
    OrgNodeRecord,
    PaymentMethodRecord,
    PaymentPickerMetadata,
    PeerNav,
    PlanningBlockRecord,
    PlanningBoardMetadata,
    PlanningResourceRecord,
    PopoverMetadata,
    PricingPlanRecord,
    PricingTableMetadata,
    ProcessItemRecord,
    ProcessMonitorMetadata,
    ProgressStepsMetadata,
    QueueGroupRecord,
    QueueItemRecord,
    ResourceGridMetadata,
    ResourceItemRecord,
    ResponsiveGridMetadata,
    ScoreboardMetadata,
    SeparatorMetadata,
    SkeletonMetadata,
    StatMetadata,
    StatusItemRecord,
    StatusListMetadata,
    StepRecord,
    TaskProgressMetadata,
    TaskQueueMetadata,
    TestimonialRecord,
    TestimonialsMetadata,
    TextMetadata,
    TimelineItemRecord,
    TimelineMetadata,
    TrendChartMetadata,
    VerticalLayoutMetadata,
)
from mateu_uidl import components as fluent

from ..registry import normalize
from ._base import MixinBase


class ComponentMapperMixin(MixinBase):
    def map_component(self, c) -> ClientSideComponent:
        """A fluent component (``mateu_uidl.components``) -> its wire ClientSide component.
        The Python port of the Java Metric/Scoreboard/Dashboard/Foldout/Hero/… mappers."""
        if isinstance(c, ClientSideComponent):  # pre-composed (archetype wrappers)
            return c
        if isinstance(c, fluent.ComponentRef):
            # A business component reference resolves HERE, so a backend-driven app never ships
            # it; an unknown name is a visible placeholder, never an error (Java's
            # ComponentToFragmentDtoMapper ComponentRef branch).
            entry = self.components.get(c.ref) if self.components is not None else None
            if entry is None or entry.component is None:
                return self.map_component(fluent.Text(text=f"Unknown business component: {c.ref}"))
            return self.map_component(entry.component)
        if isinstance(c, fluent.MetricCard):
            meta = MetricCardMetadata(
                title=c.title,
                value=c.value,
                unit=c.unit,
                trend=c.trend.value if c.trend is not None else None,
                trend_label=c.trend_label,
                icon=c.icon,
                description=c.description,
                action_id=c.action_id,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Scoreboard):
            return self._fluent_client(
                ScoreboardMetadata(), c, [self.map_component(m) for m in c.metrics]
            )
        if isinstance(c, fluent.DashboardPanel):
            meta = DashboardPanelMetadata(
                title=c.title, subtitle=c.subtitle, col_span=c.col_span, row_span=c.row_span
            )
            children = [self.map_component(c.content)] if c.content is not None else []
            return self._fluent_client(meta, c, children)
        if isinstance(c, fluent.DashboardLayout):
            return self._fluent_client(
                DashboardLayoutMetadata(columns=c.columns),
                c,
                [self.map_component(i) for i in c.items],
            )
        if isinstance(c, fluent.ResponsiveGrid):
            children = []
            for i in c.content:
                if isinstance(i, fluent.Slotted):
                    child = self.map_component(i.content)
                    child.slot = i.slot
                else:
                    child = self.map_component(i)
                children.append(child)
            return self._fluent_client(
                ResponsiveGridMetadata(
                    grid_template_columns=c.grid_template_columns(),
                    gap=c.gap,
                    col_spans=list(c.col_spans) or None,
                    stack_below=c.stack_below,
                    grid_template_areas=c.grid_template_areas,
                    sticky_areas=list(c.sticky_areas) or None,
                    reorderable=c.reorderable,
                ),
                c,
                children,
            )
        if isinstance(c, fluent.FoldoutLayout):
            children = []
            if c.overview is not None:
                overview = self.map_component(c.overview)
                overview.slot = "overview"
                children.append(overview)
            infos = []
            for i, panel in enumerate(c.panels):
                infos.append(
                    FoldoutPanelInfo(
                        title=panel.title,
                        subtitle=panel.subtitle,
                        icon=panel.icon,
                        open=panel.open,
                        width=panel.width,
                    )
                )
                if panel.content is not None:
                    child = self.map_component(panel.content)
                    child.slot = f"panel-{i}"
                    children.append(child)
            return self._fluent_client(
                FoldoutLayoutMetadata(
                    panels=infos,
                    headerTitle=c.header_title,
                    badges=list(c.badges),
                    orientation=c.orientation,
                    navigation=(
                        FoldoutNavigationWire(
                            title=c.navigation.title,
                            parentLabel=c.navigation.parent_label,
                            parentActionId=c.navigation.parent_action_id,
                            previousActionId=c.navigation.previous_action_id,
                            nextActionId=c.navigation.next_action_id,
                        )
                        if c.navigation is not None
                        else None
                    ),
                    overviewEditActionId=c.overview_edit_action_id,
                ),
                c,
                children,
            )
        if isinstance(c, fluent.ContentLayout):
            children = []
            for prefix, region in (("main", c.main), ("aside", c.aside), ("footer", c.footer)):
                for i, comp in enumerate(region):
                    if comp is None:
                        continue
                    child = self.map_component(comp)
                    child.slot = f"{prefix}-{i}"
                    children.append(child)
            return self._fluent_client(
                ContentLayoutMetadata(
                    asidePosition=c.aside_position or "end",
                    asideWidth=c.aside_width,
                    asideSticky=c.aside_sticky,
                ),
                c,
                children,
            )
        if isinstance(c, fluent.HeroSection):
            meta = HeroSectionMetadata(
                title=c.title, subtitle=c.subtitle, image=c.image, height=c.height, centered=c.centered
            )
            return self._fluent_client(meta, c, [self.map_component(i) for i in c.content])
        if isinstance(c, fluent.EmptyState):
            meta = EmptyStateMetadata(
                icon=c.icon,
                title=c.title,
                description=c.description,
                action_id=c.action_id,
                action_label=c.action_label,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Skeleton):
            variant = c.variant.value if c.variant is not None else "text"
            return self._fluent_client(SkeletonMetadata(variant=variant, count=c.count), c)
        if isinstance(c, fluent.Gantt):
            tasks = [
                GanttTaskRecord(
                    id=t.id,
                    title=t.title,
                    start=t.start.isoformat() if t.start is not None else None,
                    end=t.end.isoformat() if t.end is not None else None,
                    progress=t.progress,
                    color=t.color,
                )
                for t in c.tasks
            ]
            return self._fluent_client(
                GanttMetadata(tasks=tasks, on_task_selection_action_id=c.on_task_selection_action_id),
                c,
            )
        if isinstance(c, fluent.PlanningBoard):
            meta = PlanningBoardMetadata(
                resources=[
                    PlanningResourceRecord(
                        id=r.id,
                        label=r.label,
                        group=r.group,
                        attributes=list(r.attributes or ()),
                        icon=r.icon,
                    )
                    for r in c.resources
                ],
                blocks=[
                    PlanningBlockRecord(
                        id=b.id,
                        resource_id=b.resource_id,
                        start=b.start.isoformat() if b.start is not None else None,
                        end=b.end.isoformat() if b.end is not None else None,
                        label=b.label,
                        color=b.color,
                        status=b.status,
                        icon=b.icon,
                        summary=b.summary,
                    )
                    for b in c.blocks
                ],
                from_=c.from_.isoformat() if c.from_ is not None else None,
                to=c.to.isoformat() if c.to is not None else None,
                move_action_id=c.move_action_id,
                select_action_id=c.select_action_id,
                attribute_columns=list(c.attribute_columns or ()),
                resize_action_id=c.resize_action_id,
                open_action_id=c.open_action_id,
                range_select_action_id=c.range_select_action_id,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Kanban):
            columns = [
                KanbanColumnRecord(
                    id=col.id,
                    title=col.title,
                    color=col.color,
                    cards=[
                        KanbanCardRecord(
                            id=card.id,
                            title=card.title,
                            description=card.description,
                            badge=card.badge,
                            color=card.color,
                            action_id=card.action_id,
                        )
                        for card in col.cards
                    ],
                )
                for col in c.columns
            ]
            return self._fluent_client(KanbanMetadata(columns=columns), c)
        if isinstance(c, fluent.Timeline):
            items = [
                TimelineItemRecord(
                    id=it.id,
                    title=it.title,
                    description=it.description,
                    timestamp=it.timestamp,
                    icon=it.icon,
                    color=it.color,
                    action_id=it.action_id,
                )
                for it in c.items
            ]
            return self._fluent_client(TimelineMetadata(items=items), c)
        if isinstance(c, fluent.VerticalLayout):
            out = self._fluent_client(VerticalLayoutMetadata(spacing=c.spacing), c)
            out.children = [self.map_component(child) for child in c.content]
            return out
        if isinstance(c, fluent.HorizontalLayout):
            out = self._fluent_client(HorizontalLayoutMetadata(spacing=c.spacing), c)
            out.children = [self.map_component(child) for child in c.content]
            return out
        if isinstance(c, fluent.FormField):
            return self._fluent_client(
                FormFieldMetadata(
                    field_id=c.field_id,
                    data_type=c.data_type,
                    label=c.label or "",
                    stereotype=c.stereotype,
                    required=c.required,
                    read_only=c.read_only,
                    initial_value=c.initial_value,
                    options=[Option(value=str(v), label=l) for v, l in c.options],
                ),
                c,
            )
        if isinstance(c, fluent.ProgressSteps):
            steps = [
                StepRecord(id=s.id, title=s.title, description=s.description, status=s.status)
                for s in c.steps
            ]
            return self._fluent_client(ProgressStepsMetadata(steps=steps, vertical=c.vertical), c)
        if isinstance(c, fluent.Stat):
            return self._fluent_client(
                StatMetadata(
                    label=c.label,
                    value=c.value,
                    unit=c.unit,
                    delta=c.delta,
                    trend=c.trend,
                    spark=list(c.spark),
                    action_id=c.action_id,
                ),
                c,
            )
        if isinstance(c, fluent.Calendar):
            events = [
                CalendarEventRecord(
                    id=e.id,
                    title=e.title,
                    date=e.date.isoformat() if e.date is not None else None,
                    end_date=e.end_date.isoformat() if e.end_date is not None else None,
                    start_time=e.start_time,
                    end_time=e.end_time,
                    color=e.color,
                    action_id=e.action_id,
                )
                for e in c.events
            ]
            return self._fluent_client(
                CalendarMetadata(
                    month=c.month.isoformat() if c.month is not None else None,
                    events=events,
                    view=c.view.value if c.view is not None else "month",
                    views=[v.value for v in c.views],
                    days=[
                        CalendarDayRecord(
                            date=d.date.isoformat() if d.date is not None else None,
                            label=d.label,
                            tone=d.tone,
                        )
                        for d in c.days
                    ],
                    day_action_id=c.day_action_id,
                ),
                c,
            )
        if isinstance(c, fluent.PricingTable):
            plans = [
                PricingPlanRecord(
                    id=p.id,
                    name=p.name,
                    price=p.price,
                    period=p.period,
                    featured=p.featured,
                    features=list(p.features),
                    cta_label=p.cta_label,
                    action_id=p.action_id,
                )
                for p in c.plans
            ]
            return self._fluent_client(PricingTableMetadata(plans=plans), c)
        if isinstance(c, fluent.OrgChart):
            return self._fluent_client(
                OrgChartMetadata(root=self._org_node(c.root) if c.root is not None else None), c
            )
        if isinstance(c, fluent.Heatmap):
            cells = [
                HeatCellRecord(
                    date=cl.date.isoformat() if cl.date is not None else None,
                    value=cl.value,
                    label=cl.label,
                )
                for cl in c.cells
            ]
            return self._fluent_client(HeatmapMetadata(cells=cells), c)
        if isinstance(c, fluent.Funnel):
            stages = [
                FunnelStageRecord(label=s.label, value=s.value, color=s.color) for s in c.stages
            ]
            return self._fluent_client(FunnelMetadata(stages=stages), c)
        if isinstance(c, fluent.TrendChart):
            return self._fluent_client(
                TrendChartMetadata(
                    title=c.title,
                    values=list(c.values),
                    labels=list(c.labels),
                    color=c.color,
                    area=c.area,
                ),
                c,
            )
        if isinstance(c, fluent.FeatureGrid):
            features = [
                FeatureRecord(
                    icon=f.icon, title=f.title, description=f.description, action_id=f.action_id
                )
                for f in c.features
            ]
            return self._fluent_client(
                FeatureGridMetadata(features=features, columns=c.columns), c
            )
        if isinstance(c, fluent.Testimonials):
            items = [
                TestimonialRecord(
                    quote=t.quote, author=t.author, role=t.role, avatar=t.avatar, rating=t.rating
                )
                for t in c.items
            ]
            return self._fluent_client(TestimonialsMetadata(items=items), c)
        if isinstance(c, fluent.Faq):
            items = [
                FaqItemRecord(question=i.question, answer=i.answer, open=i.open) for i in c.items
            ]
            return self._fluent_client(FaqMetadata(items=items), c)
        if isinstance(c, fluent.CalloutCard):
            return self._fluent_client(
                CalloutCardMetadata(
                    title=c.title,
                    description=c.description,
                    icon=c.icon,
                    cta_label=c.cta_label,
                    action_id=c.action_id,
                    theme=c.theme,
                ),
                c,
            )
        if isinstance(c, fluent.CommentThread):
            comments = [self._comment(cm) for cm in c.comments]
            return self._fluent_client(CommentThreadMetadata(comments=comments), c)
        if isinstance(c, fluent.FileList):
            files = [
                FileItemRecord(
                    name=f.name, size=f.size, type=f.type, url=f.url, action_id=f.action_id
                )
                for f in c.files
            ]
            return self._fluent_client(FileListMetadata(files=files), c)
        if isinstance(c, fluent.Checklist):
            items = [
                ChecklistItemRecord(
                    id=i.id, label=i.label, done=i.done, action_id=i.action_id
                )
                for i in c.items
            ]
            return self._fluent_client(ChecklistMetadata(title=c.title, items=items), c)
        if isinstance(c, fluent.ComparisonCard):
            return self._fluent_client(
                ComparisonCardMetadata(
                    title=c.title,
                    left_label=c.left_label,
                    left_value=c.left_value,
                    right_label=c.right_label,
                    right_value=c.right_value,
                    delta=c.delta,
                    trend=c.trend,
                ),
                c,
            )
        if isinstance(c, fluent.EntityHeader):
            meta = EntityHeaderMetadata(
                title=c.title,
                badges=[ChipRecord(label=b.label, color=b.color) for b in c.badges],
                subtitle=c.subtitle,
                facts=[FactRecord(label=f.label, value=f.value) for f in c.facts],
                metric_label=c.metric_label,
                metric_value=c.metric_value,
                metric_caption=c.metric_caption,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Meter):
            meta = MeterMetadata(
                label=c.label,
                value=c.value,
                max=c.max,
                unit=c.unit,
                caption=c.caption,
                warn_at=c.warn_at,
                danger_at=c.danger_at,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.TaskProgress):
            meta = TaskProgressMetadata(
                label=c.label,
                total=c.total,
                done=c.done,
                action_label=c.action_label,
                action_id=c.action_id,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.StatusList):
            items = [
                StatusItemRecord(
                    id=it.id,
                    icon=it.icon,
                    avatar=it.avatar,
                    title=it.title,
                    description=it.description,
                    status=it.status,
                    status_color=it.status_color,
                    action_label=it.action_label,
                    action_id=it.action_id,
                )
                for it in c.items
            ]
            return self._fluent_client(
                StatusListMetadata(
                    items=items,
                    compact=c.compact,
                    frameless=c.frameless,
                    row_action_id=c.row_action_id,
                ),
                c,
            )
        if isinstance(c, fluent.BulletedList):
            return self._fluent_client(BulletedListMetadata(items=list(c.items)), c)
        if isinstance(c, fluent.ActionPanel):
            return self._fluent_client(
                ActionPanelMetadata(
                    label=c.label if c.label and c.label.strip() else "I want to…",
                    shortcut=c.shortcut,
                    categories=[
                        ActionPanelCategoryRecord(
                            title=cat.title,
                            actions=[
                                ActionPanelItemRecord(
                                    label=it.label,
                                    action_id=it.action_id,
                                    parameters=it.parameters,
                                    count=it.count,
                                    populated=it.populated or (it.count is not None and it.count > 0),
                                    disabled=it.disabled,
                                )
                                for it in cat.actions
                            ],
                        )
                        for cat in c.categories
                    ],
                    max_per_category=c.max_per_category if c.max_per_category > 0 else 10,
                    hide_unpopulated_toggle=c.hide_unpopulated_toggle,
                ),
                c,
            )
        if isinstance(c, fluent.Map):
            # the ClientSide id defaults to "map" (mirrors Java's MapComponentMapper)
            return ClientSideComponent(
                metadata=MapMetadata(
                    position=c.position,
                    zoom=c.zoom,
                    markers=[
                        MapMarkerRecord(
                            id=m.id,
                            latitude=m.latitude,
                            longitude=m.longitude,
                            label=m.label,
                            description=m.description,
                            color=m.color,
                        )
                        for m in c.markers
                    ],
                    marker_action_id=c.marker_action_id,
                ),
                id=c.id or "map",
                children=[],
                style=c.style,
                css_classes=c.css_classes,
            )
        if isinstance(c, fluent.MatrixGrid):
            n_cols = len(c.columns)

            def matrix_cell(row, i):
                # one cell per column, always: a short row is padded with blanks, a long one cut
                cell = row.cells[i] if i < len(row.cells) else None
                if cell is None:
                    return MatrixCellRecord(value="", tone=None, link=False)
                return MatrixCellRecord(
                    value="" if cell.value is None else cell.value, tone=cell.tone, link=cell.link
                )

            return self._fluent_client(
                MatrixGridMetadata(
                    row_header_label=c.row_header_label,
                    columns=[
                        MatrixColumnRecord(id=col.id, label=col.label, group=col.group, tone=col.tone)
                        for col in c.columns
                    ],
                    sections=[
                        MatrixSectionRecord(
                            id=sec.id if sec.id and sec.id.strip() else f"section{i}",
                            title=sec.title,
                            collapsed=sec.collapsed,
                            rows=[
                                MatrixRowRecord(
                                    id=r.id,
                                    label=r.label,
                                    cells=[matrix_cell(r, ci) for ci in range(n_cols)],
                                    editable=r.editable,
                                    emphasis=r.emphasis,
                                )
                                for r in sec.rows
                            ],
                        )
                        for i, sec in enumerate(c.sections)
                    ],
                    cell_action_id=c.cell_action_id,
                    edit_action_id=c.edit_action_id,
                ),
                c,
            )
        if isinstance(c, fluent.DropZone):
            return self._fluent_client(
                DropZoneMetadata(
                    accept=c.accept, action_id=c.action_id, parameters=dict(c.parameters or {}),
                    title=self.T(c.title) if c.title else c.title,
                    subtitle=self.T(c.subtitle) if c.subtitle else c.subtitle,
                ), c, [self.map_component(child) for child in c.content])
        if isinstance(c, fluent.Notice):
            return self._fluent_client(
                NoticeMetadata(
                    text=self.T(c.text), theme=c.theme, icon=c.icon, no_icon=c.no_icon,
                    action_label=c.action_label, action_id=c.action_id, status=c.status,
                    slim=c.slim, full_width=c.full_width, inline_content=c.inline_content,
                ), c, [self.map_component(child) for child in c.content])
        if isinstance(c, fluent.TaskQueue):
            groups = [
                QueueGroupRecord(
                    label=g.label,
                    items=[
                        QueueItemRecord(
                            id=it.id,
                            title=it.title,
                            caption=it.caption,
                            badges=[
                                ChipRecord(label=b.label, color=b.color) for b in it.badges
                            ],
                            selected=it.selected,
                        )
                        for it in g.items
                    ],
                )
                for g in c.groups
            ]
            return self._fluent_client(
                TaskQueueMetadata(action_id=c.action_id, groups=groups), c
            )
        if isinstance(c, fluent.ResourceGrid):
            items = [
                ResourceItemRecord(
                    id=it.id,
                    title=it.title,
                    subtitle=it.subtitle,
                    status_label=it.status_label,
                    status_color=it.status_color,
                    note=it.note,
                    note_color=it.note_color,
                    disabled=it.disabled,
                    recommended=it.recommended,
                    selected=it.selected,
                )
                for it in c.items
            ]
            meta = ResourceGridMetadata(
                action_id=c.action_id,
                columns=c.columns,
                recommended_label=c.recommended_label,
                items=items,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.OfferCard):
            meta = OfferCardMetadata(
                tag=c.tag,
                title=c.title,
                subtitle=c.subtitle,
                image=c.image,
                features=list(c.features),
                price_label=c.price_label,
                action_label=c.action_label,
                action_id=c.action_id,
                current=c.current,
                current_label=c.current_label,
                added=c.added,
                added_label=c.added_label,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.AddOnPicker):
            items = [
                AddOnRecord(
                    id=it.id,
                    icon=it.icon,
                    title=it.title,
                    description=it.description,
                    price=it.price,
                    unit=it.unit,
                    included_label=it.included_label,
                    added=it.added,
                )
                for it in c.items
            ]
            meta = AddOnPickerMetadata(
                total_label=c.total_label,
                currency=c.currency,
                action_id=c.action_id,
                items=items,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Ledger):
            lines = [
                LedgerLineRecord(
                    concept=ln.concept,
                    amount=ln.amount,
                    included=ln.included,
                    included_label=ln.included_label,
                )
                for ln in c.lines
            ]
            meta = LedgerMetadata(
                currency=c.currency, total_label=c.total_label, lines=lines, total=c.total
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.PaymentPicker):
            methods = [PaymentMethodRecord(id=m.id, label=m.label) for m in c.methods]
            meta = PaymentPickerMetadata(
                action_id=c.action_id,
                method_action_id=c.method_action_id,
                methods=methods,
                selected=c.selected,
                context_label=c.context_label,
                context_value=c.context_value,
                confirm_label=c.confirm_label,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.ProcessMonitor):
            items = [
                ProcessItemRecord(
                    id=it.id,
                    name=it.name,
                    systems=list(it.systems),
                    ok=it.ok,
                    warnings=it.warnings,
                    errors=it.errors,
                    status=it.status,
                    action_label=it.action_label,
                    action_id=it.action_id,
                )
                for it in c.items
            ]
            return self._fluent_client(ProcessMonitorMetadata(items=items), c)
        if isinstance(c, fluent.Button):
            meta = ButtonMetadata(
                label=self.T(c.label), action_id=c.action_id, disabled=c.disabled,
                button_style=c.button_style, parameters=c.parameters,
            )
            return self._fluent_client(meta, c)
        if isinstance(c, fluent.Text):
            # Java's Text.container() defaults to "div" when unset, so a fluent Text always carries
            # container:"div" on the wire (a non-empty default the conformance normaliser keeps).
            return self._fluent_client(
                TextMetadata(
                    text=self.T(c.text), container="div", size=c.size, no_margins=c.no_margins
                ),
                c,
            )
        if isinstance(c, fluent.Separator):
            return self._fluent_client(SeparatorMetadata(), c)
        if isinstance(c, fluent.CustomComponent):
            return self._fluent_client(
                CustomComponentMetadata(name=c.name, props=dict(c.props)),
                c,
                [self.map_component(child) for child in c.content],
            )
        if isinstance(c, fluent.Anchor):
            return self._fluent_client(AnchorMetadata(text=c.text, url=c.url, target=c.target), c)
        # Federation — a remote Mateu UI mounted as an island inside this page.
        if isinstance(c, fluent.MicroFrontend):
            meta = MicroFrontendMetadata(
                base_url=c.base_url, route=c.route, style=c.style,
                css_classes=c.css_classes, app_state=c.app_state,
            )
            return self._fluent_client(meta, c)
        # A routed model view (e.g. a Wizard) embedded as an INDEPENDENT server-side component:
        # it maps to a ServerSideComponent carrying the view's OWN serverSideType + actions, so its
        # actions (a wizard's step navigation) route back to itself instead of bubbling to the host
        # — what makes a wizard-in-a-drawer navigate (the Guided Process Drawer). Mirrors Java's
        # ComponentToFragmentDtoMapper EmbeddedView branch.
        if isinstance(c, fluent.EmbeddedView):
            return self.map_embedded_view(c.view)
        # Overlays — returned from actions; the sync handler emits them as Add fragments.
        if isinstance(c, fluent.Drawer):
            meta = DrawerMetadata(
                id=c.id,
                header_title=c.header_title,
                subtitle=c.subtitle,
                header=self.map_component(c.header) if c.header is not None else None,
                content=self.map_component(c.content) if c.content is not None else None,
                footer=self.map_component(c.footer) if c.footer is not None else None,
                position=c.position.value,
                width=c.width,
                size=c.size.value if c.size is not None else None,
                maximizable=c.maximizable,
                collapsible=c.collapsible,
                layout=c.layout,
                peer_nav=(
                    PeerNav(
                        prev_label=c.peer_nav.prev_label,
                        prev_route=c.peer_nav.prev_route,
                        next_label=c.peer_nav.next_label,
                        next_route=c.peer_nav.next_route,
                    )
                    if c.peer_nav is not None
                    else None
                ),
                no_padding=c.no_padding,
                modeless=c.modeless,
            )
            return self._fluent_client(meta, c)
        # Popover: both halves travel in the metadata; the id falls back to Java's "fieldId".
        if isinstance(c, fluent.Popover):
            meta = PopoverMetadata(
                content=self.map_component(c.content) if c.content is not None else None,
                wrapped=self.map_component(c.wrapped) if c.wrapped is not None else None,
                trigger=c.trigger.value,
            )
            return ClientSideComponent(
                metadata=meta,
                id=c.id if c.id and c.id.strip() else "fieldId",
                style=c.style,
                css_classes=c.css_classes,
            )
        if isinstance(c, fluent.Dialog):
            meta = DialogMetadata(
                id=c.id,
                header_title=c.header_title,
                header=self.map_component(c.header) if c.header is not None else None,
                content=self.map_component(c.content) if c.content is not None else None,
                footer=self.map_component(c.footer) if c.footer is not None else None,
                width=c.width,
                height=c.height,
                no_padding=c.no_padding,
                modeless=c.modeless,
                close_button_on_header=c.close_button_on_header,
            )
            return self._fluent_client(meta, c)
        raise TypeError(f"Unsupported fluent component: {type(c).__name__}")

    def map_embedded_view(self, view):
        """A routed model view embedded via :class:`fluent.EmbeddedView`. If the wrapped value is
        already a fluent component, it maps inline; otherwise it is a routed view (e.g. a Wizard)
        turned into an INDEPENDENT ServerSideComponent carrying its OWN serverSideType + actions,
        so its actions dispatch back to itself (Java parity: the EmbeddedView branch of
        ComponentToFragmentDtoMapper)."""
        from mateu_uidl import Wizard

        if isinstance(view, fluent.Component):
            return self.map_component(view)
        cls = type(view)
        route = "/" + normalize(getattr(cls, "__mateu_ui__", ""))
        if isinstance(view, Wizard):
            # The embedded wizard opens on its first step; its "next"/"back" buttons carry the
            # wizard's own serverSideType so navigation routes back to it.
            return self.map_wizard(cls, view, route, 1)
        return self.map_view(cls, view, route)

    def _comment(self, cm) -> CommentRecord:
        return CommentRecord(
            id=cm.id,
            author=cm.author,
            avatar=cm.avatar,
            text=cm.text,
            timestamp=cm.timestamp,
            replies=[self._comment(r) for r in cm.replies],
        )

    def _org_node(self, n) -> OrgNodeRecord:
        return OrgNodeRecord(
            id=n.id,
            title=n.title,
            subtitle=n.subtitle,
            avatar=n.avatar,
            color=n.color,
            action_id=n.action_id,
            children=[self._org_node(child) for child in n.children],
        )

    def _fluent_client(self, meta, c, children=None) -> ClientSideComponent:
        return ClientSideComponent(
            metadata=meta,
            id=c.id,
            children=children or [],
            style=c.style,
            css_classes=c.css_classes,
        )

    def collect_action_ids(self, c) -> list[str]:
        """Action ids referenced anywhere in a fluent tree (for the component's actions list):
        every ``action_id`` / ``*_action_id`` string, in tree order — generic, like Java's
        TreeActionHarvester, so a new component that names an action needs no case here. Nested
        server-side islands advertise their own actions and are not walked."""
        out: list[str] = []
        seen: set[int] = set()

        def names_of(node):
            if dataclasses.is_dataclass(node):
                return [f.name for f in dataclasses.fields(node)]
            model_fields = getattr(type(node), "model_fields", None)
            if isinstance(model_fields, dict):
                return list(model_fields)
            return []

        def walk(node, depth=0):
            if node is None or depth > 64 or isinstance(node, (str, bytes, int, float, bool)):
                return
            if id(node) in seen:
                return
            seen.add(id(node))
            if isinstance(node, (list, tuple)):
                for item in node:
                    walk(item, depth + 1)
                return
            if isinstance(node, dict):
                for v in node.values():
                    walk(v, depth + 1)
                return
            if type(node).__name__ == "ServerSideComponent":
                return
            module = (getattr(type(node), "__module__", "") or "").split(".")[0]
            if module not in {"mateu_uidl", "mateu_dtos", "mateu_core"}:
                return
            for name in names_of(node):
                v = getattr(node, name, None)
                if isinstance(v, str):
                    if v and (name == "action_id" or name.endswith("_action_id")):
                        out.append(v)
                else:
                    walk(v, depth + 1)

        walk(c)
        return list(dict.fromkeys(out))
