package io.mateu.redwoodvb.ui;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;

/**
 * Welcome archetype rendered by the Mateu-on-Visual-Builder renderer: a centered hero with
 * call-to-action buttons plus highlight tiles on a grid below.
 */
@UI("/welcome-vb")
@Title("Bienvenida")
public class WelcomeVb extends Welcome {

  Button nueva =
      Button.builder()
          .label("Nueva reserva")
          .actionId("nuevaReserva")
          .buttonStyle(ButtonStyle.primary)
          .build();

  Button ver = Button.builder().label("Ver catálogo").actionId("verCatalogo").build();

  @Panel(title = "1 · Busca")
  Text step1 = Text.builder().text("Encuentra la reserva por localizador, huésped o habitación.").build();

  @Panel(title = "2 · Verifica")
  Text step2 = Text.builder().text("Escanea documentos y confirma el cardex de cada huésped.").build();

  @Panel(title = "3 · Asigna")
  Text step3 = Text.builder().text("Asigna la habitación, cobra la entrega y entrega las llaves.").build();

  @Override
  protected String heroTitle() {
    return "Recepción — check-in";
  }

  @Override
  protected String heroSubtitle() {
    return "Todo lo necesario para registrar a un huésped, en tres pasos";
  }

  @Action
  Object nuevaReserva() {
    return new Message("Iniciando el asistente de reserva…");
  }

  @Action
  Object verCatalogo() {
    return new Message("Abriendo el catálogo…");
  }
}
