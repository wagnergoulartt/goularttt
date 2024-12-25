const { Message, Buttons, Client, MessageMedia, downloadMediaMessage, MessageType } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const pool = require('../lib/bd');
require('dotenv').config();
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');
const moment = require('moment');
let ultimaVerificacao = null;

const numeroContato = process.env.NUMERO_CONTATO;
const numeroDono = process.env.NUMERO_DONO;

async function aniver(sock, message, messageInfo) {
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
// COMANDO - ADICIONAR ANIVERSARIANTE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!addaniver')) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {
        const chatId = message.key.remoteJid;
        const mentions = messageInfo.content.mentionedJids;

        if (!mentions || mentions.length === 0) {
            await sock.sendMessage(chatId, {
                text: 'Por favor, mencione pelo menos um contato com o comando.',
                quoted: message
            });
            return;
        }

        // Mantém o formato @s.whatsapp.net (removida a conversão)
        const contactId = mentions[0];
        const content = messageContent.split(' ');

        if (content.length >= 4) {
            const name = content.slice(2, -1).join(' '); // Nome pode ser composto
            const date = content[content.length - 1]; // Data é o último elemento

            const groupId = chatId.replace('@g.us', '');
            const fileName = `${groupId}.txt`;
            const filePath = path.join(__dirname, '..', 'media', 'aniversariantes', fileName);

            // Cria o diretório se ele não existir
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Garante que a string termine com uma quebra de linha
            const saveString = `${contactId}/${name}/${date}\n`;

            // Verifica se o arquivo existe e se é a primeira entrada
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                
                // Verifica se a última linha do arquivo termina com quebra de linha
                if (fileContent && !fileContent.endsWith('\n')) {
                    // Se não terminar com quebra de linha, adiciona uma antes da nova entrada
                    fs.appendFileSync(filePath, '\n' + saveString);
                } else {
                    // Se já terminar com quebra de linha, adiciona normalmente
                    fs.appendFileSync(filePath, saveString);
                }
            } else {
                // Se o arquivo não existir, cria com a primeira entrada
                fs.writeFileSync(filePath, saveString);
            }
            
            await sock.sendMessage(chatId, {
                text: 'Aniversariante adicionado com sucesso.',
                quoted: message
            });
        } else {
            await sock.sendMessage(chatId, {
                text: 'Formato de mensagem incorreto. Use: !addaniver @pessoa Nome DD-MM',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao adicionar aniversariante:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao adicionar o aniversariante.',
            quoted: message
        });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - LISTAR ANIVERSARIANTES
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!listaraniver') {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {
        const chatId = message.key.remoteJid;
        const groupId = chatId.replace('@g.us', '');
        const fileName = `${groupId}.txt`;
        const filePath = path.join(__dirname, '..', 'media', 'aniversariantes', fileName);

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');
            const months = [
                '*JANEIRO*', '*FEVEREIRO*', '*MARÇO*', '*ABRIL*', '*MAIO*', '*JUNHO*',
                '*JULHO*', '*AGOSTO*', '*SETEMBRO*', '*OUTUBRO*', '*NOVEMBRO*', '*DEZEMBRO*'
            ];
            let message = '*LISTA DE ANIVERSARIANTES*\n';

            months.forEach((month, index) => {
                const monthIndex = index + 1;
                let birthdays = lines.filter(line => {
                    const [, , date] = line.split('/');
                    const [, month] = date.split('-');
                    return parseInt(month, 10) === monthIndex;
                });

                // Ordena os aniversariantes do mês pelo dia
                birthdays = birthdays.sort((a, b) => {
                    const [, , dateA] = a.split('/');
                    const [, , dateB] = b.split('/');
                    const dayA = parseInt(dateA.split('-')[0], 10);
                    const dayB = parseInt(dateB.split('-')[0], 10);
                    return dayA - dayB;
                });

                if (birthdays.length > 0) {
                    message += `\n${month}\n`;
                    birthdays.forEach(birthday => {
                        const [contactId, name, date] = birthday.split('/');
                        message += `${name} / ${date}\n`;
                    });
                }
            });

            if (message === '*LISTA DE ANIVERSARIANTES*\n') {
                await sock.sendMessage(chatId, {
                    text: 'Não há aniversariantes cadastrados.',
                    quoted: message
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: message,
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: 'Não foi possível encontrar a lista de aniversariantes.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao listar aniversariantes:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao listar os aniversariantes.',
            quoted: message
        });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - LISTAR MÊS
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!listarmes ')) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {

        const requestedMonth = messageContent.split(' ')[1].toUpperCase();
        const months = [
            'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
            'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
        ];

        const monthIndex = months.indexOf(requestedMonth) + 1;

        if (monthIndex === 0) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Mês inválido. Por favor, digite o nome do mês corretamente.',
                quoted: message
            });
            return;
        }

        const chatId = message.key.remoteJid;
        const groupId = chatId.replace('@g.us', '');
        const fileName = `${groupId}.txt`;
        const filePath = path.join(__dirname, '..', 'media', 'aniversariantes', fileName);

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');
            let message = `*${months[monthIndex - 1]}*\n`;

            let birthdays = lines.filter(line => {
                const [, , date] = line.split('/');
                const [, month] = date.split('-');
                return parseInt(month, 10) === monthIndex;
            });

            birthdays = birthdays.sort((a, b) => {
                const [, , dateA] = a.split('/');
                const [, , dateB] = b.split('/');
                const dayA = parseInt(dateA.split('-')[0], 10);
                const dayB = parseInt(dateB.split('-')[0], 10);
                return dayA - dayB;
            });

            if (birthdays.length > 0) {
                birthdays.forEach(birthday => {
                    const [contactId, name, date] = birthday.split('/');
                    message += `${name} / ${date}\n`;
                });
            } else {
                message += 'Não há aniversariantes cadastrados neste mês.';
            }

            await sock.sendMessage(chatId, {
                text: message,
                quoted: message
            });
        } else {
            await sock.sendMessage(chatId, {
                text: 'Não foi possível encontrar a lista de aniversariantes.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao listar aniversariantes do mês:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao listar os aniversariantes.',
            quoted: message
        });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - REMOVER ANIVERSARIANTE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!raniver')) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {

        const content = messageContent.split(' ');
        
        // Verifica se o nome foi fornecido
        if (content.length >= 2) {
            const nameToRemove = content.slice(1).join(' '); // Nome pode ser composto
            const nameRegex = new RegExp(nameToRemove, 'i'); // Regex case-insensitive

            const chatId = message.key.remoteJid;
            const groupId = chatId.replace('@g.us', '');
            const fileName = `${groupId}.txt`;
            const filePath = path.join(__dirname, '..', 'media', 'aniversariantes', fileName);

            if (fs.existsSync(filePath)) {
                let fileContent = fs.readFileSync(filePath, 'utf8');
                const lines = fileContent.split('\n');
                const filteredLines = lines.filter(line => {
                    if (!line.trim()) return false; // Ignora linhas vazias
                    const lineParts = line.split('/');
                    const name = lineParts[1];
                    return !nameRegex.test(name);
                });

                // Reescreve o arquivo sem as linhas removidas
                fs.writeFileSync(filePath, filteredLines.join('\n'));
                
                await sock.sendMessage(chatId, {
                    text: 'Aniversariante removido com sucesso.',
                    quoted: message
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: 'Não foi possível encontrar o arquivo de aniversariantes.',
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: 'Formato de mensagem incorreto. Use: !raniver Nome',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao remover aniversariante:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao remover o aniversariante.',
            quoted: message
        });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// FUNÇÃO - VERIFICAR ANIVERSARIANTES
/////////////////////////////////////////////////////////////////////////////////////

async function verificarAniversariantes(sock) {
    try {
        const hoje = moment().format('DD-MM');

        if (ultimaVerificacao === hoje) {
            console.log('Verificação já realizada hoje');
            return;
        }

        ultimaVerificacao = hoje;

        const diretorioAniversariantes = path.join(__dirname, '..', 'media', 'aniversariantes');
        const arquivos = fs.readdirSync(diretorioAniversariantes);

        // Objeto para armazenar aniversariantes por grupo
        const aniversariantesPorGrupo = {};

        // Coleta todos os aniversariantes
        for (const arquivo of arquivos) {
            const groupId = arquivo.replace('.txt', '');
            const filePath = path.join(diretorioAniversariantes, arquivo);

            if (!fs.existsSync(filePath)) continue;

            const conteudo = fs.readFileSync(filePath, 'utf8');
            const aniversariantes = conteudo.split('\n').filter(linha => linha.trim());

            const aniversariantesHoje = aniversariantes.filter(aniversariante => {
                const [id, nome, data] = aniversariante.split('/');
                return data.trim() === hoje;
            });

            if (aniversariantesHoje.length > 0) {
                aniversariantesPorGrupo[groupId] = aniversariantesHoje;
            }
        }

        // Processa cada grupo
        for (const [groupId, aniversariantesHoje] of Object.entries(aniversariantesPorGrupo)) {
            const groupJid = `${groupId}@g.us`;

            try {
                // Prepara as menções - agora mantendo o formato @s.whatsapp.net
                const mentions = aniversariantesHoje.map(a => a.split('/')[0]);

                // Formata os nomes mencionados
                const nomesFormatados = mentions.map(tag => `@${tag.split('@')[0]}`).join('\n');

                // Pega uma mensagem aleatória do array de mensagens
                const mensagemBase = messages.Aniver[Math.floor(Math.random() * messages.Aniver.length)];

                // Formata a mensagem final
                const mensagemFinal = `*PARABÉNS*\n\n${nomesFormatados}\n\n${mensagemBase}`;

                // Atualiza o nome do grupo
                const nomes = aniversariantesHoje.map(a => a.split('/')[1]);
                const nomeGrupo = `Parabéns ${nomes.join(', ')} 🎉`;
                await sock.groupUpdateSubject(groupJid, nomeGrupo);

                // Envia a mensagem com menções
                await sock.sendMessage(groupJid, {
                    text: mensagemFinal,
                    mentions: mentions
                });
            } catch (error) {
                console.error(`Erro ao processar grupo ${groupId}:`, error);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar aniversariantes:', error);
    }
}

// Agendar verificação para 00:02
const job = schedule.scheduleJob('2 0 * * *', async function() {
    console.log('Iniciando verificação de aniversariantes...');
    if (global.sock) {
        await verificarAniversariantes(global.sock);
    }
});



}
}
module.exports = { aniver };