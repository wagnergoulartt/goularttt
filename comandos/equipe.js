const { Message, Buttons, Client, MessageMedia, downloadMediaMessage, MessageType, Contact } = require('@whiskeysockets/baileys');
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




const adminNames = {
    '555184112140@s.whatsapp.net': 'Goulart,LUUH',
    '555181433345@s.whatsapp.net': 'Lisi,NATHAN',
    '555183220100@s.whatsapp.net': 'Mateus (Dark),PAULA'
};

const adminTeams = {
    '555184112140@s.whatsapp.net': 'TROPA DO GOLE',
    '555181433345@s.whatsapp.net': 'LIGA DA ALEGRIA',
    '555183220100@s.whatsapp.net': 'ANJOS DA NOITE'
};


async function equipe(sock, message, messageInfo) {
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
// COMANDO - MOSTRA AS EQUIPES
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!equipe') {
    try {
        // Verificações de permissão
        if (!await verificarGrupo(sock, message, messageInfo)) return;

        // Obtém o ID do autor
        const adminId = message.key.participant || message.key.remoteJid;
        const adminInfo = adminNames[adminId]?.split(',')[0];

        if (!adminInfo) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Você não tem permissão para usar este comando.',
                quoted: message
            });
            return;
        }

        // Obtém metadados do grupo
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        const participants = groupMetadata.participants;
        const groupId = message.key.remoteJid.split('@')[0];
        const fileName = `${groupId}.txt`;
        const filePath = `./media/membros/${fileName}`;

    console.log('Group Name:', groupMetadata.subject);
    console.log('Group Description:', groupMetadata.desc);
    console.log('Group ID:', groupMetadata.id);

        // Cria Set com IDs dos membros atuais
        const currentMemberIds = new Set(participants.map(member => member.id));

        // Lê e processa o arquivo
        let lines = [];
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            lines = data.split('\n').filter(line => line.trim() !== '');
        }

        // Atualiza linhas removendo membros que saíram
        const updatedLines = lines.filter(line => {
            const [, contactId] = line.split('/');
            return currentMemberIds.has(contactId);
        });

        // Salva arquivo atualizado
        fs.writeFileSync(filePath, updatedLines.join('\n'));

        // Monta a mensagem
        let messageText = '*LISTA DE ADMINS E MEMBROS:*\n';
        const admins = {};

        updatedLines.forEach(line => {
            const [adminName, contactId, name] = line.split('/');
            if (!admins[adminName]) {
                admins[adminName] = [];
            }
            admins[adminName].push({ contactId, name });
        });

        // Formata a mensagem final
        Object.keys(admins).forEach(adminName => {
            const adminId = Object.keys(adminNames).find(key => 
                adminNames[key].split(',')[0] === adminName
            );
            const adminTeam = adminId ? adminTeams[adminId] : 'EQUIPE SEM NOME';
            const auxiliar = adminId ? adminNames[adminId].split(',')[1] : 'Sem auxiliar';
            
            messageText += `\n*${adminName.toUpperCase()} (${adminTeam})*\n`;
            messageText += `*AUXILIAR:* ${auxiliar}\n\n`;
            
            admins[adminName].forEach((member, index) => {
                const contactNumber = member.contactId.split('@')[0];
                messageText += `${index + 1} - ${member.name || 'Nome não disponível'} - ${contactNumber}\n`;
            });
        });

        // Envia a mensagem
        if (messageText === '*LISTA DE ADMINS E MEMBROS:*\n') {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Não há membros cadastrados.',
                quoted: message
            });
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: messageText,
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao listar membros:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: '❌ Ocorreu um erro ao listar os membros.',
            quoted: message
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - ADICIONA MEMBROS NA EQUIPE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!addmembro')) {
    const adminId = message.key.participant || message.key.remoteJid;
    const adminName = adminNames[adminId]?.split(',')[0];

    if (adminName) {
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            const contactId = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            const content = messageContent.split(' ');

            if (content.length >= 3) {
                const name = content.slice(2).join(' ');
                const groupIdWithSuffix = message.key.remoteJid;
                const groupId = groupIdWithSuffix.split('@')[0];
                const fileName = `${groupId}.txt`;
                const filePath = path.join(__dirname, '..', 'media', 'membros', fileName);

                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }

                // Verificar se o membro já faz parte de alguma equipe
                const teamsDir = path.join(__dirname, '..', 'media', 'membros');
                const teamFiles = fs.readdirSync(teamsDir);

                for (const teamFile of teamFiles) {
                    const teamFilePath = path.join(teamsDir, teamFile);
                    const teamContent = fs.readFileSync(teamFilePath, 'utf8');

                    if (teamContent.includes(`/${contactId}/`)) {
                        const existingAdminName = teamContent.split('\n').find(line => line.includes(`/${contactId}/`)).split('/')[0];
                        await sock.sendMessage(message.key.remoteJid, {
                            text: `Este usuário já faz parte da equipe do(a) admin *${existingAdminName}*`,
                            quoted: message
                        });
                        return;
                    }
                }

                const saveString = `${adminName}/${contactId}/${name}\n`;

                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    if (fileContent.includes(saveString)) {
                        await sock.sendMessage(message.key.remoteJid, {
                            text: 'Membro já está adicionado.',
                            quoted: message
                        });
                        return;
                    }
                }

                let fileContent = '';
                if (fs.existsSync(filePath)) {
                    fileContent = fs.readFileSync(filePath, 'utf8');

                    if (fileContent.endsWith('\n')) {
                        fs.writeFileSync(filePath, fileContent + saveString);
                    } else {
                        fs.writeFileSync(filePath, fileContent + '\n' + saveString);
                    }
                } else {
                    fs.writeFileSync(filePath, saveString);
                }

                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Membro adicionado com sucesso.',
                    quoted: message
                });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Formato de mensagem incorreto. Use: !addmembros @pessoa Nome',
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Por favor, mencione pelo menos um contato com o comando.',
                quoted: message
            });
        }
    } else {
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Você não tem permissão para usar este comando.',
            quoted: message
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - REMOVE MEMBROS DA EQUIPE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!rmembro')) {
    const adminId = message.key.participant || message.key.remoteJid;
    const adminName = adminNames[adminId]?.split(',')[0];

    if (adminName) {
        const content = messageContent.split(' ');
        if (content.length === 2) {
            const contactId = content[1] + '@s.whatsapp.net';
            const groupIdWithSuffix = message.key.remoteJid;
            const groupId = groupIdWithSuffix.split('@')[0];
            const fileName = `${groupId}.txt`;
            const filePath = path.join(__dirname, '..', 'media', 'membros', fileName);

            if (fs.existsSync(filePath)) {
                let fileContent = fs.readFileSync(filePath, 'utf8');
                const lines = fileContent.split('\n').filter(line => line.trim() !== '');

                // Filtra as linhas que não contêm o ID do contato a ser removido
                const newLines = lines.filter(line => !line.includes(contactId));

                if (newLines.length === lines.length) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: 'Membro não encontrado.',
                        quoted: message
                    });
                } else {
                    // Atualiza o arquivo com as linhas restantes
                    fs.writeFileSync(filePath, newLines.join('\n') + '\n');
                    await sock.sendMessage(message.key.remoteJid, {
                        text: 'Membro removido com sucesso.',
                        quoted: message
                    });
                }
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Não foi possível encontrar a lista de membros.',
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Formato de mensagem incorreto. Use: !rmembros <número>',
                quoted: message
            });
        }
    } else {
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Você não tem permissão para usar este comando.',
            quoted: message
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - NOTIFICA MEMBROS DA EQUIPE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!notificar')) {
    const adminId = message.key.participant || message.key.remoteJid;
    const adminName = adminNames[adminId]?.split(',')[0];

    if (adminName) {
        const groupIdWithSuffix = message.key.remoteJid;
        const groupId = groupIdWithSuffix.split('@')[0];
        const fileName = `${groupId}.txt`;
        const filePath = path.join(__dirname, '..', 'media', 'membros', fileName);

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');
            
            const membersToNotify = lines
                .filter(line => line.startsWith(adminName))
                .map(line => {
                    const [, contactId, name] = line.split('/');
                    // Convertendo o formato do ID
                    const newContactId = contactId.replace('@c.us', '@s.whatsapp.net');
                    return { id: newContactId, name: name };
                });

            if (membersToNotify.length > 0) {
                let notificationMessage = messageContent.replace('!notificar', '').trim();
                if (notificationMessage === '') {
                    notificationMessage = `Você foi notificado pelo seu admin *${adminName}*!`;
                }

                const mentions = membersToNotify.map(member => member.id);

                if (message.message?.imageMessage || message.message?.videoMessage) {
                    const media = await downloadMediaMessage(
                        message,
                        'buffer',
                        {},
                    );
                    
                    await sock.sendMessage(message.key.remoteJid, {
                        image: media,
                        caption: notificationMessage,
                        mentions: mentions
                    });
                } else {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: notificationMessage,
                        mentions: mentions
                    });
                }
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Não há membros cadastrados para este administrador.',
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Não foi possível encontrar a lista de membros.',
                quoted: message
            });
        }
    } else {
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Você não tem permissão para usar este comando.',
            quoted: message
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MOSTRA OS MEMBROS DA EQUIPE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!mlivres') {
    try {
        // Verificações iniciais
        if (!await verificarGrupo(sock, message, messageInfo)) return;
        if (!await verificarAdmin(sock, message, messageInfo)) return;

        const groupId = message.key.remoteJid.split('@')[0];
        const fileName = `${groupId}.txt`;
        const filePath = path.join(__dirname, '..', 'media', 'membros', fileName);

        if (await fsExtra.pathExists(filePath)) {
            const data = await fsExtra.readFile(filePath, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');
            
            const membrosNoArquivo = new Set();
            lines.forEach(line => {
                const [, contactId] = line.split('/');
                if (contactId) {
                    membrosNoArquivo.add(contactId.replace('@c.us', '@s.whatsapp.net'));
                }
            });

            const grupoMetadata = await sock.groupMetadata(message.key.remoteJid);
            const participantes = grupoMetadata.participants;

            const idsAdmin = new Set(
                participantes
                    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                    .map(p => p.id)
            );

            const membrosLivres = participantes.filter(participante => {
                return !membrosNoArquivo.has(participante.id) && !idsAdmin.has(participante.id);
            });

            if (membrosLivres.length > 0) {
                let mensagem = '*MEMBROS SEM ADMIN:*\n\n';
                let mentions = [];

                for (const membro of membrosLivres) {
                    const numero = membro.id.split('@')[0];
                    mentions.push(membro.id);
                    mensagem += `@${numero} - ${numero}\n`;
                }

                await sock.sendMessage(message.key.remoteJid, {
                    text: mensagem,
                    mentions: mentions, // Adiciona as menções
                    quoted: message
                });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Não há membros sem admin neste grupo.',
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Não foi possível encontrar a lista de membros.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao executar comando !mlivres:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao executar o comando.',
            quoted: message
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MOSTRA MEMBROS EM MAIS DE UMA EQUIPE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!mrepetidos') {
    try {
        // Verifica se é grupo e se é admin
        if (!await verificarGrupo(sock, message, messageInfo) || 
            !await verificarAdmin(sock, message, messageInfo)) {
            return;
        }

        const membrosDir = path.join(__dirname, '..', 'media', 'membros');
        const files = fs.readdirSync(membrosDir);
        
        let membros = {};

        // Ler todos os arquivos e coletar informações dos membros
        files.forEach(file => {
            const filePath = path.join(membrosDir, file);
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');

            lines.forEach(line => {
                const [equipe, contactId, name] = line.split('/');
                const newContactId = contactId ? contactId.replace('@c.us', '@s.whatsapp.net') : '';
                
                if (newContactId && !membros[newContactId]) {
                    membros[newContactId] = { name, equipes: [] };
                }
                if (newContactId) {
                    membros[newContactId].equipes.push(equipe);
                }
            });
        });

        // Identificar membros em mais de uma equipe
        let membrosRepetidos = Object.entries(membros)
            .filter(([_, info]) => info.equipes.length > 1)
            .map(([contactId, info]) => ({
                contactId,
                name: info.name,
                equipes: info.equipes
            }));

        // Formatar a mensagem com o novo formato
        let response = '*MEMBROS EM MAIS DE UMA EQUIPE:*\n\n';
        let mentions = [];

        membrosRepetidos.forEach((membro) => {
            // Adiciona o ID do contato para menções
            mentions.push(membro.contactId);
            
            // Formata a mensagem com @ e número
            const numero = membro.contactId.split('@')[0];
            response += `@${numero} - ${numero}\n`;
            response += `*EQUIPES:* ${membro.equipes.join(', ')}\n\n`;
        });

        // Envia a resposta
        if (membrosRepetidos.length === 0) {
            await sock.sendMessage(
                message.key.remoteJid,
                { 
                    text: 'Não há membros em mais de uma equipe.',
                    quoted: message 
                }
            );
        } else {
            await sock.sendMessage(
                message.key.remoteJid,
                { 
                    text: response,
                    mentions: mentions, // Adiciona as menções
                    quoted: message 
                }
            );
        }

    } catch (error) {
        console.error('Erro ao executar comando !mrepetidos:', error);
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
}
module.exports = { equipe };