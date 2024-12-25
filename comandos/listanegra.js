const { Message, Buttons, Client, MessageMedia, downloadMediaMessage, MessageType } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const pool = require('../lib/bd');
require('dotenv').config();
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');

const numeroContato = process.env.NUMERO_CONTATO;
const numeroDono = process.env.NUMERO_DONO;

async function listanegra(sock, message, messageInfo) {
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

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MOSTRA A LISTA NEGRA
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!listanegra') {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {

        // Define o nome do arquivo baseado no ID do grupo
        const groupId = message.key.remoteJid;
        const fileName = `${groupId.replace('@g.us', '')}.txt`;
        const filePath = path.join(__dirname, '..', 'media', 'listanegra', fileName);

        let response = '*LISTA NEGRA DO GRUPO:*\n\n';

        // Verifica se o arquivo existe e lê seu conteúdo
        if (fs.existsSync(filePath)) {
            const listanegraContent = fs.readFileSync(filePath, 'utf8');
            
            if (listanegraContent.trim() !== '') {
                // Remove os sufixos @s.whatsapp.net
                const formattedContent = listanegraContent
                    .split('\n')
                    .map(number => number.replace('@s.whatsapp.net', ''))
                    .join('\n');
                
                response += formattedContent;
            } else {
                response += 'Nenhum número na lista negra.';
            }
        } else {
            response += 'Nenhum número na lista negra.';
        }

        // Envia a resposta
        await sock.sendMessage(
            message.key.remoteJid,
            { 
                text: response,
                quoted: message 
            }
        );

    } catch (error) {
        console.error('Erro ao executar comando !listanegra:', error);
        await sock.sendMessage(
            message.key.remoteJid,
            { 
                text: 'Ocorreu um erro ao executar o comando.',
                quoted: message 
            }
        );
    }
}
}




if (messageContent.startsWith('!addln ')) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {

        const chatId = message.key.remoteJid;
        const numberToAdd = messageContent.split(' ')[1];

        if (!numberToAdd) {
            await sock.sendMessage(chatId, {
                text: 'Por favor, forneça um número para adicionar à lista negra.',
                quoted: message
            });
            return;
        }

        // Remove o '@' do início do número, se existir
        const cleanNumber = numberToAdd.startsWith('@') ? numberToAdd.substring(1) : numberToAdd;

        // Mantém o sufixo '@s.whatsapp.net' no número
        const sanitizedNumber = cleanNumber.includes('@s.whatsapp.net') 
            ? cleanNumber 
            : cleanNumber + '@s.whatsapp.net';

        // Define o nome do arquivo baseado no ID do chat (grupo)
        const fileName = chatId.replace('@g.us', '') + '.txt';
        const filePath = path.join(__dirname, '..', 'media', 'listanegra', fileName);

        // Cria o diretório se ele não existir
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Lê o conteúdo atual do arquivo, se existir
        let existingNumbers = '';
        if (fs.existsSync(filePath)) {
            existingNumbers = fs.readFileSync(filePath, 'utf8');
        }

        // Verifica se o número já está no arquivo
        if (!existingNumbers.includes(sanitizedNumber)) {
            // Adiciona uma nova linha no início se o arquivo não estiver vazio e não terminar com nova linha
            const prefix = existingNumbers && !existingNumbers.endsWith('\n') ? '\n' : '';
            
            // Adiciona o número ao arquivo
            fs.appendFileSync(filePath, `${prefix}${sanitizedNumber}\n`);
            
            await sock.sendMessage(chatId, {
                text: 'Número adicionado à lista negra.',
                quoted: message
            });
        } else {
            await sock.sendMessage(chatId, {
                text: 'Este número já está na lista negra.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao adicionar número à lista negra:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao adicionar o número à lista negra.',
            quoted: message
        });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - REMOVE DA LISTA NEGRA
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!rln ')) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {
        // Verifica se é grupo e se é admin
        if (!await verificarGrupo(sock, message, messageInfo) || 
            !await verificarAdmin(sock, message, messageInfo)) {
            return;
        }

        const chatId = message.key.remoteJid;
        const numberToRemove = messageContent.split(' ')[1];

        if (!numberToRemove) {
            await sock.sendMessage(chatId, {
                text: 'Por favor, forneça um número para remover da lista negra.',
                quoted: message
            });
            return;
        }

        // Adiciona o sufixo '@s.whatsapp.net' ao número
        const sanitizedNumber = numberToRemove + '@s.whatsapp.net';

        // Define o nome do arquivo baseado no ID do grupo
        const fileName = chatId.replace('@g.us', '') + '.txt';
        const filePath = path.join(__dirname, '..', 'media', 'listanegra', fileName);

        // Verifica se o diretório existe
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            await sock.sendMessage(chatId, {
                text: 'O diretório da lista negra não existe.',
                quoted: message
            });
            return;
        }

        // Verifica se o arquivo existe e remove o número
        if (fs.existsSync(filePath)) {
            let existingNumbers = fs.readFileSync(filePath, 'utf8');
            
            if (existingNumbers.includes(sanitizedNumber)) {
                // Remove o número do arquivo
                let updatedNumbers = existingNumbers
                    .split('\n')
                    .filter(number => number.trim() !== sanitizedNumber.trim())
                    .join('\n');
                
                fs.writeFileSync(filePath, updatedNumbers);
                
                await sock.sendMessage(chatId, {
                    text: 'Número removido da lista negra.',
                    quoted: message
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: 'Este número não está na lista negra.',
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: 'O arquivo da lista negra não existe.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao remover número da lista negra:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao remover o número da lista negra.',
            quoted: message
        });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - BANI E COLOCA NA LISTA NEGRA
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!banln')) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {

        const chatId = message.key.remoteJid;
        const mentions = messageInfo.content.mentionedJids;

        // Verifica se a mensagem menciona usuários
        if (!mentions || mentions.length === 0) {
            await sock.sendMessage(chatId, {
                text: 'Por favor, mencione o usuário que você deseja adicionar à lista negra e banir.',
                quoted: message
            });
            return;
        }

        // Converte o formato do número de @s.whatsapp.net para @s.whatsapp.net (mantém o padrão)
        const mentionedId = mentions[0];

        // Primeiro, bane o usuário do grupo
        try {
            await sock.groupParticipantsUpdate(
                chatId,
                [mentions[0]], // Usa o formato original para banir
                "remove"
            );

            // Define o nome do arquivo baseado no ID do chat (grupo)
            const fileName = chatId.replace('@g.us', '') + '.txt';
            const filePath = path.join(__dirname, '..', 'media', 'listanegra', fileName);

            // Cria o diretório se ele não existir
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Lê o conteúdo atual do arquivo, se existir
            let existingNumbers = '';
            if (fs.existsSync(filePath)) {
                existingNumbers = fs.readFileSync(filePath, 'utf8');
            }

            // Verifica se o ID já está no arquivo
            if (!existingNumbers.includes(mentionedId)) {
                // Adiciona o ID ao arquivo com o formato correto (@s.whatsapp.net)
                fs.appendFileSync(filePath, mentionedId + '\n');
            }

            // Envia uma mensagem única após banir e adicionar à lista negra
            await sock.sendMessage(chatId, {
                text: 'Usuário banido e adicionado à lista negra do grupo.',
                quoted: message
            });

        } catch (error) {
            console.error('Erro ao banir usuário:', error);
            await sock.sendMessage(chatId, {
                text: 'Houve um erro ao tentar banir o usuário.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao processar comando !banln:', error);
    }
}
}





}
}
module.exports = { listanegra };