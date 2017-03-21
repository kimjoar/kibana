import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import {
  KuiButton,
  KuiBasicButton,
  KuiHollowButton,
  KuiDangerButton,
  KuiPrimaryButton,
} from './button';

describe('KuiButton', () => {
  describe('Props', () => {
    describe('testSubject', () => {
      test('is rendered', () => {
        const $button = shallow(
          <KuiButton testSubject="test subject string" />
        );

        expect($button)
          .toMatchSnapshot();
      });
    });

    describe('icon', () => {
      test('is rendered with children', () => {
        const $button = shallow(
          <KuiButton icon="Icon">
            Hello
          </KuiButton>
        );

        expect($button)
          .toMatchSnapshot();
      });

      test('is rendered without children', () => {
        const $button = shallow(
          <KuiButton icon="Icon" />
        );

        expect($button)
          .toMatchSnapshot();
      });
    });

    describe('isIconOnRight', () => {
      test('moves the icon to the right', () => {
        const $button = shallow(
          <KuiButton icon="Icon" isIconOnRight>
            Hello
          </KuiButton>
        );

        expect($button)
          .toMatchSnapshot();
      });
    });

    describe('children', () => {
      test('is rendered', () => {
        const $button = shallow(
          <KuiButton>
            Hello
          </KuiButton>
        );

        expect($button)
          .toMatchSnapshot();
      });
    });

    describe('isSubmit', () => {
      test('changes the element from a button to an input[type=submit]', () => {
        const $button = shallow(
          <KuiButton isSubmit />
        );

        expect($button)
          .toMatchSnapshot();
      });

      describe(`doesn't throw an error`, () => {
        test('if it receives string children', () => {
          const $button = shallow(
            <KuiButton isSubmit>
              Hello
            </KuiButton>
          );

          expect($button)
            .toMatchSnapshot();
        });
      });

      describe('throws an error', () => {
        test('if it receives non-string children', () => {
          const $button = () => {
            shallow(
              <KuiButton isSubmit>
                <span>Hello</span>
              </KuiButton>
            );
          };

          expect($button)
            .toThrowErrorMatchingSnapshot();
        });

        test('if it receives icon', () => {
          const $button = () => {
            shallow(
              <KuiButton isSubmit icon='Icon' />
            );
          };

          expect($button)
            .toThrowErrorMatchingSnapshot();
        });
      });
    });

    describe('href', () => {
      test('changes the element from a button to an anchor tag', () => {
        const $button = shallow(
          <KuiButton href="#" />
        );

        expect($button)
          .toMatchSnapshot();
      });
    });

    describe('target', () => {
      test('is rendered', () => {
        const $button = shallow(
          <KuiButton target="_blank" />
        );

        expect($button)
          .toMatchSnapshot();
      });
    });

    describe('onClick', () => {
      test(`isn't called upon instantiation`, () => {
        const onClickHandler = sinon.stub();

        const $button = shallow(
          <KuiButton onClick={onClickHandler} />
        );

        sinon.assert.notCalled(onClickHandler);
      });

      test('is called when the button is clicked', () => {
        const onClickHandler = sinon.stub();

        const $button = shallow(
          <KuiButton onClick={onClickHandler} />
        );

        $button.find('button')
          .simulate('click');

        sinon.assert.calledOnce(onClickHandler);
      });

      test('receives the data prop', () => {
        const onClickHandler = sinon.stub();
        const data = 'data';

        const $button = shallow(
          <KuiButton onClick={onClickHandler} data={data} />
        );

        $button.find('button')
          .simulate('click');

        sinon.assert.calledWith(onClickHandler, data);
      });
    });

    describe('isDisabled', () => {
      test('sets the disabled attribute', () => {
        const $button = shallow(
          <KuiButton isDisabled />
        );

        expect($button)
          .toMatchSnapshot();
      });

      test(`prevents onClick from being called`, () => {
        const onClickHandler = sinon.stub();

        const $button = shallow(
          <KuiButton isDisabled onClick={onClickHandler} />
        );

        $button.find('button')
          .simulate('click');

        sinon.assert.notCalled(onClickHandler);
      });
    });

    describe('isLoading', () => {
      test('renders a spinner', () => {
        const $button = shallow(
          <KuiButton isLoading />
        );

        expect($button)
          .toMatchSnapshot();
      });

      test(`doesn't render the icon prop`, () => {
        const $button = shallow(
          <KuiButton isLoading icon="Icon" />
        );

        expect($button)
          .toMatchSnapshot();
      });
    });

    describe('className', () => {
      test('renders the classes', () => {
        const $button = shallow(
          <KuiButton className="testClass1 testClass2" />
        );

        expect($button)
          .toMatchSnapshot();
      });
    });
  });
});

describe('KuiBasicButton', () => {
  test('is rendered with basic class', () => {
    const $button = shallow(
      <KuiBasicButton />
    );

    expect($button)
      .toMatchSnapshot();
  });
});

describe('KuiHollowButton', () => {
  test('is rendered with hollow class', () => {
    const $button = shallow(
      <KuiHollowButton />
    );

    expect($button)
      .toMatchSnapshot();
  });
});

describe('KuiDangerButton', () => {
  test('is rendered with danger class', () => {
    const $button = shallow(
      <KuiDangerButton />
    );

    expect($button)
      .toMatchSnapshot();
  });
});

describe('KuiPrimaryButton', () => {
  test('is rendered with primary class', () => {
    const $button = shallow(
      <KuiPrimaryButton />
    );

    expect($button)
      .toMatchSnapshot();
  });
});
