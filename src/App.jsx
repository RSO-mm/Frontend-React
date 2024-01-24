import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';



const App = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendRequest = async (message) => {
    setIsTyping(true);
    try {
      const response = await processMessageToChatGPT(message);
      if (response.ok) {

      } else {
        console.log('POST request failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);
      fetchData();
    }
  };

  async function processMessageToChatGPT(chatMessage) {


    const apiRequestBody = {
      "userText": chatMessage,
      "userCreated": new Date().toLocaleTimeString(),
    };

    const response = await fetch("http://34.16.83.155:8080/v1/chat/", {
      method: "POST",
      headers: {
        //"Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    });

    return response.json();
  }

  const fetchData = async () => {
    const getResponse = await fetch("http://34.16.83.155:8080/v1/chat/");

    if (getResponse.ok) {
      const text = await getResponse.text();
      try {
        const data = JSON.parse(text);
        setMessages(data);
      } catch (error) {
        console.error('Failed to parse JSON:', text);
        throw error;
      }
    } else {
      console.log('GET request failed:', getResponse.status, getResponse.statusText);
    }
  };

  useEffect(() => {

    fetchData();
  }, []);

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.flatMap((message, i) => {
                //console.log(message)
                const botMessage = {
                  message: message.text,
                  direction: 'incoming',
                  sender: 'ChatGPT',
                  sentTime: message.created
                };
                const userMessage = {
                  message: message.userText,
                  direction: 'outgoing',
                  sender: 'User',
                  sentTime: message.userCreated
                };
                return [<Message key={`user${i}`} model={userMessage} />, <Message key={`bot${i}`} model={botMessage} />]
              })}
            </MessageList>
            <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App;