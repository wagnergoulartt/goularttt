const messages = require('../lib/msg');
require('dotenv').config();
const nomeDono = process.env.NOME_DONO;
const numeroDono = process.env.NUMERO_DONO;
const nomeBot = process.env.NOME_BOT;
const numeroBot = process.env.NUMERO_BOT;

/////////////////////////////////////////////////////////////////////////////////////    
// FUNÇÃO - VERIFICAR GRUPO
/////////////////////////////////////////////////////////////////////////////////////

async function verificarGrupo(sock, message, messageInfo) {
    try {
        // Verifica se é uma mensagem de grupo usando messageInfo
        if (!messageInfo.metadata.isGroup) {
            return false; // Se não for grupo, apenas retorna false sem enviar mensagem
        }
        return true; // Se for grupo, retorna true para continuar execução
    } catch (error) {
        console.error('Erro ao verificar grupo:', error);
        return false;
    }
}

// MODO DE USAR: if (await verificarGrupo(sock, message, messageInfo)) {

/////////////////////////////////////////////////////////////////////////////////////    
// FUNÇÃO - VERIFICAR ADMIN
/////////////////////////////////////////////////////////////////////////////////////

async function verificarAdmin(sock, message, messageInfo) {
    try {
        // Verifica se é uma mensagem de grupo usando messageInfo
        if (!messageInfo.metadata.isGroup) {
            return false;
        }

        // ID do autor da mensagem
        const sender = message.key.participant || message.key.remoteJid;
        
        // Primeiro verifica se é o dono (usando o número completo para comparação)
        if (sender.includes(numeroDono)) {
            return true; // Se for o dono, permite executar o comando
        }
        
        // Se não for o dono, verifica se é admin
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        
        // Verifica se o sender é admin
        const isAdmin = groupMetadata.participants.find(
            participant => participant.id === sender && (participant.admin === 'admin' || participant.admin === 'superadmin')
        );

        if (!isAdmin) {
            await sock.sendMessage(message.key.remoteJid, {
                text: messages.VerAdmin,
                quoted: message
            });
            return false;
        }

        return true;

    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
    }
}

// MODO DE USAR: if (await verificarAdmin(sock, message, messageInfo)) {

/////////////////////////////////////////////////////////////////////////////////////    
// FUNÇÃO - VERIFICAR ADMIN BOT
/////////////////////////////////////////////////////////////////////////////////////

async function verificarBotAdmin(sock, message, messageInfo) {
    try {
        // Verifica se é grupo primeiro
        if (!messageInfo.metadata.isGroup) {
            return false;
        }

        // Obtém os metadados do grupo
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        
        // Verifica se o bot é admin usando o numeroBot
        const botAdmin = groupMetadata.participants.find(
            participant => participant.id.includes(numeroBot) && (participant.admin === 'admin' || participant.admin === 'superadmin')
        );

        if (!botAdmin) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'O bot precisa ser admin para executar este comando.',
                quoted: message
            });
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao verificar bot admin:', error);
        return false;
    }
}

// MODO DE USAR: if (await verificarBotAdmin(sock, message, messageInfo)) {

/////////////////////////////////////////////////////////////////////////////////////    
// FUNÇÃO - VERIFICAR DONO
/////////////////////////////////////////////////////////////////////////////////////

async function verificarDono(sock, message, messageInfo) {
    try {
        // ID do autor da mensagem
        const sender = message.key.participant || message.key.remoteJid;
        
        // Verifica se o sender é o dono
        if (sender !== numeroDono) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Este comando só pode ser usado pelo dono do bot!',
                quoted: message
            });
            return false;
        }

        return true;

    } catch (error) {
        console.error('Erro ao verificar dono:', error);
        return false;
    }
}

// MODO DE USAR:  if (await verificarDono(sock, message, messageInfo)) {


module.exports = { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin };