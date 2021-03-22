import React, { useState } from 'react';

const AddTodo = () => {
    const [title, _setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!title)
            return

        Meteor.call('addTodos', { title }, (err) => {
            if(err)
                return console.log("--- addTodos err *-*-", err);

            _setTitle('');
        })
    }

    return(
        <form onSubmit={handleSubmit}>
            <input type={'text'} value={title} onChange={({ target }) => _setTitle(target.value)} />
        </form>
    )
}

export default AddTodo;