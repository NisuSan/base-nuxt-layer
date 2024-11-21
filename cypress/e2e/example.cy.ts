describe('Test example for layer', () => {
  it('Has tabs ToDo and Reminder', () => {
    cy.visit('/')

    cy.get('.n-tabs').should('be.visible')
    cy.get('.n-tabs-tab').should('have.length', 2)
    cy.get('.n-tabs-tab').eq(0).should('have.text', 'ToDo')
    cy.get('.n-tabs-tab').eq(1).should('have.text', 'Reminder')
  })

  it('By default selected tab is ToDo', () => {
    cy.visit('/')
    cy.get('.n-tabs-tab.n-tabs-tab--active').should('have.text', 'ToDo')
  })

  it('Set the query param tab=todo open ToDo tab', () => {
    cy.visit('/?tab=todo')
    cy.get('.n-tabs-tab.n-tabs-tab--active').should('have.text', 'ToDo')
  })

  it('Set the query param tab=reminder open Reminder tab', () => {
    cy.visit('/?tab=reminder')
    cy.get('.n-tabs-tab.n-tabs-tab--active').should('have.text', 'Reminder')
  })

  it('Click on Reminder tab open Reminder tab', () => {
    cy.visit('/?tab=todo')
    cy.get('.n-tabs-tab').eq(1).click()
    cy.get('.n-tabs-tab.n-tabs-tab--active').should('have.text', 'Reminder')
  })

  it('Click on ToDo tab open ToDo tab', () => {
    cy.visit('/?tab=reminder')
    cy.get('.n-tabs-tab').eq(0).click()
    cy.get('.n-tabs-tab.n-tabs-tab--active').should('have.text', 'ToDo')
  })

  it('ToDo tab has input and button', () => {
    cy.visit('/?tab=todo')
    cy.get('.c-input').should('be.visible')
    cy.get('.n-button').should('be.visible')
  })

  it('ToDo tab\'s button is diabled when input empty', () => {
    cy.visit('/?tab=todo')
    cy.get('.c-input').should('have.value', '')
    cy.get('.n-button').should('be.disabled')
  })

  it('ToDo tab\'s button is enable when input has value', () => {
    cy.visit('/?tab=todo')
    cy.get('.c-input').type('test')
    cy.get('.n-button').should('be.enabled')
  })

  it('ToDs\'s API list enpoint return 200 OK', () => {
    cy.visit('/?tab=todo')
    cy.request('GET', '/api/todo/list').should((res) => {
      expect(res.status).to.eq(200)
    })
  })

  it.only('ToDs\'s page render empty element when API list query is empty', () => {
    cy.visit('/?tab=todo')
    cy.request('GET', '/api/todo/list').then((res) => {
      if(res.body.length === 0) {
        cy.get('.n-empty').should('be.visible')
        cy.get('.n-empty__icon').should('be.visible')
        cy.get('.n-empty__description').should('have.text', 'No todos here. Add one!')
      }
    })
  })



})
