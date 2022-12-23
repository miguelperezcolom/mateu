describe('basic fields', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:8080')
    })

    it('displays the menu', () => {
        cy.get('.v-menubar-menuitem').contains('Crud 1').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Crud 1').click();

        cy.get('.viewTitle').contains('Hola xx').should('be.visible')

    })
})
