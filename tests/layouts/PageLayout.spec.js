import React from 'react'
import PageLayout from 'layouts/PageLayout/PageLayout'
import { shallow } from 'enzyme'

describe('(Layout) PageLayout', () => {
  it('renders as a <div>', () => {
    const Child = () => <h2>child</h2>
    shallow(
      <PageLayout>
        <Child />
      </PageLayout>
    ).should.have.tagName('div')
  })

  it('renders its children inside of the viewport', () => {
    const Child = () => <h2>child</h2>
    shallow(
      <PageLayout>
        <Child />
      </PageLayout>
    )
      .find('.page-layout__viewport')
      .should.contain(<Child />)
  })
})
