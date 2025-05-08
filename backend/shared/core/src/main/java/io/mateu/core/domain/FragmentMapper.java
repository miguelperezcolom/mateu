package io.mateu.core.domain;

import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public interface FragmentMapper {

  List<UIFragmentDto> mapToFragments(Object instance, String baseUrl, HttpRequest httpRequest);
}
