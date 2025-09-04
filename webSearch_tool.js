import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

async function main() {
  const messages = [
    {
      role: "system",
      content: `You are a smart assitant who answers the asked questions.
                You have access to following tools :
                1. webSearch({query}) // search the latest and realtime data on the internet
      `,
    },
    {
      role: "user",
      content: "When was Iphone 16 launched ? ",
    },
  ];
  const completions = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: messages,
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description: "Search the latest and realtime data on the internet.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on.",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  // console.log(completions.choices[0].message);
  // Note : When a tool is called we do not get content in message, be get tool_calls. Meaning if tool_calls is not present , then we have final answer from the LLM.
  console.log(JSON.stringify(completions.choices[0].message, null, 2));
}

async function webSearch() {
  // here we will be using Tavily to search for query on internet

  return "It was launced in 2024, September.";
}

main();
