const { Message, Buttons, Client, MessageMedia, downloadMediaMessage, MessageType } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const pool = require('../lib/bd');
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');

async function grupos(sock, message, messageInfo) {
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
// FUNÇÃO - BAN LINK DE WHATSAPP 
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.includes('chat.whatsapp.com')) {
    try {
        // Verifica se é um grupo
        if (!message.key.remoteJid.endsWith('@g.us')) {
            return; // Se não for grupo, retorna
        }

        // Obtém o ID do autor da mensagem
        const authorId = message.key.participant || message.key.remoteJid;

        // Verifica se o autor é admin
        if (await verificarAdmin(message, sock)) {
            return; // Se for admin, não faz nada
        }

        // Se não for admin, executa as ações
        // Deleta a mensagem citada se houver
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            try {
                await sock.sendMessage(message.key.remoteJid, {
                    delete: {
                        remoteJid: message.key.remoteJid,
                        fromMe: false,
                        id: message.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: message.message.extendedTextMessage.contextInfo.participant
                    }
                });
            } catch (error) {
                console.error("Erro ao deletar mensagem citada:", error);
            }
        }

        // Deleta a mensagem original
        await sock.sendMessage(message.key.remoteJid, {
            delete: {
                remoteJid: message.key.remoteJid,
                fromMe: false,
                id: message.key.id,
                participant: authorId
            }
        });

        // Remove o participante do grupo
        try {
            await sock.groupParticipantsUpdate(
                message.key.remoteJid,
                [authorId],
                "remove"
            );

            // Envia mensagem informando o banimento
            const numero = authorId.split('@')[0];
            await sock.sendMessage(message.key.remoteJid, {
                text: `O número ${numero} foi banido!\n*Motivo:* Postou link de grupo`,
            });

        } catch (error) {
            console.error("Erro ao remover participante:", error);
        }

    } catch (error) {
        console.error("Erro ao processar comando de anti-link:", error);
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - ALTERAR O NOME DO GRUPO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!titulo=')) {
        try {
            // Extrai o novo título removendo o comando '!titulo='
            const newTitle = messageContent.slice('!titulo='.length);
            
            // Atualiza o título do grupo
            await sock.groupUpdateSubject(
                message.key.remoteJid,
                newTitle
            );

            // Envia mensagem de confirmação
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text: '*Título alterado com sucesso!*',
                    quoted: message
                }
            );
        } catch (error) {
            console.error("Erro ao alterar título do grupo:", error);
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text: 'Erro ao alterar o título do grupo',
                    quoted: message
                }
            );
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - ABRIR GRUPO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!abrirgrupo') {
    try {
        await sock.groupSettingUpdate(message.key.remoteJid, 'not_announcement');
        const resposta = messages.AbrirGrupo;
        await sock.sendMessage(message.key.remoteJid, { 
            text: resposta,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
        }, { quoted: message }); // Adiciona quoted aqui também
        return;
    } catch (error) {
        await sock.sendMessage(message.key.remoteJid, { 
            text: 'Não foi possível abrir o grupo',
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
        }, { quoted: message }); // Adiciona quoted aqui também
        return;
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - FECHAR GRUPO 
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!fechargrupo') {
    try {
        await sock.groupSettingUpdate(message.key.remoteJid, 'announcement');
        const resposta = messages.FecharGrupo;
        await sock.sendMessage(message.key.remoteJid, { 
            text: resposta,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
        }, { quoted: message }); // Adiciona quoted aqui também
        return;
    } catch (error) {
        await sock.sendMessage(message.key.remoteJid, { 
            text: 'Não foi possível fechar o grupo',
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
        }, { quoted: message }); // Adiciona quoted aqui também
        return;
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - ID DO GRUPO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!idgrupo') {
if (await verificarGrupo(sock, message, messageInfo)) {
  try {
    const groupID = message.key.remoteJid;
    const resposta = messages.IdGrupo.replace('{{groupID}}', groupID);
    
    await sock.sendMessage(
      message.key.remoteJid,
      {
        text: resposta,
        quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
      },
      { quoted: message } // Adiciona quoted aqui também
    );
    return;
  } catch (error) {
    console.error("Erro ao executar o comando !idgrupo:", error);
  }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - ADICIONA USÚARIO NO GRUPO
/////////////////////////////////////////////////////////////////////////////////////





/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - PROMOVER A ADMIN 
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!promover')) {
    // Verifica se é um grupo
    if (!message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Este comando só pode ser usado em um grupo.' },
            { quoted: message }
        );
        return;
    }

    // Verifica se há menção e se é única
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length !== 1) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Por favor, mencione um único usuário para promover.' },
            { quoted: message }
        );
        return;
    }

    try {
        // Promove o participante
        await sock.groupParticipantsUpdate(
            message.key.remoteJid,
            mentioned,
            "promote"
        );

        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Usuário promovido com sucesso.' },
            { quoted: message }
        );
    } catch (error) {
        console.error('Erro ao promover:', error);
        await sock.sendMessage(
            message.key.remoteJid,
            { text: `Erro ao promover o usuário: ${error}` },
            { quoted: message }
        );
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - REBAIXAR ADMIN 
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!rebaixar')) {
        // Verifica se é um grupo
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(
                message.key.remoteJid,
                { text: 'Este comando só pode ser usado em um grupo.' },
                { quoted: message }
            );
            return;
        }

        // Verifica se há menção e se é única
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length !== 1) {
            await sock.sendMessage(
                message.key.remoteJid,
                { text: 'Por favor, mencione um único usuário para rebaixar.' },
                { quoted: message }
            );
            return;
        }

        try {
            // Rebaixa o participante
            await sock.groupParticipantsUpdate(
                message.key.remoteJid,
                mentioned,
                "demote"
            );

            await sock.sendMessage(
                message.key.remoteJid,
                { text: 'Usuário rebaixado com sucesso.' },
                { quoted: message }
            );
        } catch (error) {
            console.error('Erro ao rebaixar:', error);
            await sock.sendMessage(
                message.key.remoteJid,
                { text: `Erro ao rebaixar o usuário: ${error}` },
                { quoted: message }
            );
        }
    }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - BANI PELA MENSAGEM
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!mban')) {
    // Verifica se é um grupo
    if (!message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Este comando só pode ser usado em um grupo.' },
            { quoted: message }
        );
        return;
    }

    // Verifica se há uma mensagem citada
    if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Por favor, cite a mensagem do usuário que deseja banir.' },
            { quoted: message }
        );
        return;
    }

    try {
        // Obtém o autor da mensagem citada
        const quotedMessageAuthor = message.message.extendedTextMessage.contextInfo.participant;

        // Remove o participante do grupo
        await sock.groupParticipantsUpdate(
            message.key.remoteJid,
            [quotedMessageAuthor],
            "remove"
        );

        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Usuário removido do grupo com sucesso.' },
            { quoted: message }
        );
    } catch (error) {
        console.error('Erro ao banir:', error);
        await sock.sendMessage(
            message.key.remoteJid,
            { text: `Erro ao banir o usuário: ${error}` },
            { quoted: message }
        );
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - BANI MENCIONANDO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!ban')) {
    // Verifica se é um grupo
    if (!message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Este comando só pode ser usado em um grupo.' },
            { quoted: message }
        );
        return;
    }

    // Verifica se há menção e se é única
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length !== 1) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Por favor, mencione um único usuário para banir.' },
            { quoted: message }
        );
        return;
    }

    try {
        // Remove o participante do grupo
        await sock.groupParticipantsUpdate(
            message.key.remoteJid,
            mentioned,
            "remove"
        );

        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Usuário removido do grupo com sucesso.' },
            { quoted: message }
        );
    } catch (error) {
        console.error('Erro ao banir:', error);
        await sock.sendMessage(
            message.key.remoteJid,
            { text: `Erro ao banir o usuário: ${error}` },
            { quoted: message }
        );
    }
}
/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - APAGA PARA TODOS
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!apagar')) {
    // Verifica se é um grupo
    if (!message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Este comando só pode ser usado em um grupo.' },
            { quoted: message }
        );
        return;
    }

    // Verifica se há uma mensagem citada
    if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Por favor, cite a mensagem que deseja apagar.' },
            { quoted: message }
        );
        return;
    }

    try {
        // Obtém a mensagem citada
        const quotedMessage = {
            remoteJid: message.key.remoteJid,
            fromMe: message.message.extendedTextMessage.contextInfo.participant === sock.user.id,
            id: message.message.extendedTextMessage.contextInfo.stanzaId,
            participant: message.message.extendedTextMessage.contextInfo.participant
        };

        // Apaga a mensagem
        await sock.sendMessage(message.key.remoteJid, { delete: quotedMessage });

        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Mensagem apagada com sucesso.' },
            { quoted: message }
        );
    } catch (error) {
        console.error('Erro ao apagar mensagem:', error);
        await sock.sendMessage(
            message.key.remoteJid,
            { text: `Erro ao apagar a mensagem: ${error}` },
            { quoted: message }
        );
    }
}
/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - REDEFINI O LINK DO GRUPO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!redefinir') {
        try {
            await sock.groupRevokeInvite(message.key.remoteJid);
            await sock.sendMessage(
                message.key.remoteJid,
                { text: '*O link do grupo foi redefinido.*' },
                { quoted: message }
            );
        } catch (error) {
            console.error('Erro ao redefinir link:', error);
            await sock.sendMessage(
                message.key.remoteJid,
                { text: 'Erro ao redefinir o link do grupo.' },
                { quoted: message }
            );
        }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - DESCRIÇÃO DO GRUPO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!descricao') {
        try {
            const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
            await sock.sendMessage(
                message.key.remoteJid,
                { text: `*DESCRIÇÃO DO GRUPO:*\n\n${groupMetadata.desc || 'Sem descrição'}` },
                { quoted: message }
            );
        } catch (error) {
            console.error('Erro ao obter descrição:', error);
            await sock.sendMessage(
                message.key.remoteJid,
                { text: 'Erro ao obter a descrição do grupo.' },
                { quoted: message }
            );
        }
    }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MARCAR TODOS (PRECISA ARRUMAR: NÃO FUNCIONA VIDEO)
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!mt')) {
    try {
        // Obtém os metadados do grupo
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        
        // Obtém a lista de participantes
        const participants = groupMetadata.participants.map(p => p.id);
        
        // Prepara a mensagem de notificação
        let notificationMessage = '';

        // Verifica se há texto adicional junto com o comando
        if (messageContent.trim() !== '!mt') {
            const additionalText = messageContent.replace('!mt', '').trim();
            notificationMessage += additionalText;
        }

        // Se não houver texto adicional, define uma mensagem padrão
        if (notificationMessage === '') {
            notificationMessage = 'Pronto, Todos foram mencionados.';
        }

        // Verifica o tipo de mídia
        const mediaType = message.type; // Pega o tipo diretamente da mensagem

        if (mediaType === 'image' || mediaType === 'video') {
            try {
                // Baixa a mídia
                const buffer = await downloadMediaMessage(
                    message,
                    'buffer',
                    {},
                    { 
                        logger: console,
                        reuploadRequest: sock.updateMediaMessage
                    }
                );

                const messageOptions = {
                    caption: notificationMessage,
                    mentions: participants
                };

                if (mediaType === 'image') {
                    // Envia imagem com menções
                    await sock.sendMessage(
                        message.key.remoteJid,
                        {
                            image: buffer,
                            ...messageOptions
                        }
                    );
                } else if (mediaType === 'video') {
                    // Envia vídeo com menções
                    await sock.sendMessage(
                        message.key.remoteJid,
                        {
                            video: buffer,
                            ...messageOptions,
                            gifPlayback: false,
                            mimetype: 'video/mp4'
                        }
                    );
                }
            } catch (mediaError) {
                console.error('Erro ao processar mídia:', mediaError);
                // Se falhar ao processar mídia, envia apenas o texto
                await sock.sendMessage(
                    message.key.remoteJid,
                    {
                        text: notificationMessage,
                        mentions: participants
                    }
                );
            }
        } else {
            // Envia apenas texto
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text: notificationMessage,
                    mentions: participants
                }
            );
        }
    } catch (error) {
        console.error('Erro ao marcar todos:', error);
        await sock.sendMessage(
            message.key.remoteJid,
            { 
                text: 'Ocorreu um erro ao tentar marcar todos os participantes.',
                quoted: message 
            }
        );
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - COMANDO NOVO
/////////////////////////////////////////////////////////////////////////////////////





/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - BEM VINDO
/////////////////////////////////////////////////////////////////////////////////////

if (!messageInfo.types.text || messageInfo.content.text !== '!bv') return;

        const groupId = messageInfo.metadata.from;
        const participantId = messageInfo.metadata.participant || messageInfo.metadata.from;

        // Verifica se é um grupo
        if (!groupId.endsWith('@g.us')) {
            await sock.sendMessage(groupId, {
                text: 'Este comando só pode ser usado em grupos.'
            });
            return;
        }



        // Consulta ao banco de dados usando seu pool MySQL
        const [rows] = await pool.query(
            'SELECT gc.img_bv, gc.msg_bv FROM grupos AS g ' +
            'JOIN gruposContratados AS gc ON g.id = gc.grupo ' +
            'WHERE g.id_grupo = ?', 
            [groupId]
        );

        // Obtém informações do grupo
        const groupMetadata = await sock.groupMetadata(groupId);
        const groupName = groupMetadata.subject;

        if (!rows || rows.length === 0) {
            // Mensagem padrão se não houver configuração
            await sock.sendMessage(groupId, {
                text: `Olá, @${participantId.split('@')[0]}\nSeja bem-vindo ao grupo:\n*${groupName}*`,
                mentions: [participantId]
            });
            return;
        }

        const result = rows[0];
        const mention = `@${participantId.split('@')[0]}`;

        // Processamento de mídia
        let buffer;
        if (result.img_bv) {
            const imagePath = `/var/www/html/painel/public/uploads/bv/${result.img_bv}`;
            if (await fsExtra.pathExists(imagePath)) {
                buffer = await fsExtra.readFile(imagePath);
            }
        }

        // Formatação da mensagem
        const formattedMessage = result.msg_bv ? 
            result.msg_bv
                .replace('{p1}', mention)
                .replace('{p2}', groupName) : 
            '';

        // Envio da mensagem baseado no que está disponível
        if (buffer && formattedMessage) {
            await sock.sendMessage(groupId, {
                image: buffer,
                caption: formattedMessage,
                mentions: [participantId]
            });
        } else if (formattedMessage) {
            await sock.sendMessage(groupId, {
                text: formattedMessage,
                mentions: [participantId]
            });
        } else if (buffer) {
            await sock.sendMessage(groupId, {
                image: buffer,
                mentions: [participantId]
            });
        } else {
            // Mensagem padrão se não houver configuração válida
            await sock.sendMessage(groupId, {
                text: `Olá, @${participantId.split('@')[0]}\nSeja bem-vindo ao grupo:\n*${groupName}*`,
                mentions: [participantId]
            });
        }
        











}

}

module.exports = { grupos };