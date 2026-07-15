package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.mappers.AddOnPickerMapper.mapAddOnPickerToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AnchorMapper.mapAnchorToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AvatarGroupMapper.mapAvatarGroupToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AvatarMapper.mapAvatarToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BadgeMapper.mapBadgeToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BreadcrumbsMapper.mapBreadcrumbsToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BulletedListMapper.mapBulletedListToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ButtonMapper.mapButtonToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CalendarMapper.mapCalendarToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CalloutCardMapper.mapCalloutCardToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CardMapper.mapCardToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ChatMapper.mapChatToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ChecklistMapper.mapChecklistToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CommentThreadMapper.mapCommentThreadToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ComparisonCardMapper.mapComparisonCardToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ElementMapper.mapElementToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.EmptyStateMapper.mapEmptyStateToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.EntityHeaderMapper.mapEntityHeaderToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FaqMapper.mapFaqToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FeatureGridMapper.mapFeatureGridToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FileListMapper.mapFileListToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FunnelMapper.mapFunnelToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.GanttMapper.mapGanttToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.HeatmapMapper.mapHeatmapToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.IconMapper.mapIconToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ImageMapper.mapImageToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.KPIMapper.mapKPIToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.KanbanMapper.mapKanbanToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.LedgerMapper.mapLedgerToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MarkdownMapper.mapMarkdownToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MeterMapper.mapMeterToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MetricCardMapper.mapMetricCardToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.NoticeMapper.mapNoticeToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.OfferCardMapper.mapOfferCardToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.OrgChartMapper.mapOrgChartToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.PaymentPickerMapper.mapPaymentPickerToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.PricingTableMapper.mapPricingTableToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ProcessMonitorMapper.mapProcessMonitorToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ProgressBarMapper.mapProgressBarToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ProgressStepsMapper.mapProgressStepsToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ResourceGridMapper.mapResourceGridToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ScoreboardMapper.mapScoreboardToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.SeparatorMapper.mapSeparatorToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.SkeletonMapper.mapSkeletonToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.StatMapper.mapStatToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.StatusListMapper.mapStatusListToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TaskProgressMapper.mapTaskProgressToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TaskQueueMapper.mapTaskQueueToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TestimonialsMapper.mapTestimonialsToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TextMapper.mapTextToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TimelineMapper.mapTimelineToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TrendChartMapper.mapTrendChartToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;

final class DisplayComponentDispatcher {

  static ComponentDto dispatch(
      io.mateu.uidl.fluent.Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof Element element) {
      return mapElementToDto(element);
    }
    if (component instanceof Text text) {
      return mapTextToDto(text);
    }
    if (component instanceof Chat chat) {
      return mapChatToDto(chat);
    }
    if (component instanceof Avatar avatar) {
      return mapAvatarToDto(avatar);
    }
    if (component instanceof AvatarGroup avatarGroup) {
      return mapAvatarGroupToDto(avatarGroup);
    }
    if (component instanceof Badge badge) {
      return mapBadgeToDto(badge);
    }
    if (component instanceof KPI kpi) {
      return mapKPIToDto(kpi);
    }
    if (component instanceof MetricCard metricCard) {
      return mapMetricCardToDto(metricCard);
    }
    if (component instanceof Scoreboard scoreboard) {
      return mapScoreboardToDto(scoreboard);
    }
    if (component instanceof EmptyState emptyState) {
      return mapEmptyStateToDto(emptyState);
    }
    if (component instanceof Gantt gantt) {
      return mapGanttToDto(gantt);
    }
    if (component instanceof Kanban kanban) {
      return mapKanbanToDto(kanban);
    }
    if (component instanceof Timeline timeline) {
      return mapTimelineToDto(timeline);
    }
    if (component instanceof ProgressSteps progressSteps) {
      return mapProgressStepsToDto(progressSteps);
    }
    if (component instanceof Stat stat) {
      return mapStatToDto(stat);
    }
    if (component instanceof Calendar calendar) {
      return mapCalendarToDto(calendar);
    }
    if (component instanceof PricingTable pricingTable) {
      return mapPricingTableToDto(pricingTable);
    }
    if (component instanceof OrgChart orgChart) {
      return mapOrgChartToDto(orgChart);
    }
    if (component instanceof Heatmap heatmap) {
      return mapHeatmapToDto(heatmap);
    }
    if (component instanceof Funnel funnel) {
      return mapFunnelToDto(funnel);
    }
    if (component instanceof TrendChart trendChart) {
      return mapTrendChartToDto(trendChart);
    }
    if (component instanceof FeatureGrid featureGrid) {
      return mapFeatureGridToDto(featureGrid);
    }
    if (component instanceof Testimonials testimonials) {
      return mapTestimonialsToDto(testimonials);
    }
    if (component instanceof Faq faq) {
      return mapFaqToDto(faq);
    }
    if (component instanceof CalloutCard calloutCard) {
      return mapCalloutCardToDto(calloutCard);
    }
    if (component instanceof CommentThread commentThread) {
      return mapCommentThreadToDto(commentThread);
    }
    if (component instanceof FileList fileList) {
      return mapFileListToDto(fileList);
    }
    if (component instanceof Checklist checklist) {
      return mapChecklistToDto(checklist);
    }
    if (component instanceof ComparisonCard comparisonCard) {
      return mapComparisonCardToDto(comparisonCard);
    }
    if (component instanceof EntityHeader entityHeader) {
      return mapEntityHeaderToDto(entityHeader);
    }
    if (component instanceof Meter meter) {
      return mapMeterToDto(meter);
    }
    if (component instanceof TaskProgress taskProgress) {
      return mapTaskProgressToDto(taskProgress);
    }
    if (component instanceof StatusList statusList) {
      return mapStatusListToDto(statusList);
    }
    if (component instanceof BulletedList bulletedList) {
      return mapBulletedListToDto(bulletedList);
    }
    if (component instanceof Separator separator) {
      return mapSeparatorToDto(separator);
    }
    if (component instanceof Notice notice) {
      return mapNoticeToDto(
          notice, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof TaskQueue taskQueue) {
      return mapTaskQueueToDto(taskQueue);
    }
    if (component instanceof ResourceGrid resourceGrid) {
      return mapResourceGridToDto(resourceGrid);
    }
    if (component instanceof OfferCard offerCard) {
      return mapOfferCardToDto(offerCard);
    }
    if (component instanceof AddOnPicker addOnPicker) {
      return mapAddOnPickerToDto(addOnPicker);
    }
    if (component instanceof Ledger ledger) {
      return mapLedgerToDto(ledger);
    }
    if (component instanceof PaymentPicker paymentPicker) {
      return mapPaymentPickerToDto(paymentPicker);
    }
    if (component instanceof ProcessMonitor processMonitor) {
      return mapProcessMonitorToDto(processMonitor);
    }
    if (component instanceof Skeleton skeleton) {
      return mapSkeletonToDto(skeleton);
    }
    if (component instanceof Anchor anchor) {
      return mapAnchorToDto(anchor);
    }
    if (component instanceof Button button) {
      return mapButtonToDto(button);
    }
    if (component instanceof Card card) {
      return mapCardToDto(card, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Icon icon) {
      return mapIconToDto(icon);
    }
    if (component instanceof Image image) {
      return mapImageToDto(image);
    }
    if (component instanceof Markdown markdown) {
      return mapMarkdownToDto(markdown);
    }
    if (component instanceof ProgressBar progressBar) {
      return mapProgressBarToDto(progressBar);
    }
    if (component instanceof Breadcrumbs breadcrumbs) {
      return mapBreadcrumbsToDto(breadcrumbs);
    }
    return null;
  }
}
