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

// Define caminhos para o arquivo de permissões
const basePath = path.resolve(__dirname, '..', 'media', 'permissao');
const fileName = 'gppermissoes.txt';
const filePath = path.join(basePath, fileName);

async function verificarFiltro(sock) {
    try {
        // Verifica se o arquivo de permissões existe
        if (!fs.existsSync(filePath)) {
            return;
        }
        
        const status = fs.readFileSync(filePath, { encoding: 'utf-8' });
        if (status === 'restrição:desativada') {
            return;
        }

        // Verifica todos os grupos ao iniciar
        const groups = await sock.groupFetchAllParticipating();
        
        for (const [groupId, groupInfo] of Object.entries(groups)) {
            try {
                const [results] = await pool.query('SELECT * FROM grupos WHERE id_grupo = ?', [groupId]);
                
                if (results.length === 0) {
                    await sock.sendMessage(groupId, {
                        text: 'Este grupo não está autorizado a usar este bot no momento.\nPara obter permissão ou esclarecer\nqualquer dúvida, entre em contato\ncom o desenvolvedor diretamente.\n\n*GOULART - N7 BOTS*\nContato: 5551984112140'
                    });

                    setTimeout(async () => {
                        await sock.groupLeave(groupId);
                    }, 3000);
                }
            } catch (error) {
                console.error('Erro ao verificar grupo:', error);
            }
        }
    } catch (error) {
        console.error('Erro na verificação de grupos:', error);
    }
}

async function filtro(sock, message, messageInfo) {
    // Verifica se é um evento de grupo
    if (messageInfo && messageInfo.type === 'group-participants.update') {
        // Verifica se é uma adição e se o bot está entre os participantes adicionados
        if (messageInfo.participants && messageInfo.participants.includes(sock.user.id)) {
            // Bot foi adicionado ao grupo, verifica permissão
            const groupId = message.key.remoteJid;
            try {
                const [results] = await pool.query('SELECT * FROM grupos WHERE id_grupo = ?', [groupId]);
                
                if (results.length === 0) {
                    await sock.sendMessage(groupId, {
                        text: 'Este grupo não está autorizado a usar este bot no momento.\nPara obter permissão ou esclarecer\nqualquer dúvida, entre em contato\ncom o desenvolvedor diretamente.\n\n*GOULART - N7 BOTS*\nContato: 5551984112140'
                    });

                    setTimeout(async () => {
                        await sock.groupLeave(groupId);
                    }, 3000);
                }
            } catch (error) {
                console.error('Erro ao verificar novo grupo:', error);
            }
            return;
        }
    }

    // Verifica se a mensagem não é do bot e é nova
    if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
        // Executa verificação inicial apenas uma vez
        if (!filtro.initialized) {
            await verificarFiltro(sock);
            filtro.initialized = true;
        }

        function getRandomMessage(array) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }
    }
}

module.exports = { filtro };