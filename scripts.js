document.addEventListener('DOMContentLoaded', () => {
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector("#send-btn");

  let userMessage = null;
  const inputInitHeight = chatInput.scrollHeight;

  const API_KEY = "AIzaSyBLZmAT1IiS8ZezYCKMYW3MoV8xZkSZAfk"; 
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    chatLi.innerHTML = className === "outgoing" 
      ? formatMessage(message)
      : `<span class="material-symbols-outlined">smart_toy</span>${formatMessage(message)}`;
    return chatLi;
  };

  const formatMessage = (message) => {
    message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return `<p>${message}</p>`;
  };

  const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: userMessage }] }] }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error?.message || "Unknown API error");
      
      messageElement.innerHTML = formatMessage(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.");
    } catch (error) {
      messageElement.classList.add("error");
      messageElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
    } finally {
      chatbox.scrollTo(0, chatbox.scrollHeight);
      saveChatToLocalStorage();
    }
  };

  const handleChat = () => {
    userMessage = chatInput.value.trim(); 
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    const outgoingChatLi = createChatLi(userMessage, "outgoing");
    chatbox.appendChild(outgoingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
      generateResponse(incomingChatLi);
    }, 600);

    saveChatToLocalStorage();
  };

  const saveChatToLocalStorage = () => {
    try {
      const chatMessages = [];
      const chatItems = chatbox.querySelectorAll(".chat");
      
      chatItems.forEach((chatItem) => {
        const message = chatItem.querySelector("p").innerHTML;
        const className = chatItem.classList.contains("outgoing") ? "outgoing" : "incoming";
        chatMessages.push({ message, className });
      });
      
      localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
    } catch (error) {
      console.error("Error saving chat to local storage:", error);
    }
  };

  const loadChatFromLocalStorage = () => {
    try {
      const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
      savedMessages.forEach(({ message, className }) => {
        chatbox.appendChild(createChatLi(message, className));
      });
      chatbox.scrollTo(0, chatbox.scrollHeight);
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  loadChatFromLocalStorage();

  chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      handleChat();
    }
  });

  sendChatBtn.addEventListener("click", handleChat);
  closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
  chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
