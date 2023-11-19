package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller;

import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos.ProductDto;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos.ProductsListDto;
import io.mateu.util.Helper;
import java.util.List;

import io.mateu.util.Serializer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
