

describe('Test general tabs functionalities', () => {
  const tabs = [
    { tab: 'todo', name: 'ToDo' },
    { tab: 'reminder', name: 'Reminder' }
  ]

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

  for (const el of tabs) {
    it(`Set the query param tab=${el.tab} open ${el.name} tab`, () => {
      cy.visit(`/?tab=${el.tab}`)
      cy.get('.n-tabs-tab.n-tabs-tab--active').should('have.text', el.name)
    })
  }

  for (let i = 0; i < tabs.length; i++) {
    const el = tabs[i]!
    it(`Click on ${el.name} tab open ${el.name} tab`, () => {
      cy.visit(`/?tab=${el.tab}`)
      cy.get('.n-tabs-tab').eq(el.tab === 'todo' ? 1 : 0).click()
      cy.get('.n-tabs-tab.n-tabs-tab--active').should('have.text', tabs[el.tab === 'todo' ? 1 : 0]?.name)
    })
  }
})

describe('Test ToDo tab', () => {
  if(process.env.NODE_ENV === 'development')
    before(() => cy.task('deleteFile', './.playground/server/db/todo.json'))

  beforeEach(() => cy.visit('/?tab=todo'))

  it('ToDo tab has input and button', () => inputPanel('todo'))
  it('ToDo tab\'s button is disabled when input empty', () => inputPanelActivity('', 'disabled'))
  it('ToDo tab\'s button is enable when input has value', () => inputPanelActivity('test todo', 'enabled'))

  it('ToDo\'s page render empty element when API list query is empty', () => {
    cy.request('GET', '/api/todo/list').then((res) => {
      expect(res.status).to.eq(200)
      if(res.body.length === 0) {
        emptyVisibility('todo')
      }
    })
  })

  it('Add new ToDo', () => {
    cy.get('.c-input').type('test todo')
    cy.get('.todo-add').click()

    cy.intercept('POST', '/api/todo/add', (request) => {
      expect(request.body.task).to.eq('test todo')
      expect(request.body.done).to.be.false
      expect(request.body.id).to.be.greaterThan(0)

      cy.get('.c-input').should('have.value', '')
      cy.get('.todo-add').should('be.disabled')
      cy.get('.n-empty').should('not.exist')
      cy.get('.todo-list').should('be.visible')
      cy.get('.todo-list li').should('have.length', 1).should('have.text', 'test todo')
    })
  })

  it('Make todo done', () => {
    cy.get('.todo-list li .n-checkbox').click()

    cy.intercept('PUT', '/api/todo/close', (request) => {
      expect(request.body.done).to.be.true
      cy.get('.todo-list li .n-checkbox').should('be.checked')
      cy.get('.todo-list li span').should('have.class', 'line-through')
    })
  })

  it('Make todo undone', () => {
    cy.get('.todo-list li .n-checkbox').click()

    cy.intercept('PUT', '/api/todo/close', (request) => {
      expect(request.body.done).to.be.true
      cy.get('.todo-list li .n-checkbox').should('not.be.checked')
      cy.get('.todo-list li span').should('not.have.class', 'line-through')
    })
  })

  it('Remove todo', () => {
    cy.get('.todo-list li .todo-remove').click()

    cy.intercept('DELETE', '/api/todo/remove', (request) => {
      expect(request.body).to.be.true
      emptyVisibility('todo')
    })
  })
})

describe('Test Reminder tab', () => {
  if(process.env.NODE_ENV === 'development')
    before(() => cy.task('deleteFile', './.playground/server/db/reminder.json'))

  beforeEach(() => cy.visit('/?tab=reminder'))

  it('Reminder tab has input and button', () => inputPanel('reminder'))
  it('Reminder tab\'s button is disabled when input empty', () => inputPanelActivity('', 'disabled'))
  it('Reminder tab\'s button is enable when input has value', () => inputPanelActivity('test remind', 'enabled'))

  it('Reminder\'s page render empty element when API list query is empty', () => {
    cy.request('GET', '/api/reminder/list').then((res) => {
      expect(res.status).to.eq(200)
      if(res.body.length === 0) {
        emptyVisibility('reminder')
      }
    })
  })

  it('Add new Reminder', () => {
    fillInputPanel('test remind')
    cy.get('.reminder-add').click()

    cy.intercept('POST', '/api/reminder/add', (request) => {
      expect(request.body.task).to.eq('test remind')
      expect(request.body.id).to.be.greaterThan(0)

      cy.get('.c-input').should('have.value', '')
      cy.get('.reminder-add').should('be.disabled')
      cy.get('.n-empty').should('not.exist')
      cy.get('.reminder-list').should('be.visible')
      cy.get('.reminder-list li').should('have.length', 1).should('have.text', 'test remind')
    })
  })

  it('Remove reminder', () => {
    cy.get('.reminder-list li .reminder-remove').click()

    cy.intercept('DELETE', '/api/reminder/remove', (request) => {
      expect(request.body).to.be.true
      emptyVisibility('reminder')
    })
  })
})

describe('Test color mode change', () => {
  for (const th of [{name: 'dark', i: 'sun'}, {name: 'light', i: 'moon'}]) {
    it(`Change color mode to ${th.name}`, () => {
      cy.visit('/?tab=todo')
      cy.window().then((win) => win.localStorage.setItem('vueuse-color-scheme', th.name === 'dark' ? 'light' : 'dark'))

      cy.get('.toggle-theme').click()
      cy.get('[theme]').should('have.attr', 'theme', th.name)
      cy.get(`.toggle-theme-${th.i}`).should('be.visible')
    })
  }
})

function inputPanel(tab: 'todo' | 'reminder') {
  cy.get('.c-input').should('be.visible').should('have.length', tab === 'todo' ? 1 : 2)
  cy.get('.n-button').should('be.visible')
}

function inputPanelActivity(text: string, state: 'enabled' | 'disabled') {
  if(text === '') cy.get('.c-input').should('have.value', text)

  fillInputPanel(text)
  cy.get('.n-button').should(`be.${state}`)
}

function fillInputPanel(text: string) {
  if(text === '') cy.get('.c-input').eq(0).invoke('val', '')
  else cy.get('.c-input').eq(0).type(text)

  if(text.includes('remind')) {
    cy.get('.c-input').eq(1).click()
    cy.get('.n-date-panel-actions__suffix button').eq(0).click()
  }
}

function emptyVisibility(text: 'todo' | 'reminder') {
  cy.get('.n-empty').should('be.visible')
  cy.get('.n-empty__icon').should('be.visible')
  cy.get('.n-empty__description').should('have.text', `No ${text}s here. Add one!`)
}
