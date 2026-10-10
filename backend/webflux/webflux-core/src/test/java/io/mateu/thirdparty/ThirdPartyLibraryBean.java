package io.mateu.thirdparty;

import org.springframework.stereotype.Component;

/**
 * Stands for a bean of a third-party library that happens to live under {@code io.mateu.*} (a
 * workflow engine's own management UI, say). Mateu's auto-configuration must NOT register it.
 */
@Component
public class ThirdPartyLibraryBean {}
