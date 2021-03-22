import React from 'react';
import {View, ScrollView, Text} from 'react-native';
import Meteor, { Mongo, withTracker } from "@meteorrn/core";
const Todos = new Mongo.Collection("todos");
Meteor.connect('ws://192.168.2.242:3000/websocket');

class MyApp extends React.Component {

  render() {
    const {loading, myTodoTasks} = this.props;
    console.log('-*-* loading *-**- myTodoTasks *-*', loading, myTodoTasks);

    if (loading) {
      return (
        <View>
          <Text>Loading your tasks...</Text>
        </View>
      );
    }

    return (
      <ScrollView>

        {!myTodoTasks.length ? (
          <Text>You don't have any tasks</Text>
        ) : (
          myTodoTasks.map((task) => <Text>{task.title}</Text>)
          )
        }
      </ScrollView>
    );
  }
}



const MyAppContainer = withTracker(() => {
  const myTodoTasks = Todos.find().fetch();
  const handle = Meteor.subscribe('getTodos');

  return {
    myTodoTasks,
    loading:!handle.ready()
  };

})(MyApp);

export default MyAppContainer;
