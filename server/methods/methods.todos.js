Meteor.methods({
    addTodos({ title }){
        return MODEL.todos.addTodos({ title });
    },
});
