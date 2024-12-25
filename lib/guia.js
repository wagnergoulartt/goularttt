const { Message, Buttons, Client, MessageMedia, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono } = require('../lib/privilegios');

async function guia(sock, message, messageInfo) {
    // Verifica se não é mensagem do bot
    if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
        const messageContent = messageInfo.content.text;

        // Verifica se a mensagem é um pedido de guia
        if (messageContent.startsWith('!guia ')) {
                const comando = messageContent.split(' ')[1]; // Pega o comando após !guia

                // Dicionário com as explicações dos comandos
                const guiaComandos = {
                    // COMANDOS DE ADMINISTRAÇÃO
                    '!titulo=': 'Altera o nome do grupo.\n*Ex:* !titulo=Nome Novo',
                    '!fechargrupo': '→ Fecha o grupo, permitindo apenas administradores conversar.\n→ *Ex:* !fechargrupo',
                    '!teste': '→ *MODO DE USO:*\n!teste\n\n*DESCRIÇÃO:*\nEssa é uma descrição de teste para a verificação do comando',
                    // ... (resto dos comandos mantidos iguais)

                    // ANÚNCIOS
                    '!anun1': 'Envia um anúncio cadastrado no painel do bot.\n*Ex:* !an1',
                    // ... (resto dos comandos mantidos iguais)

                    // ANIVER
                    '!addaniver': 'Executa o comando seguindo de @pessoa Nome DD-MM.\n*Ex:* !addaniver + @pessoa + nome + 12-12',
                    // ... (resto dos comandos mantidos iguais)

                    // LISTA NEGRA
                    '!addln': 'Adiciona na lista negra pelo número.\n*Ex:*  !addln + 555184112140\n*Obs.:* Não usar o 9 antes do número',
                    // ... (resto dos comandos mantidos iguais)

                    // COMANDOS DE DIVERSÃO
                    '!nivelgolpe': 'Calcula o nível de golpe do membro.\n*Ex: !nivelgolpe + @pessoa\n*Obs.:* O @pessoa significa, mencionar a pessoa',
                    // ... (resto dos comandos mantidos iguais)

                    // SINCERÃO
                    '!sincerao': 'Envia uma mensagem aleatória, mencionando um membro da brincadeira.\n*Ex:* !sincerao\n*Obs.:* So vai fazer a pergunta para as pessoas que estão na brincadeira.',
                    // ... (resto dos comandos mantidos iguais)

                    // UTILIDADES
                    '!calcular': 'Calcula qualquer cálculo matemático.\n*Ex:* !calcular 1+1, 1-1, 1x1 e 1%1*',
                    // ... (resto dos comandos mantidos iguais)

                    // DONO
                    '!btodos': 'Bani todos os membros do grupo, exeto admin.\n*Ex:* !btodos',
                    // ... (resto dos comandos mantidos iguais)
                };

                // Verifica se o comando solicitado está no dicionário de comandos
                if (guiaComandos[comando]) {
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: guiaComandos[comando],
                        quoted: message 
                    });
                } else {
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: 'Desculpe, não tenho informações sobre esse comando.',
                        quoted: message 
                    });
                }
            }
        }
    }


module.exports = { guia };