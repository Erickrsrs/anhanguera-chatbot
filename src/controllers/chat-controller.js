import { chatService, createChatService } from '../services/chat-service.js'

// Controlador para criar um novo chat
export const chatCreateController = async (req, res) => {
  // Extrai as variáveis do corpo da requisição
  const { userId, chatName, chatSystem } = req.body

  // Valida se todos os campos necessários foram fornecidos
  if (!userId || !chatName || !chatSystem) {
    return res.status(400).send('userId, chatName, and chatSystem are required')
  }

  try {
    // Cria o serviço de chat para o usuário e retorna os dados
    const userChatData = await createChatService(userId, chatName, chatSystem)
    res.status(200).json(userChatData) // Envia os dados do chat criado como JSON
  } catch (error) {
    // Em caso de erro inesperado, envia uma resposta de erro genérica
    console.error('Error creating chat:', error)
    res.status(500).send('An error occurred while creating the chat.')
  }
}

// Controlador para gerenciar a conversação no chat
export const chatConversationController = async (req, res) => {
  // Extrai as variáveis do corpo da requisição
  const { userId, input } = req.body

  // Valida se os campos obrigatórios foram fornecidos
  if (!userId || !input) {
    return res.status(400).send('userId and input are required')
  }

  try {
    // Chama o serviço de conversação passando o userId e a entrada do usuário
    const response = await chatService(userId, input)
    res.status(200).json(response) // Envia a resposta da conversação como JSON
  } catch (error) {
    // Melhora o tratamento de erro, fornecendo respostas mais descritivas
    console.error('Error during conversation:', error)

    if (error.message.includes('Usuário não encontrado')) {
      // Trata erro específico de usuário não encontrado
      return res.status(404).send('User not found. Please create a chat first.')
    }

    // Caso contrário, envia um erro genérico
    res.status(500).send('An error occurred during the conversation.')
  }
}
