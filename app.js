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
const { equipe } = require('./comandos/equipe');
const { menu } = require('./lib/menu');
const { guia } = require('./lib/guia');
const { filtro, verificarGrupos } = require('./lib/filtro');
const path = require('path');
const fs = require('fs');
const pool = require('./lib/bd');
require('dotenv').config();
const EventEmitter = require('events');

const P = require('pino');

const numeroBot = process.env.NUMERO_BOT;

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
                message.message?.videoMessage?.caption || '',
            caption: message.message?.imageMessage?.caption || 
                    message.message?.videoMessage?.caption || '',
            quotedMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage,
            videoMessage: message.message?.videoMessage,
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

    // Aumenta o limite de listeners
    EventEmitter.defaultMaxListeners = 15;

    sock.ev.on('creds.update', saveCreds);

    // Gerenciamento de conexão
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

    // Gerenciamento de mensagens
    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages || !messages[0]) return;

        const message = messages[0];
        const messageInfo = getMessageType(message);

        try {
            console.log('Mensagem:', {
                tipo: Object.entries(messageInfo.types).find(([_, value]) => value)?.[0] || 'desconhecido',
                conteudo: messageInfo.content.text,
                grupo: messageInfo.metadata.isGroup
            });

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
                aniver(sock, message, messageInfo),
                equipe(sock, message, messageInfo),
                filtro(sock, message, messageInfo)
            ]);

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });

    // Gerenciamento de entrada no grupo
    sock.ev.on('group-participants.update', async (notification) => {
        if (notification.action !== 'add') return;

        const groupId = notification.id;
        const participantId = notification.participants[0];
        
        // Verificação do bot
        if (participantId === numeroBot) return;

        // Verificação da lista negra
        const fileName = groupId.replace('@g.us', '') + '.txt';
        const filePath = path.join(__dirname, 'media', 'listanegra', fileName);
        
        try {
            if (fs.existsSync(filePath)) {
                const existingNumbers = fs.readFileSync(filePath, 'utf8');
                if (existingNumbers.includes(participantId)) {
                    await sock.groupParticipantsUpdate(
                        groupId,
                        [participantId],
                        "remove"
                    );
                    await sock.sendMessage(groupId, {
                        text: `*USUÁRIO: ${participantId.split('@')[0]} BANIDO!*\nO número está na lista negra deste grupo.`
                    });
                    return;
                }
            }

            // Processamento da mensagem de boas-vindas
            const [rows] = await pool.query(
                'SELECT gc.img_bv, gc.msg_bv FROM grupos AS g ' +
                'JOIN gruposContratados AS gc ON g.id = gc.grupo ' +
                'WHERE g.id_grupo = ?', 
                [groupId]
            );

            const groupMetadata = await sock.groupMetadata(groupId);
            const groupName = groupMetadata.subject;
            const mention = `@${participantId.split('@')[0]}`;
            const result = rows[0];

// Verifica se não tem nem imagem nem texto configurados
if (!result || (!result.img_bv && !result.msg_bv)) {
    await sock.sendMessage(groupId, {
        text: `Olá, ${mention}\nSeja bem-vindo ao grupo:\n*${groupName}*`,
        mentions: [participantId]
    });
    return;
}

// Se tiver imagem configurada
let media;
if (result.img_bv) {
    const imagePath = `/var/www/html/painel/public/uploads/bv/${result.img_bv}`;
    if (fs.existsSync(imagePath)) {
        media = fs.readFileSync(imagePath);
    }
}

// Se tiver mensagem configurada
const formattedMessage = result.msg_bv ? 
    result.msg_bv.replace('{p1}', mention).replace('{p2}', groupName) : 
    '';

// Envia a mensagem com base nas configurações existentes
if (media && formattedMessage) {
    // Se tiver imagem e texto
    await sock.sendMessage(groupId, {
        image: media,
        caption: formattedMessage,
        mentions: [participantId]
    });
} else if (media) {
    // Se tiver só imagem
    await sock.sendMessage(groupId, {
        image: media,
        caption: formattedMessage || `Olá, ${mention}\nSeja bem-vindo ao grupo:\n*${groupName}*`,
        mentions: [participantId]
    });
} else if (formattedMessage) {
    // Se tiver só texto
    await sock.sendMessage(groupId, {
        text: formattedMessage,
        mentions: [participantId]
    });
}

        } catch (error) {
            console.error('Erro ao processar entrada no grupo:', error);
        }
    });

    return sock;
}

connectToWhatsApp();
