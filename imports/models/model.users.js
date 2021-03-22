/*    model._______.js
    Models are the only place in the whole system where we're allowed to directly invoke MongoDB calls (create, remove, update, upsert, find, findOne, etc).
    The restricted MODEL object is exposed to global scope so that users can interact with the database through functions you define here.
 */
import _ from 'lodash';
import {Enum} from 'meteor/jagi:astronomy';
import {Model} from '/imports/models/model.js';
import {Accounts} from "meteor/accounts-base";

/*    DEFINE COLLECTION.
    Define an instance of Model and a schema for a collection in the DB.
    This will be private to this file.
 */
MODEL.users = new Model({
	name: 'users',
	collection: Meteor.users,
	fields: {
		emails: [Object],
		profile: {
			type: Object,
			fields: {
				firstName: String,
				lastName: String,
				phone: String
			}
		},
		createdAt: Date,
		updatedAt: {
			type: Date,
			optional: true
		}
	},
});

/*  PUBLISH DATA FROM SERVER.
    Publish data from server to client.
    Exactly the same as Meteor.publish(), except `this.DB` is how you access the relevant collection and you don't have to wrap it in Meteor.isServer.
 */
MODEL.users.publish({
	'ownUserData': function () {
		return this.DB.find({
			_id: this.userId,
		}, {
			fields: {
				profile: 1,
				emails: 1,
				entityId: 1,
				status: 1
			}
		});
	},

	'usersById': function (userIds) {
		return this.DB.find({_id: {$in: userIds}});
	},

	'userById': function (userId) {
		return this.DB.find({_id: userId});
	},
});
/*  SUBSCRIBE CLIENT TO PUBLISHED DATA FROM SERVER.
    (Discouraged in most cases. Usually you should subscribe to data when you need it, not just when the page loads.)
    Subscribe to publications if you want their data available system-wide on the Client.
    Does not require Meteor.isClient or Tracker.autorun. If you want to disable Tracker.autorun, use MODEL.subscribeWithoutAutorun(...)
 */

/*  SHARED FUNCTIONS (CLIENT + SERVER).
    Define functions to _retrieve_ data. Subscribe first
    The MODEL object can be accessed anywhere and so will shared functions.
 */
MODEL.users.defineSharedFunctions({
	createUser({email, password, entityId, profile}) {
		// Accessed as MODEL.users.createUser(...);

		const options = {
			email: email,
			profile: profile,
			entityId: entityId
		};

		if (password)
			options.password = password;

		return  Accounts.createUser(options);
	},

	getCurrentUser() {
		return Meteor.user();
	},

	getCurrentUserId() {
		return Meteor.userId();
	},

	getUserName(userDoc, abbreviate = false) {
		userDoc = userDoc || MODEL.users.getCurrentUser();

		if (userDoc) {
			const profile = userDoc.profile;

			if (abbreviate)
				return `${profile.firstName} ${profile.lastName[0]}.`;
			else
				return `${profile.lastName}, ${profile.firstName}`;
		}
	},

	getUsersById(userIds) {
		return this.DB.find({_id: {$in: userIds}}).fetch();
	},

	getUserById(userId) {
		return this.DB.findOne({_id: userId});
	},

	getUserByEmail(email) {
		if (!email)
			return;

		return Accounts.findUserByEmail(email);
	},

	getUserEmail(userDoc) {
		userDoc = userDoc || MODEL.users.getCurrentUser();

		return userDoc.emails[0].address;
	},

	logout() {
		Meteor.logout();
	},
});

/*  SERVER-ONLY FUNCTIONS.
    Define functions to _modify_ data. This is "trusted" code, meaning that it is protected from users (until you create a Meteor method, that is).
    The MODEL object can be accessed anywhere, but these functions will only be available on the server.
 */
MODEL.users.defineServerOnlyFunctions({
	newInstance(userFields) {
		return new this.DB(userFields);
	},

	updateUser({id, firstName, lastName, phone, city, state, status}) {
		const newDate = new Date();

		const setObj = {
			'profile.firstName': firstName,
			'profile.lastName': lastName,
			'profile.phone': phone,
			updatedAt: newDate
		};

		if (city)
			setObj['profile.address.city'] = city;

		if (state)
			setObj['profile.address.state'] = state;

		return this.DB.update({_id: id}, {$set: setObj});
	},

	updateEmail({userId, oldEmail, newEmail}) {
		Accounts.addEmail(userId, newEmail);
		Accounts.removeEmail(userId, oldEmail);
	},

});
