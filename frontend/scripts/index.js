// Referências aos elementos da interface
const createChatBtn = document.getElementById('createChatBtn')
const sendMessageBtn = document.getElementById('sendMessageBtn')
const chatNameInput = document.getElementById('chatName')
const chatSystemInput = document.getElementById('chatSystem')
const userInput = document.getElementById('userInput')
const messagesDiv = document.getElementById('messages')
const chatTitle = document.getElementById('chat-title')
const chatStatus = document.getElementById('chat-status')
const container = document.querySelector('.container')
const chatBox = document.querySelector('.chat-box')

let userId = null

// Função para inicializar o evento de criação do chat
function initializeChatCreation() {
  createChatBtn.addEventListener('click', handleCreateChat)
}

// Função para criar o chat
async function handleCreateChat() {
  const chatName = chatNameInput.value
  const chatSystem = chatSystemInput.value
  userId = generateRandomNumber()

  if (!chatName || !chatSystem) {
    alert('Please fill in all fields')
    return
  }

  try {
    const response = await createChatApiRequest(chatName, chatSystem)
    if (response.ok) {
      const data = await response.json()
      updateChatUI(data.chatName)
    } else {
      alert('Failed to create chat. Please try again.')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Error creating chat.')
  }
}

// Função auxiliar para fazer a requisição da criação do chat
async function createChatApiRequest(chatName, chatSystem) {
  return await fetch('https://5457-189-15-183-101.ngrok-free.app/chat/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, chatName, chatSystem }),
  })
}

// Função para atualizar a interface do chat após a criação
function updateChatUI(chatName) {
  chatTitle.textContent = chatName
  chatStatus.textContent = 'Online'
  container.style.display = 'none'
  chatBox.style.display = 'block'
}

// Função para inicializar o envio de mensagens
function initializeMessageSending() {
  sendMessageBtn.addEventListener('click', handleSendMessage)

  // Escuta o evento de tecla no campo de entrada de mensagem
  userInput.addEventListener('keypress', function (event) {
    // Verifica se a tecla pressionada é "Enter" (código 13)
    if (event.key === 'Enter') {
      event.preventDefault() // Previne o comportamento padrão de nova linha
      handleSendMessage() // Chama a função de enviar mensagem
    }
  })
}

// Função para enviar uma mensagem no chat
async function handleSendMessage() {
  const messageContent = userInput.value
  if (!messageContent) {
    alert('Please enter a message')
    return
  }

  try {
    appendMessage(messageContent, 'user-message')
    userInput.value = ''

    chatStatus.textContent = 'Escrevendo...'
    const response = await sendMessageApiRequest(messageContent)

    if (response.ok) {
      chatStatus.textContent = 'Online'
      const data = await response.json()
      appendMessage(data.response, 'assistant-message')
    } else {
      alert('Failed to send message. Please try again.')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Error sending message.')
  }
}

// Função auxiliar para fazer a requisição de envio de mensagem
async function sendMessageApiRequest(messageContent) {
  return await fetch(
    'https://5457-189-15-183-101.ngrok-free.app/chat/conversation',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, input: messageContent }),
    }
  )
}

// Função auxiliar para adicionar uma mensagem à interface do chat
function appendMessage(content, role) {
  const messageDiv = document.createElement('div')
  messageDiv.classList.add('message', role)
  messageDiv.textContent = content
  messagesDiv.appendChild(messageDiv)
  messagesDiv.scrollTop = messagesDiv.scrollHeight // Rolagem automática para a última mensagem
}

// Função auxiliar para gerar um número aleatório para identificar o usuário
function generateRandomNumber() {
  let randomNumber = ''

  for (let i = 0; i < 26; i++) {
    randomNumber += Math.floor(Math.random() * 10).toString() // Gera um dígito aleatório
  }

  return randomNumber
}

// Inicializa os eventos para criação de chat e envio de mensagem
initializeChatCreation()
initializeMessageSending()
