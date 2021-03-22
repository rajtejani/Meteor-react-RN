import { Class } from 'meteor/jagi:astronomy';

// Defining a global object
if(Meteor.isClient) {
	window.MODEL = {};
}
else {
	global.MODEL = {};
}

// Use `new Model({ astronomyDefinition })` to create a collection in the database. Create publications and define functions to access data. Within the functions you define, that will be the only place where collection.find(), collection.update() or any other direct database query will be available.
export class Model {

	constructor({name, collection, fields, indexes, helpers}) {
		// Attach this to global MODEL object
		MODEL[name] = {};

		// Define the collection. This can only be accessed from within this model.
		this.name = name;
		this.DB = Class.create({
			collection,
			fields,
			indexes,
			helpers,
			name: this.name,
			meteorMethods: {}, // Disabled by default
		});
	}

	// Use .publish() to define functions for publication. Only works on server. `this` will equal the the original `this` which meteor passes to Meteor.publish functions, but  .
	publish(pubDefinitions = {}) {
		if (Meteor.isServer) {
			for (let pubName in pubDefinitions) {
				if (pubDefinitions.hasOwnProperty(pubName)) {
					const _this = this;

					Meteor.publish(pubName, function (params) {
						// Extend Meteor's provided `this` object to include our DB.
						this.DB = _this.DB;

						return pubDefinitions[pubName].bind(this)(params);
					});
				}
			}
		}
	}

	// Use .defineSharedFunctions() to define functions to be accessed via MODEL.<collectionName>.<functionName>() on both client and server. `this` will equal this instance of `Model` and this.DB will be direct DB access.
	defineSharedFunctions(functionDefinitions) {
		this.bindFunctionDefinitions(functionDefinitions);
	}

	// Use .defineServerOnlyFunctions() to define functions to be accessed via MODEL.<collectionName>.<functionName>() on the SERVER ONLY. `this` will equal this instance of `Model` and this.DB will be direct DB access.
	defineServerOnlyFunctions(functionDefinitions) {
		if (Meteor.isServer)
			this.bindFunctionDefinitions(functionDefinitions);

	}

	// Use .defineClientOnlyFunctions() to define functions to be accessed via MODEL.<collectionName>.<functionName>() on the CLIENT ONLY. `this` will equal this instance of `Model` and this.DB will be direct DB access.
	defineClientOnlyFunctions(functionDefinitions) {
		if (Meteor.isClient)
			this.bindFunctionDefinitions(functionDefinitions);

	}

	bindFunctionDefinitions(functionDefinitions) {
		for (let namespace in functionDefinitions) {
			if (functionDefinitions.hasOwnProperty(namespace)) {
				if (this[namespace])
					return console.error('Will not bind function "' + namespace + '" to MODEL.' + this.name + ' because this namespace is already in use.');

				const _this = {DB: this.DB};

				this[namespace] = functionDefinitions[namespace].bind(_this);
			}
		}
	}

}