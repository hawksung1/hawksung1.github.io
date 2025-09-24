// src/chatbot.js
export const BOT_NAME = 'SimpleBot';
export const WELCOME_MESSAGE = 'Hello! How can I help you today?';

export function getWelcome() {
  return { bot_name: BOT_NAME, message: WELCOME_MESSAGE };
}

export function chat(userMessage) {
  // Simple echo logic
  return `${BOT_NAME}: You said '${userMessage}'`;
}