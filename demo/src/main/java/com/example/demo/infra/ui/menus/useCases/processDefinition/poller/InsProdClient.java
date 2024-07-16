package com.example.demo.infra.ui.menus.useCases.processDefinition.poller;

import com.example.demo.infra.ui.menus.useCases.processDefinition.poller.dtos.ProductDto;
import com.example.demo.infra.ui.menus.useCases.processDefinition.poller.dtos.ProductsListDto;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsProdClient {

  final Serializer serializer;

  public List<ProductDto> getProducts() throws Exception {
    return serializer.fromJson(
            Helper.leerFichero(
                getClass().getResourceAsStream("/mock/usecases/processdefinition/products.json")),
            ProductsListDto.class)
        .getContent();
  }

  public ProductDto getProduct(String key) throws Exception {
    return serializer.fromJson(
        Helper.leerFichero(
            getClass().getResourceAsStream("/mock/usecases/processdefinition/sample-product.json")),
        ProductDto.class);
  }
}
