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

        cy.get('.v-menubar-menuitem').contains('Text area field form').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Text area field form').click();

        cy.get('.viewTitle').contains('Text area field form').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        // collection is empty
        cy.get('.v-button').contains('One action').should('exist')
        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').should('exist')

        cy.get('.test-text').type('un texto');

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('un texto').should('exist')

        cy.get('.test-text-button-expand').click({force: true})

        cy.get('.viewTitle').contains('Text').should('be.visible')

        cy.get('.test-text').should('have.value', 'un texto')

        cy.get('.test-text').clear().type('otro texto');

        cy.get('.v-button').contains('Save').click({force: true})

        cy.get('.viewTitle').contains('Text area field form').should('be.visible')

        cy.get('.test-text').should('have.value', 'otro texto')

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('otro texto').should('exist')

    })



})
