package io.mateu.mdd.demoadminpanel.infra.in.ui.changes;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;

import static io.mateu.core.infra.JsonSerializer.fromJson;

@Title("Changes")
@Service
@Scope("prototype")
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Slf4j
@Style("max-width:900px;margin: auto;")
public class Changes extends Listing<NoFilters, ChangeRow>  {

    final io.mateu.mdd.demoadminpanel.infra.in.ui.changes.ChangeQueryService queryService;
    final CreateReleaseForm createReleaseForm;

    @Override
    public ListingData<ChangeRow> search(String searchText, NoFilters filters, Pageable pageable, HttpRequest httpRequest) {
        var found = queryService.findAll(searchText, filters, pageable);
        return ListingData.<ChangeRow>builder()
                .page(Page.<ChangeRow>builder()
                        .searchSignature(found.page().searchSignature())
                        .totalElements(found.page().totalElements())
                        .pageSize(found.page().pageSize())
                        .pageNumber(found.page().pageNumber())
                        .content(found.page().content().stream()
                                .map(dto -> new ChangeRow(
                                        dto.pageId(), dto.page(), dto.country(), dto.language(),
                                        new Status(mapStatus(dto.status()), dto.status().name()),
                                        new ColumnAction("compare", "Compare")))
                                .toList())
                        .build())
                .build();
    }

    public Object compare(ChangeRow row) {
        log.info("compare {}", row);
        var result = new ComparisonResult("x", "x", "x", "x", 1);
        return new ComparisonResultPage(result);
    }

    private StatusType mapStatus(ChangeStatus status) {
        if (status == ChangeStatus.Released) return StatusType.SUCCESS;
        return StatusType.DANGER;
    }

    @Toolbar
    public CreateReleaseForm createRelease(List<ChangeRow> selectedRows, HttpRequest httpRequest) {
        log.info("create release {}", selectedRows);

        var auth = httpRequest.getHeaderValue("Authorization");
        if (auth == null) throw new RuntimeException("no auth header");
        var jwt = auth.split(" ")[1];

        String[] chunks = jwt.split("\\.");

        // El índice 0 es el Header, el 1 es el Payload (el JSON con los datos)
        var payload = fromJson(new String(Base64.getUrlDecoder().decode(chunks[1])));

        var user = payload.get("preferred_username").toString();

        return createReleaseForm.withUser(user);
    }

    @Toolbar
    public CreateReleaseForm createReleaseNoAuth(List<ChangeRow> selectedRows, HttpRequest httpRequest) {
        log.info("create release {}", selectedRows);

        return createReleaseForm.withUser("no_user");
    }

}
