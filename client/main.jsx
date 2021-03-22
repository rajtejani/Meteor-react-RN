import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import App from './App';

import '/imports/models/model.shared.js';
import '/imports/utils/utils.shared.js';


Meteor.startup(() => {
  render(<App/>, document.getElementById('react-target'));
});
