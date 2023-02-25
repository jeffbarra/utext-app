import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";
import axios from "./axios";
import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("/messages/sync").then((response) => {
      setMessages(response.data);
    });
  }, []);

  // when app loads...run this code
  useEffect(() => {
    const pusher = new Pusher("e81003343134d71cff65", {
      cluster: "us3",
    });

    // comes from pusher.trigger (server.js)
    const channel = pusher.subscribe("messages"); // subscribed to "messages" channel
    // will push "inserted" message to messages channel
    channel.bind("inserted", function (newMessage) {
      // keep all the previous messages but also include new messages
      setMessages([...messages, newMessage]);
    });

    // Clean-up function
    // Even when "messages" changes we only have 1 subscriber
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  console.log(messages);

  return (
    <div className="app">
      <div className="app__body">
        <Sidebar />
        <Chat messages={messages} />
      </div>
    </div>
  );
}

export default App;
