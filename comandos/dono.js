const { Message, Buttons, Client, MessageMedia, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono } = require('../lib/privilegios');
const pool = require('../lib/bd');
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');

async function dono(sock, message, messageInfo) {
    // Usando a nova estrutura messageInfo para obter conteúdo e tipo da mensagem
    const messageContent = messageInfo.content.text;
    
    // Verifica se é mensagem de grupo usando os metadados
    const isGroup = messageInfo.metadata.isGroup;

    // Verifica se a mensagem não é do bot e é nova
    if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
        // Função auxiliar para mensagens aleatórias permanece a mesma
        function getRandomMessage(array) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }




if (messageContent === '!grupos') {
    try {
        // Obtém todos os chats
        const chats = await sock.groupFetchAllParticipating();
        let resposta = '';

        // Itera sobre cada grupo
        for (const [id, chat] of Object.entries(chats)) {
            const participantes = chat.participants;
            if (participantes) {
                const qtdParticipantes = participantes.length;
                const qtdAdmins = participantes.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;

                resposta += `🏷️ *GRUPO:* ${chat.subject}\n`;
                resposta += `📱 *ID:* ${id}\n`;
                resposta += `👥 *PARTICIPANTES:* ${qtdParticipantes}\n`;
                resposta += `👑 *ADMINISTRADORES:* ${qtdAdmins}\n`;
                resposta += `▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n`;
            }
        }

        if (resposta) {
            await sock.sendMessage(message.key.remoteJid, {
                text: resposta.trim()
            });
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Nenhum grupo encontrado.'
            });
        }

    } catch (error) {
        console.error('Erro ao listar grupos:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: '❌ Ocorreu um erro ao listar os grupos.'
        });
    }
}















    }
}

module.exports = { dono };