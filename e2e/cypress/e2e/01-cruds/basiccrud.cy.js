describe('basic fields', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:8080')

        cy.get('.v-menubar-menuitem').contains('E2E').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('E2E').click();

        cy.get('.v-menubar-menuitem').contains('Cruds').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Cruds').click();

        cy.get('.v-menubar-menuitem').contains('Basic crud').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Basic crud').click();

        cy.get('.viewTitle').contains('Basic crud').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        cy.get('.test-countlabel').contains('503 matches').should('be.visible')
        cy.get('.test-listsummaryline').contains('No items selected').should('be.visible')
        cy.get('.actionsbar .v-button').contains('New').should('be.visible')
        cy.get('.actionsbar .v-button').contains('Delete').should('be.visible')

        cy.get('.test-gridresultado tbody tr:nth-child(1) td').contains('Mateu Pérez').should('exist')
        cy.get('.test-gridresultado tbody tr:nth-child(1) td').contains('14').should('exist')
        cy.get('.test-gridresultado tbody tr:nth-child(2) td').contains('Antònia Galmés').should('exist')
        cy.get('.test-gridresultado tbody tr:nth-child(2) td').contains('47').should('exist')

        cy.get('.test-name').should('be.visible')
        cy.get('.test-name').type('Mateu\n');
        cy.get('.test-countlabel').contains('1 match').should('exist')
        cy.get('.test-countlabel').contains('where Name = Mateu').should('exist')

        cy.get('.test-gridresultado').contains('Mateu Pérez').should('exist')
        cy.get('.test-gridresultado').contains('Antònia Galmés').should('not.exist')

        cy.get('.actionsbar .v-button').contains('New').click({force: true})
        cy.get('.test-name').type('Mateu is the best\n');

    })



})
