package com.example.demo.infra.ui.menus.useCases.processDefinition.poller;

import com.example.demo.infra.ui.menus.useCases.processDefinition.poller.dtos.ProductDto;
import com.example.demo.infra.ui.menus.useCases.processDefinition.poller.dtos.ProductsListDto;
import io.mateu.core.domain.model.util.InputStreamReader;
import io.mateu.core.domain.model.util.Serializer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsProdClient {

  final Serializer serializer;

  public List<ProductDto> getProducts() throws Exception {
    return serializer.fromJson(
            InputStreamReader.readInputStream(
                getClass().getResourceAsStream("/mock/usecases/processdefinition/products.json")),
            ProductsListDto.class)
        .getContent();
  }
}
