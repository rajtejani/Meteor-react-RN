/*    model._______.js
    Models are the only place in the whole system where we're allowed to directly invoke MongoDB calls (create, remove, update, upsert, find, findOne, etc).
    The restricted MODEL object is exposed to global scope so that users can interact with the database through functions you define here.
 */
import _ from 'lodash';
import {Enum} from 'meteor/jagi:astronomy';
import {Model} from '/imports/models/model.js';

/*    DEFINE COLLECTION.
    Define an instance of Model and a schema for a collection in the DB.
    This will be private to this file.
 */
MODEL.todos = new Model({
    name: 'todos',
    collection: new Mongo.Collection('todos'),
    fields: {
        title: String,
        completed: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: new Date
        },
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
MODEL.todos.publish({
    'getTodos': function(){

        return this.DB.find({})
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
MODEL.todos.defineSharedFunctions({
    getTodos(){
        return this.DB.find({}).fetch();
    },
});

/*  SERVER-ONLY FUNCTIONS.
    Define functions to _modify_ data. This is "trusted" code, meaning that it is protected from users (until you create a Meteor method, that is).
    The MODEL object can be accessed anywhere, but these functions will only be available on the server.
 */
MODEL.todos.defineServerOnlyFunctions({
    addTodos({title}){
       return  this.DB.insert({ title, completed: false })
    }
});
