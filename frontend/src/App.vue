<template>
  <div id="app">
    <h1>{{ botName }}</h1>
    <p>{{ welcomeMessage }}</p>
    <input v-model="userMessage" placeholder="Type your message..." />
    <button @click="sendMessage">Send</button>
    <div v-if="chatResponse">
      <p><strong>Bot:</strong> {{ chatResponse }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      botName: '',
      welcomeMessage: '',
      userMessage: '',
      chatResponse: ''
    };
  },
  created() {
    axios.get('/api/welcome').then(res => {
      this.botName = res.data.bot_name;
      this.welcomeMessage = res.data.message;
    });
  },
  methods: {
    sendMessage() {
      axios.post('/api/chat', { message: this.userMessage })
        .then(res => {
          this.chatResponse = res.data.response;
        });
    }
  }
};
</script>

<style>
#app {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}
input {
  width: 70%;
  padding: 8px;
  margin-right: 8px;
}
button {
  padding: 8px 16px;
}
</style>

// Moved to frontend/
