package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.time.Instant;
import lombok.Builder;

/**
 * One open copy of a record page: who has it open (in which tab), whether they are EDITING it (the
 * page holds unsaved changes) and since when — what a {@link
 * io.mateu.uidl.interfaces.PresenceStore} keeps.
 *
 * @param principal the name of the identity the host framework authenticated (never a value from
 *     the browser)
 * @param name the name shown to the others
 * @param tab an opaque id of the browser tab / app window, so one user's two tabs are two copies
 * @param editing the copy holds unsaved changes
 * @param since when this copy was opened
 * @param lastSeen the last heartbeat; a copy not seen for 30 seconds is gone
 */
@Experimental("record presence (3.0)")
@Builder(toBuilder = true)
public record PresenceMember(
    String principal, String name, String tab, boolean editing, Instant since, Instant lastSeen) {}
