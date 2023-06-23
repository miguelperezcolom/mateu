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

        cy.get('.v-menubar-menuitem').contains('Collection field form').should('be.visible')

        cy.get('.v-menubar-menuitem').contains('Collection field form').click();

        cy.get('.viewTitle').contains('Collection field form').should('be.visible')
    })

    it('fields and actions should work as expected', () => {

        // collection is empty
        cy.get('.v-button').contains('One action').should('exist')
        cy.get('.v-button').contains('One action').click({force: true})

        cy.get('.test-assessment').contains('empty collection').should('exist')

        cy.get('.test-pojos tbody tr').should('not.exist')

        // collection has 1 element when add
        cy.get('.test-pojos-add').should('exist')
        cy.get('.test-pojos-add').click({force: true});

        cy.get('.test-pojos tbody').find('tr').should('have.length', 1)
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 1').should('exist')

        // collection has 2 elements when add again
        cy.get('.test-pojos-add').click({force: true});

        cy.get('.test-pojos tbody').find('tr').should('have.length', 2)
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2').should('exist')

        // collection has 2 elements when delete without mark
        cy.get('.test-pojos-delete').click({force: true});

        cy.get('.test-pojos tbody').find('tr').should('have.length', 2)
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2').should('exist')

        // collection has 1 element when mark and delete
        cy.get('.test-pojos tbody tr input[type = "checkbox"]').first().click({force: true})
        cy.get('.test-pojos-delete').click({force: true});

        cy.get('.test-pojos tbody').find('tr').should('have.length', 1)
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 1').should('exist')

        // add 1 element again (should be 2 now)
        cy.get('.test-pojos-add').click({force: true});

        cy.get('.test-pojos tbody').find('tr').should('have.length', 2)
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2').should('exist')

        // edit 1st element of collection
        cy.get('.test-pojos tbody tr td').eq(2).click({force: true})

        cy.get('.test-name').type('First')
        cy.get('.test-age').type('146546')

        // edit 2nd element of collection
        cy.get('.test-action-col_next').click({force: true})

        cy.get('.test-name').type('Second')
        cy.get('.test-age').type('244884')

        // check list
        cy.get('.test-back').click({force: true})
        cy.get('.test-pojos tbody').find('tr').should('have.length', 2)
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2,First(146546),Second(244884)').should('exist')
        cy.get('.test-pojos tbody tr:nth-child(1) td').contains('First').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(1) td').contains('146546').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(2) td').contains('Second').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(2) td').contains('244884').should('be.visible')

        // mark 1st element so it can be moved down
        cy.get('.test-pojos tbody tr input[type = "checkbox"]').first().click({force: true})

        // move it down
        cy.get('.test-pojos-down').click({force: true});
        cy.get('.test-pojos-down').click({force: true});

        // check the whole list
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2,Second(244884),First(146546)').should('exist')
        cy.get('.test-pojos tbody tr:nth-child(1) td').contains('Second').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(1) td').contains('244884').should('exist')
        cy.get('.test-pojos tbody tr:nth-child(2) td').contains('First').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(2) td').contains('146546').should('exist')

        // mark 2nd element so it can be moved down
        cy.get('.test-pojos tbody tr:nth-child(2) input[type = "checkbox"]').first().click({force: true})

        // move it up
        cy.get('.test-pojos-up').click({force: true});

        // check the whole list
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 2,First(146546),Second(244884)').should('exist')
        cy.get('.test-pojos tbody tr:nth-child(1) td').contains('First').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(1) td').contains('146546').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(2) td').contains('Second').should('be.visible')
        cy.get('.test-pojos tbody tr:nth-child(2) td').contains('244884').should('be.visible')

        // mark all elements so they can be duplicated
        cy.get('.test-pojos tbody tr input[type = "checkbox"]').click({force: true, multiple: true})

        // duplicate them
        cy.get('.test-pojos-clone').click({force: true});

        // check the whole list
        cy.get('.v-button').contains('One action').click({force: true})
        cy.get('.test-assessment').contains('size = 4,First(146546),Second(244884),First(146546),Second(244884)').should('exist')


    })



})
