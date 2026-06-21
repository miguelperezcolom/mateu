package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Badge;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.*;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Hotel reception check-in screen.
 *
 * <p>Phase 1: all the information of the reservation is shown declaratively using existing
 * Mateu annotations (sections, grids, tabs, textareas). Sections are stacked vertically for now;
 * the dense two-column layout (named zones), per-section actions and value-coloured grid pills
 * are added in phase 2 as framework extensions.
 */
@Service
@Scope("prototype")
@Route(value = "/:id/checkin", uis = {"/checkin"})
@Trigger(type = TriggerType.OnLoad, actionId = "load")
@ConfirmOnNavigationIfDirty
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@Title("Check-in")
@Zones({
    @Zone(name = "left", width = "64%"),
    @Zone(name = "right", width = "36%")
})
public class CheckInForm implements HeaderSupplier {

    final ReservationLineRepository repository;

    public CheckInForm(ReservationLineRepository repository) {
        this.repository = repository;
    }

    @Hidden String id;
    @Hidden String currency;

    // ===================== Información general de la reserva =====================
    // These are already shown in the page context header, so they are hidden from the form body.
    @Hidden String localizador;
    @Hidden String agencia;
    @Hidden String hotel;
    @Hidden MealPlan mealPlan;
    @Hidden String chargeType;
    @Hidden LocalDate arrivalDate;
    @Hidden int nights;
    @Hidden LocalDate departureDate;
    @Hidden int adults;
    @Hidden int children;
    @Hidden int babies;
    @Hidden String reservationStatus;

    @Section(value = "Información general de la reserva", columns = 8, zone = "left")
    @ReadOnly @PlainText @Label("Tiempo esperando") String waitingTime;
    @ReadOnly @PlainText @Label("Ref. tarifa") String tarifaRef;
    @ReadOnly @PlainText @Label("Tipo tarifa") String tarifaType;
    @ReadOnly @PlainText @Label("Grupo res.") String grupoRes;
    @ReadOnly @PlainText @Label("Grupo op.") String grupoOp;
    @Hidden @Badge(label = "Garantizada", color = "success") boolean garantizada;
    @Hidden @Badge(label = "Terceros") boolean terceros;
    @Hidden @Badge(label = "Pdte. Int.") boolean pdteInt;
    @Hidden @Badge(label = "Exp.") boolean exp;
    @Hidden @Badge(label = "Múltiple") boolean multiple;
    @Hidden @Badge(label = "VIP", color = "contrast") boolean vip;
    @ReadOnly @PlainText @Label("Riu Class") String riuClass;
    @ReadOnly @PlainText @Label("Requiere") String requiere;

    // ===================== Check-in =====================
    @Section(value = "Check-in", columns = 4, zone = "left")
    @Label("Nº habitación") String assignedRoom;
    @ReadOnly @PlainText @Label("Tipo hab. física") String roomTypePhysical;
    @ReadOnly @PlainText @Label("Tipo hab. contratada") String roomType;
    @Label("Upgrade") boolean upgrade;
    @Label("Espera") boolean espera;
    @Stereotype(FieldStereotype.textarea) @Label("Deseos") String deseos;
    @Stereotype(FieldStereotype.textarea) @Label("Observaciones internas") String observacionesInternas;
    @Stereotype(FieldStereotype.textarea) @Label("Avisos") String avisos;

    // ===================== Detalle de estancia (PAX) =====================
    @Section(value = "Detalle de estancia (huéspedes)", columns = 1, zone = "left")
    @ReadOnly
    @Label("")
    @Stereotype(FieldStereotype.grid)
    List<GuestData> guests = new ArrayList<>();

    // ===================== Información cliente (tabs) =====================
    @Section(value = "Información cliente", columns = 8, zone = "left")
    @Tab("Info Cardex")
    @ReadOnly @PlainText @Label("Titular") String leadFullName;         // Apellidos, Nombre
    @ReadOnly @PlainText @Label("Email") String leadEmail;
    @ReadOnly @PlainText @Label("Teléfono / Fax") String leadPhoneFax; // Teléfono · Fax
    @ReadOnly @PlainText @Label("Dirección") String leadFullAddress;    // Dir, CP Ciudad (Prov) País
    @ReadOnly @PlainText @Label("Nac. / Idioma") String leadNatLang;    // Nacionalidad / Idioma
    @ReadOnly @PlainText @Label("F. nacimiento") String leadDobSex;     // Fecha · Sexo · Ciudad nac.
    @ReadOnly @PlainText @Label("Documento") String leadDocInfo;        // Tipo Nº · exp.
    @ReadOnly @PlainText @Label("Nº Riu Class") String leadRiuClassNo;
    @ReadOnly @PlainText @Label("Acepta publicidad") String leadAcceptsAds;
    @ReadOnly @Stereotype(FieldStereotype.badge) @Label("Acompañante") boolean leadCompanion;
    @ReadOnly @Stereotype(FieldStereotype.badge) @Label("Cardex provisional") boolean leadProvisionalCardex;

    @Tab("Datos Empresa")
    @ReadOnly @PlainText @Label("Razón social") String companyName;
    @ReadOnly @PlainText @Label("CIF") String cif;
    @ReadOnly @PlainText @Label("Email facturación") String billingEmail;
    @ReadOnly @PlainText @Label("Dirección fiscal") String fiscalAddress;
    @ReadOnly @PlainText @Label("Forma de pago") String paymentTerms;

    @Tab("Datos Tarjeta")
    @ReadOnly @PlainText @Label("Tipo tarjeta") String cardTypeName;
    @ReadOnly @PlainText @Label("4 últimos dígitos") String cardLast4Tab;
    @ReadOnly @PlainText @Label("Caducidad") String cardExpiry;
    @ReadOnly @PlainText @Label("Titular") String cardHolder;
    @ReadOnly @PlainText @Label("Garantía validada") boolean cardValidated;

    @Tab("Histórico cliente")
    @ReadOnly
    @Stereotype(FieldStereotype.grid)
    List<HistoryStay> historyStays = new ArrayList<>();

    @Tab("Preferencias")
    @Stereotype(FieldStereotype.textarea) @Label("Preferencias del cliente") String preferenceNotes;

    // ===================== Importes =====================
    @Section(value = "Importes", columns = 1, zone = "right")
    @ReadOnly
    @Label("")
    @Stereotype(FieldStereotype.grid)
    List<ImporteLine> importes = new ArrayList<>();

    // ===================== Información habitación =====================
    @Section(value = "Información habitación", columns = 3, zone = "right")
    @ReadOnly @PlainText @Label("Nº habitación") String roomInfoNumber;
    @ReadOnly @PlainText @Label("Dobles / Individuales") String beds;
    @ReadOnly @PlainText @Label("Estado") RoomState roomState;
    @Label("Checkout") boolean checkout;
    @ReadOnly @PlainText @Label("Observaciones") String roomObservations;
    @Stereotype(FieldStereotype.textarea) @Label("Averías") String averias;

    // ===================== Historial cliente =====================
    @Section(value = "Historial cliente", columns = 3, zone = "right")
    @ReadOnly @PlainText @Label("Tipo Riu Class") String riuClassType;
    @ReadOnly @PlainText @Label("Último hotel") String lastHotel;
    @ReadOnly @PlainText @Label("RPC") boolean rpc;
    @ReadOnly @PlainText @Label("Repetido") int repeated;
    @ReadOnly @PlainText @Label("Tipo cliente") String clientType;
    @ReadOnly @PlainText @Label("Nº Attn H") int attnH;
    @ReadOnly @PlainText @Label("Última habitación") String lastRoom;
    @Stereotype(FieldStereotype.textarea) @Label("Preferencias") String historialPreferences;

    // ===================== Folios / Anticipos =====================
    @Section(value = "Folios / Anticipos", columns = 3, zone = "right")
    @Label("Crédito cancelado") boolean creditCancelled;
    @Label("Imprimir recibo") boolean printReceipt;
    @Label("Límite crédito") BigDecimal creditLimit;
    @ReadOnly @PlainText @Label("Tipo tarjeta") String cardType;
    @ReadOnly @PlainText @Label("4 últimos dígitos") String cardLast4;
    @Label("Entrega a cuenta") BigDecimal deposit;
    @ReadOnly @PlainText @Label("Saldo pendiente") BigDecimal saldoPendiente;

    Object load(HttpRequest httpRequest) {
        return populate() ? (Object) new State(this) : Message.success("Reservation not found");
    }

    /** Loads the reservation into the form fields. Reusable so the listing can pre-fill the form. */
    boolean populate() {
        var found = repository.findById(id);
        if (found.isEmpty()) {
            return false;
        }
        var line = found.get();
        {
            // Reservation
            localizador = line.getLocalizador();
            currency = line.getCurrency();
            agencia = line.getAgencia();
            hotel = line.getHotel();
            mealPlan = line.getMealPlan();
            chargeType = line.getChargeType();
            arrivalDate = line.getArrivalDate();
            departureDate = line.getDepartureDate();
            nights = (int) ChronoUnit.DAYS.between(line.getArrivalDate(), line.getDepartureDate());
            waitingTime = line.getWaitingTime();
            adults = line.getAdults();
            children = line.getChildren();
            babies = line.getBabies();
            reservationStatus = line.getStatus() != null ? line.getStatus().name() : "";
            tarifaRef = line.getTarifaRef();
            tarifaType = line.getTarifaType();
            grupoRes = line.getGrupoRes();
            grupoOp = line.getGrupoOp();
            garantizada = line.isGarantizada();
            terceros = line.isTerceros();
            pdteInt = line.isPdteInt();
            exp = line.isExp();
            multiple = line.isMultiple();
            vip = line.isVip();
            riuClass = line.getRiuClass();
            requiere = line.getRequiere();

            // Check-in
            assignedRoom = line.getAssignedRoom();
            roomTypePhysical = line.getRoomTypePhysical();
            roomType = line.getRoomType();
            upgrade = line.isUpgrade();
            espera = line.isEspera();
            deseos = line.getDeseos();
            observacionesInternas = line.getObservacionesInternas();
            avisos = line.getAvisos();

            // Pax
            guests = new ArrayList<>(line.getGuests());

            // Lead guest cardex (merged display fields)
            var lead = line.getGuests().isEmpty() ? null : line.getGuests().get(0);
            leadFullName = join(", ",
                    lead != null ? lead.getLastName() : null,
                    lead != null ? lead.getFirstName() : null);
            leadEmail = line.getLeadEmail();
            leadPhoneFax = join(" · ", line.getLeadPhone(), line.getLeadFax());
            leadFullAddress = join(", ",
                    line.getLeadAddress(),
                    join(" ", line.getLeadCp(), line.getLeadCity()),
                    line.getLeadProvince(),
                    line.getLeadCountryResidence());
            leadNatLang = join(" / ", line.getLeadNationality(), line.getLeadLanguage());
            leadDobSex = join(" · ",
                    line.getLeadDob() != null ? line.getLeadDob().toString() : null,
                    line.getLeadSex() != null ? line.getLeadSex().name() : null,
                    line.getLeadBirthCity());
            leadDocInfo = join(" · ",
                    line.getLeadDocType() != null ? line.getLeadDocType().name() : null,
                    line.getLeadDocNumber(),
                    line.getLeadIssued() != null ? "exp. " + line.getLeadIssued() : null,
                    line.getLeadExpiry() != null ? "cad. " + line.getLeadExpiry() : null);
            leadRiuClassNo = line.getLeadRiuClassNo();
            leadAcceptsAds = line.getLeadAcceptsAds();
            leadCompanion = line.isLeadCompanion();
            leadProvisionalCardex = line.isLeadProvisionalCardex();

            // Company / card / history tabs
            companyName = line.getCompanyName();
            cif = line.getCif();
            billingEmail = line.getBillingEmail();
            fiscalAddress = line.getFiscalAddress();
            paymentTerms = line.getPaymentTerms();
            cardTypeName = line.getCardTypeName();
            cardLast4Tab = line.getCardLast4();
            cardExpiry = line.getCardExpiry();
            cardHolder = line.getCardHolder();
            cardValidated = line.isCardValidated();
            historyStays = new ArrayList<>(line.getHistoryStays());
            preferenceNotes = line.getPreferences();

            // Importes
            importes = new ArrayList<>(line.getImportes());

            // Room info
            roomInfoNumber = line.getAssignedRoom() == null || line.getAssignedRoom().isBlank()
                    ? "—" : line.getAssignedRoom();
            beds = line.getBeds();
            roomState = line.getRoomState();
            checkout = line.isCheckout();
            roomObservations = line.getRoomObservations();
            averias = line.getAverias();

            // Client history
            riuClassType = line.getRiuClassType();
            lastHotel = line.getLastHotel();
            rpc = line.isRpc();
            repeated = line.getRepeated();
            clientType = line.getClientType();
            attnH = line.getAttnH();
            lastRoom = line.getLastRoom();
            historialPreferences = line.getPreferences();

            // Folio
            creditCancelled = line.isCreditCancelled();
            printReceipt = line.isPrintReceipt();
            creditLimit = line.getCreditLimit();
            cardType = line.getCardType();
            cardLast4 = line.getCardLast4();
            deposit = line.getDeposit();
            saldoPendiente = line.getSaldoPendiente();
        }
        return true;
    }

    /** Context strip shown above the two columns: reservation identity. */
    @Override
    public Collection<Component> header() {
        var info = HorizontalLayout.builder()
                .spacing(true)
                .style("flex-wrap: wrap; align-items: baseline; gap: 2px 1.75rem; width: 100%;")
                .content(List.of(
                        item("Localizador", localizador),
                        item("Hotel", hotel),
                        item("Agencia", agencia),
                        item("Estado", reservationStatus),
                        item("Estancia", arrivalDate + " → " + departureDate + " · " + nights + "N"),
                        item("Ocupación", adults + " AD · " + children + " CH · " + babies + " BB"),
                        item("Régimen", mealPlan != null ? mealPlan.name() : "—"),
                        item("Tipo cobro", chargeType),
                        item("Saldo", (saldoPendiente != null ? saldoPendiente.toPlainString() : "0")
                                + " " + nz(currency))))
                .build();

        return List.of(
                VerticalLayout.builder()
                        .spacing(true)
                        .style("width: 100%;")
                        .content(List.of(info))
                        .build());
    }

    private static Component item(String label, String value) {
        return VerticalLayout.builder()
                .spacing(false)
                .padding(false)
                .style("min-width: 0; line-height: 1.15;")
                .content(List.of(
                        Text.builder().text(label).container(TextContainer.div)
                                .style("font-size: 10px; text-transform: uppercase; letter-spacing: .3px;"
                                        + " color: var(--lumo-secondary-text-color);")
                                .build(),
                        Text.builder().text(nz(value)).container(TextContainer.div)
                                .style("font-size: 13px; font-weight: 600;")
                                .build()))
                .build();
    }


    private static String nz(String s) {
        return s == null || s.isBlank() ? "—" : s;
    }

    private static String join(String sep, String... parts) {
        return Stream.of(parts)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(sep));
    }

    private ReservationLine apply(ReservationLine line) {
        line.setAssignedRoom(assignedRoom);
        line.setUpgrade(upgrade);
        line.setEspera(espera);
        line.setDeseos(deseos);
        line.setObservacionesInternas(observacionesInternas);
        line.setAvisos(avisos);
        line.setCheckout(checkout);
        line.setAverias(averias);
        line.setCreditCancelled(creditCancelled);
        line.setPrintReceipt(printReceipt);
        line.setCreditLimit(creditLimit);
        line.setDeposit(deposit);
        line.setGuests(guests);
        return line;
    }

    @Button
    @Label("Guardar")
    Object save(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            repository.save(apply(line));
            return (Object) List.of(Message.success("Guardado"), UICommand.markAsClean());
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    @Label("Confirmar check-in")
    Object confirmCheckin(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            apply(line).setStatus(CheckInStatus.CHECKED_IN);
            repository.save(line);
            return (Object) List.of(
                    Message.success("Check-in confirmado para " + line.getTitular()),
                    MateuBeanProvider.getBean(CheckInListing.class)
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    @Label("Pre asignar")
    Object preAsignar(HttpRequest httpRequest) {
        return Message.success("Habitación pre-asignada");
    }

    @Button
    @Label("Lector documento")
    Object lectorDocumento(HttpRequest httpRequest) {
        return Message.success("Lector de documento iniciado");
    }

    @Button
    @Label("Tarjeta welcome")
    Object tarjetaWelcome(HttpRequest httpRequest) {
        return Message.success("Tarjeta welcome enviada a impresión");
    }

    @Button
    @Label("Código WiFi")
    Object codigoWifi(HttpRequest httpRequest) {
        return Message.success("Código WiFi: RIU-" + (id == null ? "0000" : id) + "-GUEST");
    }

    @Button
    @Label("No show")
    Object noShow(HttpRequest httpRequest) {
        return Message.success("Reserva marcada como No show");
    }

    @Button
    @Label("Deshacer check-in")
    Object deshacerCheckin(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            line.setStatus(CheckInStatus.PENDING);
            repository.save(line);
            return (Object) Message.success("Check-in deshecho");
        }).orElse(Message.success("Reservation not found"));
    }
}
