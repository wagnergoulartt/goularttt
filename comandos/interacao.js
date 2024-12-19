const { Message, Buttons, Client } = require('@whiskeysockets/baileys');
const messages = require('../lib/msg');
require('dotenv').config();

async function interacao(sock, message, messageInfo) {
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
// COMANDO - BOM DIA
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('bom dia') && isGroup) {
            const resposta = getRandomMessage(messages.BomDia);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - BOA TARDE
/////////////////////////////////////////////////////////////////////////////////////

        // BOA TARDE
        if (messageContent.toLowerCase().includes('boa tarde') && isGroup) {
            const resposta = getRandomMessage(messages.BoaTarde);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - BOA NOITE
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('boa noite') && isGroup) {
            const resposta = getRandomMessage(messages.BoaNoite);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - LOLA
/////////////////////////////////////////////////////////////////////////////////////

const regexLola = /^(?!!lola).*\blola\b(?!\s+te\s+amo|\s+linda|\s+cade\s+voce|\s+gostosa)/i;

if (regexLola.test(messageContent.toLowerCase())) {
    const resposta = getRandomMessage(messages.Lola);
    await sock.sendMessage(
        message.key.remoteJid,
        { text: resposta },
        { quoted: message }
    );
}

function getRandomMessage(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - LOLA TE AMO
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('lola te amo') && isGroup) {
            const resposta = getRandomMessage(messages.LolaTeAmo);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - LOLA LINDA
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('lola linda') && isGroup) {
            const resposta = getRandomMessage(messages.LolaLinda);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - LOLA GOSTOSA
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('lola gostosa') && isGroup) {
            const resposta = getRandomMessage(messages.LolaGostosa);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - OI
/////////////////////////////////////////////////////////////////////////////////////

const regexOi = /\boi\b|\boii\b|\boiii\b|\boie\b|\boiee\b|\boieee\b/i;
        
        // Verifica se é mensagem de grupo e se corresponde ao regex
        if (isGroup && messageContent && regexOi.test(messageContent.toLowerCase())) {
            // Pega uma resposta aleatória usando messages.Oi
            const resposta = getRandomMessage(messages.Oi);
            
            // Envia a resposta para o grupo
            await sock.sendMessage(messageInfo.metadata.from, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
        }
    

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - PIX
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('pix') && isGroup) {
            const resposta = getRandomMessage(messages.Pix);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - GOLPE
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('golpe') && isGroup) {
            const resposta = getRandomMessage(messages.Golpe);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - GOLPISTA
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('golpista') && isGroup) {
            const resposta = getRandomMessage(messages.Golpista);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - ZOINHO
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('👀') && isGroup) {
            const resposta = getRandomMessage(messages.Zoinho);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - VIRANDO ZOINHO
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent.toLowerCase().includes('🙄') && isGroup) {
            const resposta = getRandomMessage(messages.VirandoZoinho);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - AÇAI
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('acai')) {
    const resposta = getRandomMessage(messages.Acai);
    await sock.sendMessage(message.key.remoteJid, { 
        text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
    return;
}



    }
}

module.exports = { interacao };