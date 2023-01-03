describe('basic fields', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:8080')

        cy.get('.v-menubar-menuitem').contains('E2E').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('E2E').click();

        cy.get('.v-menubar-menuitem').contains('Pojo field form').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Pojo field form').click();

        cy.get('.viewTitle').contains('Pojo field form').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        cy.get('.test-pojo').contains('No value. Click here to set').should('be.visible')
        cy.get('.test-pojo').click()

        cy.get('.test-name').should('be.visible')
        cy.get('.test-name').type('Mateu');

        cy.get('.test-age').should('exist')
        cy.get('.test-age').type('14');

        cy.get('.v-button').contains('One action').should('exist')
        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('Mateu,14').should('exist')

        cy.get('.v-button').contains('Save').should('exist')
        cy.get('.v-button').contains('Save').click({force: true})

        cy.get('.test-pojo').contains('Mateu').contains('14').should('be.visible')
        cy.get('.test-pojo').click()

        cy.get('.test-name').should('have.value', 'Mateu')

        cy.get('.test-age').should('have.value', '14')

    })



})
