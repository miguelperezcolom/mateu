package io.mateu.dtos;

import java.util.List;

public record ServerSideComponentDto(String id, String serverSideType, List<ComponentDto> children)
    implements ComponentDto {}
