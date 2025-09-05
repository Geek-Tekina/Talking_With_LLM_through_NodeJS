import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import readline from "node:readline/promises";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_KEY });

async function main() {
  // creating an interface to take i/o and o/p from terminal
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const messages = [
    {
      role: "system",
      content: `You are a smart assitant who answers the asked questions.
                You have access to following tools :
                1. webSearch({query}) // search the latest and realtime data on the internet
      `,
    },
    // {
    //   role: "user",
    //   content: "When was the verdict of India - Pakistan war in 2025 ? ",
    // },
  ];

  while (true) {
    const question = await rl.question("You : ");

    // we need to have a condition to break this loop, let's Say user when types Stop
    if (question === "Stop") break;

    // else push the query/question in messages
    messages.push({
      role: "user",
      content: question,
    });

    while (true) {
      const completions = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: messages,
        tools: [
          {
            type: "function",
            function: {
              name: "webSearch",
              description:
                "Search the latest and realtime data on the internet.",
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

      // console.log(JSON.stringify(completions.choices[0].message, null, 2));

      //LLM does not excecutes, it returns us a message, telling which tool we have to excecute programitaclly. And then we send the output of that tool to LLm, then at last LLM sends us the final output.

      // we will push the message from assistant to maintain history
      messages.push(completions.choices[0].message);

      //we will check if any tool is called

      const toolCalls = completions.choices[0].message.tool_calls;
      if (!toolCalls) {
        // this means we have our final answer from LLM
        console.log(`Assitant : ${completions.choices[0].message.content}`);

        // as there will be no tool call, we can break from this while loop
        // return;
        break;
      }

      // if excecution comes here that means, any tool is been called. As tool_calls is an array, we have to loop over each, exceute the tool, and again send it's output to LLM as role = "tool".

      for (const tool of toolCalls) {
        // console.log(`tool : ${tool}`);
        const functionName = tool.function.name;
        const functionParams = tool.function.arguments;

        if (functionName == "webSearch") {
          const toolResponse = await webSearch(JSON.parse(functionParams));
          // console.log(`Tool Response : ${toolResponse}`);

          // we will also pass the toolresponse to messages so LLM has complete context about the convo
          messages.push({
            tool_call_id: tool.id,
            role: "tool",
            name: functionName,
            content: toolResponse,
          });
        }
      }
    }
  }

  // const completions2 = await groq.chat.completions.create({
  //   model: "llama-3.3-70b-versatile",
  //   temperature: 0,
  //   messages: messages,
  //   tools: [
  //     {
  //       type: "function",
  //       function: {
  //         name: "webSearch",
  //         description: "Search the latest and realtime data on the internet.",
  //         parameters: {
  //           type: "object",
  //           properties: {
  //             query: {
  //               type: "string",
  //               description: "The search query to perform search on.",
  //             },
  //           },
  //           required: ["query"],
  //         },
  //       },
  //     },
  //   ],
  //   tool_choice: "auto",
  // });

  // console.log(JSON.stringify(completions2.choices[0].message, null, 2));

  rl.close(); // this is done to close the terminal
}

async function webSearch({ query }) {
  console.log("Searching web through webSearch tool ...");
  // here we will be using Tavily to search for query on internet
  const response = await tvly.search(query);
  // console.log("Tavily Response ->>>>>", response);

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");
  // return "It was launched in 2024, September.";

  return finalResult;
}

main();
