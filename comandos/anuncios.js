const { Message, Buttons, Client, MessageMedia, downloadMediaMessage, MessageType } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const messages = require('../lib/msg');
const pool = require('../lib/bd');
require('dotenv').config();
const path = require('path');
const fsExtra = require('fs-extra');

const numeroContato = process.env.NUMERO_CONTATO;
const numeroDono = process.env.NUMERO_DONO;

async function anuncios(sock, message, messageInfo) {
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




// COMANDO - ANÚNCIO 01
if (messageContent === '!anun1') {
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, {
                text: mensagens.grupo.negado,
                quoted: message
            });
            return;
        }

        const chatId = message.key.remoteJid;
        const [rows] = await pool.query('SELECT gc.img_publi1, gc.msg_publi1 FROM grupos AS g JOIN gruposContratados AS gc ON g.id = gc.grupo WHERE g.id_grupo = ?', [chatId]);
        const data = rows[0];

        if (!data) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Favor cadastrar um anuncio para usar esse comando!',
                quoted: message
            });
            return;
        }

        const { img_publi1, msg_publi1 } = data;

        if (img_publi1 && msg_publi1) {
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: path.join('/var/www/html/painel/public/uploads/anu1/' + img_publi1) },
                caption: msg_publi1,
                quoted: message
            });
        } else if (img_publi1) {
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: path.join('/var/www/html/painel/public/uploads/anu1/' + img_publi1) },
                quoted: message
            });
        } else if (msg_publi1) {
            await sock.sendMessage(message.key.remoteJid, {
                text: msg_publi1,
                quoted: message
            });
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Favor cadastrar um anuncio para usar esse comando!',
                quoted: message
            });
        }
    }


// COMANDO - ANÚNCIO 02
if (messageContent === '!anun2') {
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, {
                text: mensagens.grupo.negado,
                quoted: message
            });
            return;
        }

        const chatId = message.key.remoteJid;
        const [rows] = await pool.query('SELECT gc.img_publi2, gc.msg_publi2 FROM grupos AS g JOIN gruposContratados AS gc ON g.id = gc.grupo WHERE g.id_grupo = ?', [chatId]);
        const data = rows[0];

        if (!data) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Favor cadastrar um anuncio para usar esse comando!',
                quoted: message
            });
            return;
        }

        const { img_publi2, msg_publi2 } = data;

        if (img_publi2 && msg_publi2) {
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: path.join('/var/www/html/painel/public/uploads/anu2/' + img_publi2) },
                caption: msg_publi2,
                quoted: message
            });
        } else if (img_publi2) {
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: path.join('/var/www/html/painel/public/uploads/anu2/' + img_publi2) },
                quoted: message
            });
        } else if (msg_publi2) {
            await sock.sendMessage(message.key.remoteJid, {
                text: msg_publi2,
                quoted: message
            });
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Favor cadastrar um anuncio para usar esse comando!',
                quoted: message
            });
        }
    }


// COMANDO - ANÚNCIO 03
if (messageContent === '!anun3') {
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, {
                text: mensagens.grupo.negado,
                quoted: message
            });
            return;
        }

        const chatId = message.key.remoteJid;
        const [rows] = await pool.query('SELECT gc.img_publi3, gc.msg_publi3 FROM grupos AS g JOIN gruposContratados AS gc ON g.id = gc.grupo WHERE g.id_grupo = ?', [chatId]);
        const data = rows[0];

        if (!data) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Favor cadastrar um anuncio para usar esse comando!',
                quoted: message
            });
            return;
        }

        const { img_publi3, msg_publi3 } = data;

        if (img_publi3 && msg_publi3) {
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: path.join('/var/www/html/painel/public/uploads/anu3/' + img_publi3) },
                caption: msg_publi3,
                quoted: message
            });
        } else if (img_publi3) {
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: path.join('/var/www/html/painel/public/uploads/anu3/' + img_publi3) },
                quoted: message
            });
        } else if (msg_publi3) {
            await sock.sendMessage(message.key.remoteJid, {
                text: msg_publi3,
                quoted: message
            });
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Favor cadastrar um anuncio para usar esse comando!',
                quoted: message
            });
        }
    }





}

}

module.exports = { anuncios };