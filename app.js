const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { grupos } = require('./comandos/grupos');
const { interacao } = require('./comandos/interacao');
const { diversao } = require('./comandos/diversao');
const { utilidades } = require('./comandos/utilidades');
const { anuncios } = require('./comandos/anuncios');
const { dono } = require('./comandos/dono');
const { listanegra } = require('./comandos/listanegra');
const { aniver } = require('./comandos/aniver');
const { menu } = require('./lib/menu');
const { guia } = require('./lib/guia');

const P = require('pino');

// Função para identificar o tipo de mensagem
function getMessageType(message) {
    return {
        types: {
            text: !!message.message?.conversation || !!message.message?.extendedTextMessage?.text,
            image: !!message.message?.imageMessage,
            video: !!message.message?.videoMessage,
            audio: !!message.message?.audioMessage,
            document: !!message.message?.documentMessage,
            sticker: !!message.message?.stickerMessage,
            location: !!message.message?.locationMessage,
            contact: !!message.message?.contactMessage,
            poll: !!message.message?.pollCreationMessage,
            reaction: !!message.message?.reactionMessage
        },

        content: {
    text: message.message?.conversation || 
          message.message?.extendedTextMessage?.text || 
          message.message?.imageMessage?.caption ||
          message.message?.videoMessage?.caption || '', // Adiciona caption do vídeo aqui
    caption: message.message?.imageMessage?.caption || 
            message.message?.videoMessage?.caption || '',
    quotedMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage,
    videoMessage: message.message?.videoMessage, // Adiciona esta linha
    mentionedJids: message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
},

        metadata: {
            from: message.key.remoteJid,
            fromMe: message.key.fromMe,
            isGroup: message.key.remoteJid.endsWith('@g.us'),
            timestamp: message.messageTimestamp,
            messageId: message.key.id
        }
    };
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '22.04.4'],
    syncFullHistory: false,
    msgRetryCounterMap: {},
    markOnlineOnConnect: false,
    defaultQueryTimeoutMs: 60000,
    patchMessageBeforeSending: (message) => {
        return message;
    }
});

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) && 
                                  lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('LOLA CONECTADA!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages || !messages[0]) return;

        const message = messages[0];
        const messageInfo = getMessageType(message);

        try {
            // Log para debug
            console.log('Mensagem:', {
                tipo: Object.entries(messageInfo.types).find(([_, value]) => value)?.[0] || 'desconhecido',
                conteudo: messageInfo.content.text,
                grupo: messageInfo.metadata.isGroup
            });

            // Processar comandos
            await Promise.all([
                grupos(sock, message, messageInfo),
                interacao(sock, message, messageInfo),
                diversao(sock, message, messageInfo),
                menu(sock, message, messageInfo),
                guia(sock, message, messageInfo),
                utilidades(sock, message, messageInfo),
                anuncios(sock, message, messageInfo),
                dono(sock, message, messageInfo),
                listanegra(sock, message, messageInfo),
                aniver(sock, message, messageInfo)
            ]);

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });
}

connectToWhatsApp();