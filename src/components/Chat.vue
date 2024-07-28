<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { io } from 'socket.io-client';
import * as jdenticon from 'jdenticon';
import { IconBrandTelegram } from '@tabler/icons-vue';

interface Message {
  text: string;
  sender: string;
  avatar: string;
}

const apiUrl = import.meta.env.VITE_API_URL;
const socket = io(apiUrl);
const messages = ref<Message[]>([]);
const newMessage = ref('');
const user = ref<{ id: string; avatar: string } | null>(null);
const socketId = ref<string | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
};

socket.on('connect', () => {
  if (socket.id) {
    socketId.value = socket.id;
    // Generate avatar for the user when they connect
    const avatar = jdenticon.toSvg(socketId.value, 40);
    user.value = { id: socketId.value, avatar };
  }
});

socket.on('message', (message: Message) => {
    // exclude the message send by myself
    if (message.sender !== socketId.value){
        messages.value.push(message);
        scrollToBottom();
    }
});

const sendMessage = () => {
  if (newMessage.value.trim() !== '' && user.value && socketId.value) {
    const message: Message = { text: newMessage.value, sender: socketId.value, avatar: user.value.avatar };
    socket.emit('message', { text: newMessage.value, sender: socketId.value, avatar: user.value.avatar });
    messages.value.push(message);
    newMessage.value = '';
    scrollToBottom();
  }
};

onMounted(() => {
  socket.connect();
});
</script>

<template>
  <div class="chat-container">
    <h1>Chat Application</h1>
    <transition-group name="message-list" tag="div" class="messages" @update="scrollToBottom">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', { 'my-message': message.sender === socketId }]"
      >
        <div class="avatar" v-html="message.avatar"></div>
        <div class="text">{{ message.text }}</div>
      </div>
    </transition-group>
    <div class="input-container">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message" />
      <button @click="sendMessage" class="send-button">
        <IconBrandTelegram :size="20"/>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.messages {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
.message {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.my-message {
  flex-direction: row-reverse;
}
.avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}
.my-message .avatar {
  margin-left: 10px;
  margin-right: 0;
}
.text {
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
}
.my-message .text {
  background-color: #147EAE;
  color: white;
  border: 1px solid #147EAE;
}
.message:not(.my-message) .text {
  background-color: white;
  color: #147EAE;
  border: 1px solid #147EAE;
}
.input-container {
  display: flex;
  align-items: center;
  border-top: 1px solid #ccc;
  padding: 10px;
}
input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}
.send-button {
  padding: 10px 15px;
  background-color: #147EAE;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
.send-button:hover {
  background-color: dark#147EAE;
}
.send-icon {
  font-weight: bold;
}

.message-list-enter-active, .message-list-leave-active {
  transition: all 0.5s;
}
.message-list-enter-from, .message-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
