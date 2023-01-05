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

        cy.get('.v-menubar-menuitem').contains('Basic form').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Basic form').click();

        cy.get('.viewTitle').contains('Basic form').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        cy.get('.test-name').should('be.visible')
        cy.get('.test-name').type('Mateu');

        cy.get('.test-age').should('exist')
        cy.get('.test-age').type('14');

        cy.get('.test-rating').should('exist')
        cy.get('.test-rating').type('1200.25');

        cy.get('.test-width').should('exist')
        cy.get('.test-width').type('62.43');

        cy.get('.test-selected').should('exist')
        cy.get('.test-selected').check({force: true});

        cy.get('.test-date input').should('exist')
        cy.get('.test-date input').type('20231001');

        cy.get('.test-dateTime input').should('exist')
        cy.get('.test-dateTime input').type('20231001 1236');

        cy.get('.v-button').contains('One action').should('exist')
        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('Mateu,14,1200.25,62.43,true,2023-10-01,2023-10-01T12:36').should('exist')
    })

    it('mandatory fields are checked', () => {

        cy.get('.test-name').type('Mateu');

        cy.get('.test-age').type('14');

        cy.get('.test-rating').type('1200.25');

        cy.get('.test-width').type('62.43');

        cy.get('.test-selected').check({force: true});

        cy.get('.test-canNotBeEmpty').clear();

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.v-Notification.error').contains('Please solve errors for all fields').should('be.visible');

        cy.get('.v-Notification.error').contains('Please solve errors for all fields').click();

        cy.get('.v-Notification.error').should('not.exist');

        cy.get('.test-canNotBeEmpty').type('x');

        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('Mateu,14,1200.25,62.43,true').should('exist')
    })



})
