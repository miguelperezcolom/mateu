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

        cy.get('.v-menubar-menuitem').contains('Map field form').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Map field form').click();

        cy.get('.viewTitle').contains('Map field form').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        // collection is empty
        cy.get('.v-button').contains('One action').should('exist')
        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('empty map').should('exist')

        cy.get('.test-map .test-key').type('a');
        cy.get('.test-map .test-value').type('b');
        cy.get('.test-map .test-map-put').click({force: true});

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('size = 1,a=b').should('exist')

        cy.get('.test-map .test-key').clear().type('c');
        cy.get('.test-map .test-value').clear().type('d');
        cy.get('.test-map .test-map-put').click({force: true});
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2,a=b,c=d').should('exist')

        cy.get('.test-map-grid tbody tr:nth-child(1) td:nth-child(2)').click();
        cy.get('.test-map .test-key').should('have.value', 'a');
        cy.get('.test-map .test-value').should('have.value', 'b');


        cy.get('.test-map .test-key').clear().type('a');
        cy.get('.test-map .test-value').clear().type('e');
        cy.get('.test-map .test-map-put').click({force: true});
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2,a=e,c=d').should('exist')

        cy.get('.test-map-grid tbody tr:nth-child(1) td').contains('a').should('exist')
        cy.get('.test-map-grid tbody tr:nth-child(1) td').contains('e').should('exist')
        cy.get('.test-map-grid tbody tr:nth-child(2) td').contains('c').should('exist')
        cy.get('.test-map-grid tbody tr:nth-child(2) td').contains('d').should('exist')


        cy.get('.test-map-grid tbody tr:nth-child(1) input[type = "checkbox"]').first().click({force: true})
        cy.get('.test-map-remove').click({force: true});
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 1,c=d').should('exist')
        cy.get('.test-map-grid tbody tr:nth-child(1) td').contains('c').should('exist')
        cy.get('.test-map-grid tbody tr:nth-child(1) td').contains('d').should('exist')



    })



})
