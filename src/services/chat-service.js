import dotenv from 'dotenv'
dotenv.config()

import { ChatOpenAI } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'

// Objeto em memória para armazenar os dados de chat de cada usuário
const chatData = {}

// Função para criar e configurar um novo chat para um usuário
export async function createChatService(userId, chatName, chatSystem) {
  // Se o chat do usuário ainda não existir, cria um novo
  if (!chatData[userId]) {
    chatData[userId] = {
      chatName, // Nome do chat
      chatSystem, // Configuração do sistema (instruções para o assistente)
      messages: [], // Array vazio para armazenar as mensagens do chat
    }
  } else {
    // Se já existir, atualiza o nome do chat e o sistema, se necessário
    chatData[userId].chatName = chatName
    chatData[userId].chatSystem = chatSystem
  }

  // Retorna os dados do chat criado ou atualizado
  return {
    userId,
    chatName,
    chatSystem,
  }
}

// Configura o modelo OpenAI (GPT-4o-mini) com os parâmetros desejados
const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0, // Controla a criatividade (quanto menor, mais determinístico)
})

// Função principal para interagir com o assistente
export async function chatService(userId, input) {
  // Verifica se o usuário existe na memória
  if (!chatData[userId]) {
    throw new Error(
      'Usuário não encontrado. Por favor, crie um chat antes de iniciar a conversa.'
    )
  }

  // Obtém o sistema salvo para o usuário, ou usa uma mensagem padrão
  const system =
    chatData[userId]?.chatSystem ||
    'Você é um assistente com o objetivo de ajudar o usuário.'

  // Armazena históricos de mensagens por sessão
  const messageHistories = {}

  // Cria o template de prompt para o modelo com as instruções do sistema e o histórico de chat
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', system], // Mensagem inicial do sistema para configurar o assistente
    ['placeholder', '{chat_history}'], // Local para inserir o histórico de mensagens
    ['human', '{input}'], // Mensagem atual do usuário
  ])

  // Conecta o modelo ao prompt
  const chain = prompt.pipe(model)

  // Configura a função para lidar com o histórico de mensagens
  const withMessageHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async (sessionId) => {
      // Inicializa o histórico de mensagens, se ainda não existir
      if (!messageHistories[sessionId]) {
        const history = new InMemoryChatMessageHistory()

        // Carrega o histórico de mensagens da memória (se existir) para a sessão atual
        if (chatData[sessionId]?.messages) {
          chatData[sessionId].messages.forEach((msg) => {
            history.addMessage(msg) // Adiciona cada mensagem ao histórico
          })
        }

        // Armazena o histórico na sessão
        messageHistories[sessionId] = history
      }

      return messageHistories[sessionId] // Retorna o histórico de mensagens
    },
    inputMessagesKey: 'input', // A chave para a mensagem atual do usuário
    historyMessagesKey: 'chat_history', // A chave para o histórico de mensagens
  })

  // Configura o objeto para incluir o sessionId do usuário
  const config = {
    configurable: {
      sessionId: userId, // Identifica o usuário pela sessão
    },
  }

  // Invoca o modelo de conversação com o input do usuário e o histórico de chat
  const response = await withMessageHistory.invoke(
    {
      input, // Mensagem enviada pelo usuário
    },
    config
  )

  // Armazena a nova mensagem do usuário e a resposta do assistente na memória
  if (chatData[userId]) {
    chatData[userId].messages.push({ role: 'user', content: input }) // Adiciona a mensagem do usuário
    chatData[userId].messages.push({
      role: 'assistant',
      content: response.content, // Adiciona a resposta do assistente
    })
  }

  // Retorna a resposta gerada pelo assistente para o usuário
  return {
    userId, // Retorna o ID do usuário
    response: response.content, // Retorna o conteúdo da resposta
  }
}
