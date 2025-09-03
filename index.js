import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_KEY,
});

export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0].message.content || "");
}

export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Hi !!",
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
main();
