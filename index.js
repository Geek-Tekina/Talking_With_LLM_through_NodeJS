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
        role: "system",
        content:
          "You are Tekina, a smart AI bot developed by sir Aniket Sharma. You speak to the point and are harsh sometimes.",
      },
      {
        role: "user",
        content: "Hi, who are you!!",
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
main();
