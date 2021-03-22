import React from 'react';
import ToDosList from "./Todos";
import AddTodo from "./AddTodo";

const App = () => {
    return(
        <>
            <AddTodo />
        <ToDosList />
        </>
    )
}

export default  App;