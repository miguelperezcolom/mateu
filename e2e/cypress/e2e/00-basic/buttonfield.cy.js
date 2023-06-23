describe('basic fields', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:8081')

        cy.get('.v-menubar-menuitem').contains('E2E').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('E2E').click();

        cy.get('.v-menubar-menuitem').contains('Forms').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Forms').click();

        cy.get('.v-menubar-menuitem').contains('Button field form').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Button field form').click();

        cy.get('.viewTitle').contains('Button field form').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        cy.get('.test-action-reset').click({force: true})

        cy.get('.test-allRecordedRuns').contains('Not run yet').should('exist')

        cy.get('.test-name').should('be.visible')
        cy.get('.test-name').type('Mateu');

        cy.get('.test-age').should('exist')
        cy.get('.test-age').type('14');


        //test-action-submitted
        cy.get('.test-button').contains('Hello button!').should('exist')
        cy.get('.test-button').focus();
        cy.get('.test-button').click();

        cy.get('.v-label').contains('runned for Mateu,14').should('be.visible')

        cy.get('.test-allRecordedRuns').contains('runned for Mateu,14').should('exist')

    })



})
