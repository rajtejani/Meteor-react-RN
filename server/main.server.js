import { Meteor } from 'meteor/meteor';
import {Accounts} from "meteor/accounts-base";

import '/imports/models/model.shared.js';
import '/imports/utils/utils.shared.js';
import './methods/methods.todos';

Meteor.startup(() => {
    // let fromEmail = 'no-reply@vuu.com';
    //
    // //TODO: add MAIL_URL to setting in demo after AWS SES account is out of Sandbox
    // if(Meteor.settings.public.environment !== 'production')
    //     fromEmail = 'rebecca@betacanon.com';
    //
    // Accounts.emailTemplates.siteName = 'VUU';
    // Accounts.emailTemplates.from = 'VUU No-Reply <' + fromEmail + '>';
    //
    // Accounts.emailTemplates.enrollAccount = {
    //     subject(user) {
    //         return `Welcome to VUU, ${user.profile.firstName} ${user.profile.lastName}`;
    //     },
    //
    //     text(user, url) {
    //         return 'You can keep track of the admission process by using our app. To activate your account, simply click the link below:\n\n'
    //             + url;
    //     }
    // };
});
