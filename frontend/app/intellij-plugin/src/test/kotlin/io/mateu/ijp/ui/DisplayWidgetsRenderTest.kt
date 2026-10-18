package io.mateu.ijp.ui

import javax.swing.JToggleButton

/**
 * The display widgets of the catalogue (landing, front-office and reporting blocks): what each shows
 * from its wire metadata, that its actions reach the server with the item they belong to, and that
 * the painted ones (charts, heatmaps, meters) actually paint.
 */
class DisplayWidgetsRenderTest : RenderTestCase() {
    // the expectations below are written in a Spanish app's number format; pin it, or the test
    // depends on the machine's default locale (money follows the UI locale since 3.0-alpha.430)
    override fun setUp() {
        super.setUp()
        MoneyValues.setAppLocale("es-ES")
    }

    override fun tearDown() {
        try {
            MoneyValues.setAppLocale(null)
        } finally {
            super.tearDown()
        }
    }


    fun testProgressStepsMarkDoneStepsAndKeepDescriptionsInBothOrientations() {
        val steps = """[{"title":"Guest","status":"done"},{"title":"Room","status":"current","description":"Pick one"},
            {"title":"Pay","status":"upcoming"}]"""
        val row = render(context(), """{"type":"ProgressSteps","steps":$steps}""")
        assertEquals(listOf("✓", "Guest", "2", "Room", "Pick one", "3", "Pay"), texts(row))
        val rail = render(context(), """{"type":"ProgressSteps","vertical":true,"steps":$steps}""")
        assertEquals(listOf("✓", "Guest", "2", "Room", "Pick one", "3", "Pay"), texts(rail))
    }

    fun testAStatShowsValueUnitAndTrendAndDrillsIn() {
        val ctx = context()
        val stat = render(ctx, """{"type":"Stat","label":"Occupancy","value":"82","unit":"%","delta":"3 pts",
            "trend":"down","spark":[1,4,2,5],"actionId":"openOccupancy"}""")
        assertTrue(texts(stat).containsAll(listOf("Occupancy", "82 %", "▼ 3 pts")))
        assertTrue(painted(paint(stat)))
        press(targets(stat).single())
        awaitRequests(1)
        assertEquals("openOccupancy", server.actionIds().single())
        assertTrue(texts(render(ctx, """{"type":"Stat","value":"1","delta":"0","trend":"flat"}""")).contains("→ 0"))
    }

    fun testPricingTableRecommendsTheFeaturedPlanAndItsCtaActs() {
        val ctx = context()
        val table = render(ctx, """{"type":"PricingTable","plans":[
            {"name":"Basic","price":"0 €","features":["1 user"],"ctaLabel":"Start"},
            {"name":"Pro","price":"9 €","period":"/ month","featured":true,"features":["10 users","SSO"],
             "ctaLabel":"Go Pro","actionId":"buyPro"}]}""")
        assertTrue(texts(table).containsAll(listOf("RECOMMENDED", "Pro", "9 € / month", "✓ SSO", "0 €")))
        assertEquals(1, texts(table).count { it == "RECOMMENDED" })
        button(table, "Go Pro").doClick()
        awaitRequests(1)
        assertEquals("buyPro", server.actionIds().single())
    }

    fun testOrgChartIndentsChildrenAndNodesAct() {
        val ctx = context()
        val chart = render(ctx, """{"type":"OrgChart","root":{"title":"Ada","subtitle":"CEO","avatar":"👩","color":"#ff0000",
            "children":[{"title":"Grace","actionId":"openGrace","children":[{"title":"Linus"}]}]}}""")
        assertEquals(listOf("👩 Ada — CEO", "Grace", "Linus"), texts(chart))
        press(targets(chart).single())
        awaitRequests(1)
        assertEquals("openGrace", server.actionIds().single())
    }

    fun testHeatmapPaintsOneWeekColumnPerWeekOfData() {
        val map = render(context(), """{"type":"Heatmap","cells":[{"date":"2026-10-01","value":1},
            {"date":"2026-10-14","value":8},{"date":"not a date","value":3},{"date":"","value":2}]}""")
        // 2026-09-28 (the Monday before) .. 2026-10-14 = 2 weeks + the trailing column
        assertEquals(4 * 15, map.preferredSize.width)
        assertTrue(painted(paint(map)))
        assertEquals(0, render(context(), """{"type":"Heatmap","cells":[]}""").componentCount)
    }

    fun testFunnelLabelsEachStageWithItsConversion() {
        val funnel = render(context(), """{"type":"Funnel","stages":[{"label":"Visits","value":200},
            {"label":"Leads","value":50,"color":"#00aa00"},{"label":"Deals","value":0},{"label":"Won","value":5}]}""")
        assertEquals(listOf("Visits", "Leads  (25% of previous)", "Deals  (0% of previous)", "Won"), texts(funnel))
        assertTrue(painted(paint(funnel)))
    }

    fun testTrendChartNeedsTwoPointsToDrawAndHonoursTheArea() {
        val chart = render(context(), """{"type":"TrendChart","title":"Revenue","values":[3,5,4,8],"area":true,"color":"#123456"}""")
        assertEquals(listOf("Revenue"), texts(chart))
        assertEquals(1, chart.components.count { it is javax.swing.JPanel })
        assertTrue(painted(paint(chart)))
        val single = render(context(), """{"type":"TrendChart","title":"Flat","values":[3]}""")
        assertEquals(0, single.components.count { it is javax.swing.JPanel })
    }

    fun testFeatureGridTestimonialsFaqAndCommentThreadShowTheirContent() {
        val ctx = context()
        val grid = render(ctx, """{"type":"FeatureGrid","features":[{"icon":"⚡","title":"Fast","description":"Very",
            "actionId":"more"},{"icon":"vaadin:cog","title":"Configurable"}]}""")
        assertTrue(texts(grid).containsAll(listOf("⚡ Fast", "Very", "Configurable")))
        press(targets(grid).single())
        awaitRequests(1)
        assertEquals("more", server.actionIds().single())

        val quotes = render(ctx, """{"type":"Testimonials","items":[{"quote":"Great","author":"Ada","role":"CTO","rating":4,"avatar":"A"}]}""")
        assertTrue(texts(quotes).containsAll(listOf("★★★★☆", "<html><i>“Great”</i></html>", "A Ada · CTO")))

        val faq = render(ctx, """{"type":"Faq","items":[{"question":"Why?","answer":"Because"}]}""")
        assertEquals(listOf("Why?", "<html>Because</html>"), texts(faq))

        val thread = render(ctx, """{"type":"CommentThread","comments":[{"author":"Ada","timestamp":"9:00","text":"Hi",
            "replies":[{"author":"Grace","text":"Hello"}]}]}""")
        assertEquals(listOf("Ada  9:00", "<html>Hi</html>", "Grace", "<html>Hello</html>"), texts(thread))
    }

    fun testCalloutCardCtaRunsItsAction() {
        val ctx = context()
        val card = render(ctx, """{"type":"CalloutCard","theme":"warning","icon":"!","title":"Unpaid","description":"2 invoices",
            "ctaLabel":"Pay now","actionId":"pay"}""")
        assertTrue(texts(card).containsAll(listOf("! Unpaid", "<html>2 invoices</html>")))
        button(card, "Pay now").doClick()
        awaitRequests(1)
        assertEquals("pay", server.actionIds().single())
    }

    fun testFileListIconsByTypeAndOpensAFile() {
        val ctx = context()
        val files = render(ctx, """{"type":"FileList","files":[{"name":"a.pdf","type":"PDF","size":"1 MB","actionId":"openA"},
            {"name":"b.bin","type":"other"}]}""")
        assertTrue(texts(files).containsAll(listOf("📕  a.pdf", "1 MB", "📄  b.bin")))
        press(targets(files).single())
        awaitRequests(1)
        assertEquals("openA", server.actionIds().single())
    }

    fun testChecklistCountsDoneItemsAndItemsAct() {
        val ctx = context()
        val list = render(ctx, """{"type":"Checklist","title":"Arrival","items":[{"label":"Passport","done":true},
            {"label":"Card","actionId":"askCard"}]}""")
        assertEquals(listOf("Arrival  (1 / 2)", "☑  Passport", "☐  Card"), texts(list))
        press(targets(list).single())
        awaitRequests(1)
        assertEquals("askCard", server.actionIds().single())
    }

    fun testMeterCaptionAndThresholds() {
        val meter = render(context(), """{"type":"Meter","label":"Credit","value":900,"max":1000,"unit":"EUR",
            "warnAt":800,"dangerAt":950}""")
        assertEquals(listOf("Credit", "900,00 EUR", "90%"), texts(meter))
        assertTrue(painted(paint(meter)))
        val captioned = render(context(), """{"type":"Meter","value":5,"max":0,"caption":"n/a"}""")
        assertEquals(listOf("5,00", "n/a"), texts(captioned))
    }

    fun testTaskProgressShowsAPillPerTaskAndHidesTheCtaWhenComplete() {
        val ctx = context()
        val pending = render(ctx, """{"type":"TaskProgress","label":"Guests registered","total":3,"done":1,
            "actionId":"next","actionLabel":"Register next"}""")
        assertTrue(texts(pending).containsAll(listOf("👥  Guests registered", "1/3", "2/3", "3/3")))
        button(pending, "Register next →").doClick()
        awaitRequests(1)
        assertEquals("next", server.actionIds().single())
        val complete = render(ctx, """{"type":"TaskProgress","label":"Done","total":2,"done":2,"actionId":"next","actionLabel":"Go"}""")
        assertTrue(buttons(complete).isEmpty())
    }

    fun testNoticeThemesStatusInlineContentAndAction() {
        val ctx = context()
        val notice = render(ctx, """{"type":"Notice","theme":"danger","text":"2 complaints","actionId":"open","actionLabel":"See"}""")
        assertEquals(listOf("!", "2 complaints"), texts(notice))
        button(notice, "See").doClick()
        awaitRequests(1)
        assertEquals("open", server.actionIds().single())

        val status = render(ctx, """{"type":"Notice","theme":"success","text":"Paid","status":"OK","slim":true}""")
        assertEquals(listOf("✓", "Paid", "OK"), texts(status))

        val inline = render(ctx, """{"type":"Notice","text":"Pax","noIcon":true,"inlineContent":true}""",
            children = """[{"type":"ClientSide","metadata":{"type":"Text","text":"1/2"}}]""")
        assertEquals(listOf("Pax", "1/2"), texts(inline))
    }

    fun testComparisonCardShowsBothSidesAndTheDelta() {
        val card = render(context(), """{"type":"ComparisonCard","title":"ADR","leftLabel":"Last year","leftValue":"98",
            "rightLabel":"This year","rightValue":"104","delta":"+6%","trend":"up"}""")
        assertTrue(texts(card).containsAll(listOf("ADR", "LAST YEAR", "98", "THIS YEAR", "104", "▲ +6%")))
    }

    fun testResourceGridSelectsAnEnabledCardOnly() {
        val ctx = context()
        val grid = render(ctx, """{"type":"ResourceGrid","actionId":"pickRoom","columns":2,"items":[
            {"id":"101","title":"101","subtitle":"Double","recommended":true,"statusLabel":"Clean","statusColor":"success",
             "note":"Sea view","noteColor":"primary"},
            {"id":"102","title":"102","disabled":true},
            {"id":"103","title":"103","selected":true}]}""")
        assertTrue(texts(grid).containsAll(listOf("Recommended", "101", "Double", "Clean", "● Sea view", "102", "103")))
        val cards = targets(grid)
        assertEquals("the disabled room is not a stop", 2, cards.size)
        press(cards.first())
        awaitRequests(1)
        assertEquals("pickRoom", server.actionIds().single())
        assertEquals("101", lastParameters().path("_item").asText())
        assertTrue("the picked card is highlighted", cards.first().isOpaque)
        assertFalse(cards.last().isOpaque)
    }

    fun testOfferCardTogglesBetweenAddedAndActionLabels() {
        val ctx = context()
        val offer = render(ctx, """{"type":"OfferCard","tag":"Upgrade","title":"Suite","subtitle":"Top floor",
            "features":["Balcony","Bath"],"actionLabel":"Add","addedLabel":"Added","added":true,"priceLabel":"+40 €","actionId":"toggle"}""")
        assertTrue(texts(offer).containsAll(listOf("Upgrade", "Suite", "Top floor", "Balcony", "Bath")))
        button(offer, "Added   +40 €").doClick()
        awaitRequests(1)
        assertEquals("toggle", server.actionIds().single())
        val current = render(ctx, """{"type":"OfferCard","title":"Double","current":true,"currentLabel":"Your room","actionLabel":"Add"}""")
        assertTrue(texts(current).contains("Your room"))
        assertTrue(buttons(current).isEmpty())
    }

    fun testAddOnPickerKeepsARunningTotalAndReportsEachToggle() {
        val ctx = context()
        val picker = render(ctx, """{"type":"AddOnPicker","actionId":"extras","currency":"EUR","totalLabel":"Extras","items":[
            {"id":"bf","title":"Breakfast","price":12.5,"unit":"day","added":true,"icon":"🍳"},
            {"id":"park","title":"Parking","price":20,"description":"Covered"},
            {"id":"wifi","title":"Wi-Fi","includedLabel":"Included"}]}""")
        assertTrue(texts(picker).containsAll(listOf("Extras: EUR 12,50", "EUR 12,50 / day", "Covered", "Included")))
        assertEquals(2, buttons(picker).size)
        val parking = buttons(picker).last()
        assertEquals("+", parking.text)
        parking.doClick()
        assertEquals("✓", parking.text)
        assertTrue(texts(picker).contains("Extras: EUR 32,50"))
        awaitRequests(1)
        assertEquals("park", lastParameters().path("_item").asText())
        assertTrue(lastParameters().path("_added").asBoolean())
        assertEquals(32.5, lastParameters().path("_total").asDouble())
    }

    fun testLedgerSumsTheNonIncludedLinesUnlessATotalIsGiven() {
        val ledger = render(context(), """{"type":"Ledger","currency":"EUR","lines":[{"concept":"Room","amount":200},
            {"concept":"Discount","amount":-20},{"concept":"Breakfast","included":true}]}""")
        assertTrue(texts(ledger).containsAll(listOf("● Room", "EUR 200,00", "-EUR 20,00", "Included", "Total", "EUR 180,00")))
        val given = render(context(), """{"type":"Ledger","totalLabel":"Due","total":99,"lines":[{"concept":"X","amount":1}]}""")
        assertTrue(texts(given).containsAll(listOf("Due", "99,00")))
    }

    fun testPaymentPickerSendsTheChosenMethod() {
        val ctx = context()
        val picker = render(ctx, """{"type":"PaymentPicker","actionId":"pay","methodActionId":"method","confirmLabel":"Charge",
            "contextLabel":"CARD","contextValue":"**** 4242","methods":[{"id":"card","label":"Card"},{"id":"cash","label":"Cash"}]}""")
        val toggles = buttons(picker).filterIsInstance<JToggleButton>()
        assertTrue("the first method is preselected", toggles.first().isSelected)
        assertTrue(texts(picker).containsAll(listOf("CARD", "**** 4242")))
        toggles.last().doClick()
        awaitRequests(1)
        assertEquals("cash", lastParameters().path("_method").asText())
        button(picker, "Charge").doClick()
        awaitRequests(2)
        assertEquals(listOf("method", "pay"), server.actionIds())
        assertEquals("cash", lastParameters().path("_method").asText())
    }

    fun testProcessMonitorCountsAndFix() {
        val ctx = context()
        val monitor = render(ctx, """{"type":"ProcessMonitor","items":[
            {"name":"Night audit","systems":["PMS","POS"],"status":"warning","ok":10,"warnings":2,"errors":1,
             "actionId":"fix","actionLabel":"Fix"},{"name":"Sync","ok":3}]}""")
        assertTrue(texts(monitor).containsAll(listOf("Night audit", "PMS · POS", "✓ 10 OK", "⚠ 2 warnings", "⛔ 1 errors", "✓ 3 OK")))
        assertFalse(texts(monitor).any { it.contains("0 warnings") })
        button(monitor, "Fix").doClick()
        awaitRequests(1)
        assertEquals("fix", server.actionIds().single())
    }

    fun testSkeletonRepeatsItsShapeAndClampsTheCount() {
        assertEquals(3, blocks(render(context(), """{"type":"Skeleton","variant":"card","count":3}""")).size)
        assertEquals(10, blocks(render(context(), """{"type":"Skeleton","variant":"grid","count":50}""")).size)
        val form = render(context(), """{"type":"Skeleton","variant":"form"}""")
        assertEquals(40, blocks(form).single().preferredSize.height)
    }

    private fun blocks(c: javax.swing.JComponent) = c.components.filter { it is javax.swing.JPanel && it.isOpaque }
}
