// src/api/openai.js
export async function openaiChat(openaiKey, history) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: history
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response from OpenAI.';
  } catch (e) {
    return 'Error contacting OpenAI: ' + e.message;
  }
}
