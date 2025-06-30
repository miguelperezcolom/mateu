package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/markdown")
public class MarkdownComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Markdown")
                .content(List.of(
                        Markdown.builder()
                                .markdown("""
                                        ## Rich Text Formatting
                                                                                
                                        You can create **bold text**, *italicized text*, and \\`inline code\\` with simple Markdown syntax.
                                        You can also ~~strike through~~ text when needed.
                                                                                
                                        ## Lists
                                                                                
                                        ### Ordered List:
                                        1. First item
                                        2. Second item
                                        3. Third item with **bold text**
                                                                                
                                        ### Unordered List:
                                        - Fruits
                                          - Apples 🍎
                                          - Bananas 🍌
                                          - Oranges 🍊
                                        - Vegetables
                                          - Carrots
                                          - Broccoli
                                                                                
                                        ## Links & Quotes
                                                                                
                                        > Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.
                                                                                
                                        [Visit Mateu website](https://mateu.io) | [Learn more about Markdown](https://www.markdownguide.org/)
                                           
                                        """)
                                .build()
                ))
                .build();
    }
}
