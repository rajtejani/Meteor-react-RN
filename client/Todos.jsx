import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';

const ToDosList = () => {
    const { todos, todosSub } = useTracker(() => {
        const todos = Meteor.subscribe('getTodos');

        return {
            todosSub: todos.ready(),
            todos: MODEL.todos.getTodos()
        }
    })

    if(!todosSub){
        return <h1>Loading !!!</h1>
    }

    return (
        <div>
            <h1>Todos</h1>

            <ul>
                {
                    todos.map(task =>
                        <li>{task.title}</li>
                    )
                }
            </ul>
        </div>
    )
}

export default  ToDosList;