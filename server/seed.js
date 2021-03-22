import {Meteor} from "meteor/meteor";
import {admin} from '/server/seedObjects.js';

Meteor.startup(() => {
	if (Meteor.settings.public.environment !== 'production') {
		const adminDoc = MODEL.users.getUserByEmail(admin.email);

		if (!adminDoc) {
			console.warn('Seeding Admin');
			MODEL.users.createUser({...admin});
		}
	}
});