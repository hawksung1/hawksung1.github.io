<template>
  <div id="app">
    <h1>{{ botName }}</h1>
    <p>{{ welcomeMessage }}</p>
    <div class="key-row">
      <input v-model="openaiKey" type="password" placeholder="Enter your OpenAI API key" />
      <button @click="saveKey">Save Key</button>
    </div>
    <div class="chat-window">
      <div v-for="(msg, idx) in messages" :key="idx" :class="msg.sender">
        <span v-if="msg.sender==='user'" class="user-label">You:</span>
        <span v-if="msg.sender==='bot'" class="bot-label">Bot:</span>
        <span>{{ msg.text }}</span>
      </div>
    </div>
    <div class="input-row">
      <input v-model="userMessage" @keyup.enter="sendMessage" placeholder="Type your message..." />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { openaiChat } from '../api/openai.js';
import { getWelcome, chat } from '../utils/chatbot.js';

export default {
  data() {
    return {
      botName: '',
      welcomeMessage: '',
      userMessage: '',
      messages: [],
      openaiKey: '',
      useOpenAI: false,
      openaiHistory: [
        { role: 'system', content: 'You are a helpful assistant.' }
      ]
    };
  },
  created() {
    const welcome = getWelcome();
    this.botName = welcome.bot_name;
    this.welcomeMessage = welcome.message;
    this.messages.push({ sender: 'bot', text: this.welcomeMessage });
  },
  methods: {
    saveKey() {
      this.useOpenAI = !!this.openaiKey.trim();
      if (this.useOpenAI) {
        this.messages.push({ sender: 'bot', text: 'OpenAI key saved. You can now chat with GPT.' });
      }
    },
    async sendMessage() {
      if (!this.userMessage.trim()) return;
      this.messages.push({ sender: 'user', text: this.userMessage });
      let response = '';
      if (this.useOpenAI) {
        this.openaiHistory.push({ role: 'user', content: this.userMessage });
        response = await openaiChat(this.openaiKey, this.openaiHistory);
        this.openaiHistory.push({ role: 'assistant', content: response });
      } else {
        response = chat(this.userMessage);
      }
      this.messages.push({ sender: 'bot', text: response });
      this.userMessage = '';
    },
    async openaiChat() {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: this.openaiHistory
          })
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response from OpenAI.';
      } catch (e) {
        return 'Error contacting OpenAI: ' + e.message;
      }
    }
  }
};
</script>

<style lang="scss" src="../styles/app.scss"></style>
