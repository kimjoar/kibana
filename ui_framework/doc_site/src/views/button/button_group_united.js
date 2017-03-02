import React from 'react';

import {
  KuiBasicButton,
  KuiButtonGroup,
  KuiNextButtonIcon,
  KuiPreviousButtonIcon,
} from '../../../../components';

export default () => (
  <div>
    <KuiButtonGroup isUnited>
      <KuiBasicButton>
        Option A
      </KuiBasicButton>
      <KuiBasicButton>
        Option B
      </KuiBasicButton>
      <KuiBasicButton>
        Option C
      </KuiBasicButton>
    </KuiButtonGroup>

    <br />

    <KuiButtonGroup isUnited>
      <KuiBasicButton icon={<KuiPreviousButtonIcon />}/>
      <KuiBasicButton iconRight={<KuiNextButtonIcon />}/>
    </KuiButtonGroup>
  </div>
);
