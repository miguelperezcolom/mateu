describe('basic fields', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:8080')

        cy.get('.v-menubar-menuitem').contains('E2E').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('E2E').click();

        cy.get('.v-menubar-menuitem').contains('Forms').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Forms').click();

        cy.get('.v-menubar-menuitem').contains('String array field form').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('String array field form').click();

        cy.get('.viewTitle').contains('String array field form').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        // collection is empty
        cy.get('.v-button').contains('One action').should('exist')
        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('array is null').should('exist')

        cy.get('.test-array').type('aa,bb,cc');

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('[aa, bb, cc]').should('exist')

        cy.get('.test-array').clear();
        cy.get('.test-array').type('aa,cc');

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('[aa, cc]').should('exist')


        cy.get('.test-array').clear();

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('array is null').should('exist')

    })



})
