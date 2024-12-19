const { Message, Buttons, Client, MessageMedia, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono } = require('../lib/privilegios');
const pool = require('../lib/bd');
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');
const axios = require('axios');
const moment = require('moment-timezone');
const math = require('mathjs');
const translate = require('google-translate-api-x');
const fs = require('fs');
const path = require('path')
const { tmpdir } = require('os');
const { join } = require('path');
const { createCanvas } = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');


// Adicione o objeto de mapeamento de signos
const signsReverse = {
    'áries': 'aries',
    'touro': 'taurus', 
    'gêmeos': 'gemini',
    'câncer': 'cancer',
    'leão': 'leo',
    'virgem': 'virgo',
    'libra': 'libra',
    'escorpião': 'scorpio',
    'sagitário': 'sagittarius',
    'capricórnio': 'capricorn',
    'aquário': 'aquarius',
    'peixes': 'pisces'
};

// Função auxiliar para remover acentos
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function utilidades(sock, message, messageInfo) {
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


if (messageContent === '!sortear') {
    try {
        // Verifica se é administrador
        if (!await verificarAdmin(sock, message, messageInfo)) return;

        // Obtém os metadados do grupo
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        
        // Obtém todos os participantes
        const participants = groupMetadata.participants.map(p => p.id);
        
        // Escolhe um participante aleatoriamente
        const chosenParticipant = participants[Math.floor(Math.random() * participants.length)];
        
        // Prepara a mensagem
        const mentionMessage = `Parabéns @${chosenParticipant.split('@')[0]}\n*Você foi sorteado(a)!*`;

        // Envia a mensagem com a menção
        await sock.sendMessage(message.key.remoteJid, {
            text: mentionMessage,
            mentions: [chosenParticipant]
        });

    } catch (error) {
        console.error('Erro ao executar comando !sortear:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: "❌ Ocorreu um erro ao executar o sorteio"
        });
    }
}








if (messageContent.startsWith('!sortearm')) {
    try {
        // Verifica se é administrador
        if (!await verificarAdmin(sock, message, messageInfo)) return;

        // Obtém as menções da mensagem
        const mentions = messageInfo.content.mentionedJids;

        if (mentions && mentions.length > 0) {
            // Escolhe um usuário aleatoriamente entre os mencionados
            const chosenUser = mentions[Math.floor(Math.random() * mentions.length)];
            
            // Prepara a mensagem
            const mentionMessage = `Parabéns @${chosenUser.split('@')[0]}\n*Você foi sorteado(a)!*`;

            // Envia a mensagem com a menção
            await sock.sendMessage(message.key.remoteJid, {
                text: mentionMessage,
                mentions: [chosenUser]
            });
        } else {
            // Caso não haja menções
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Por favor, mencione os participantes para o sorteio.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao executar comando !sortearm:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: "❌ Ocorreu um erro ao executar o sorteio"
        });
    }
}




if (messageContent.startsWith('!signo ')) {
    try {
        const signInput = messageContent.split(' ')[1].toLowerCase();
        const signKey = Object.keys(signsReverse).find(key => 
            removeAccents(key) === removeAccents(signInput)
        );

        if (!signKey) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Por favor, forneça um signo válido.',
                quoted: message
            });
            return;
        }

        const response = await axios.get('https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily', {
            params: {
                sign: signsReverse[signKey],
                day: 'TODAY'
            },
            headers: {
                'accept': 'application/json'
            }
        });

        const horoscope = response.data.data.horoscope_data;

        // Traduzir o horóscopo para português
        const translatedHoroscope = await translate(horoscope, { to: 'pt' });

        await sock.sendMessage(message.key.remoteJid, {
            text: `Horóscopo de *hoje* para *${signKey}*:\n\n${translatedHoroscope.text}`,
            }, { quoted: message }); // Adiciona quoted aqui também
        return;

    } catch (error) {
        console.error('Erro ao buscar o horóscopo:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Desculpe, não consegui buscar o horóscopo no momento.',
            });
    }
}








if (messageContent.startsWith('!noticias ')) {
  try {
        const tema = messageContent.slice(10); // Remove o comando para obter apenas o tema
        const apiKey = process.env.API_NEWS_ORG;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(tema)}&apiKey=${apiKey}`;

        const response = await axios.get(url);
        const articles = response.data.articles;
        let newsMessage = `Notícias sobre ${tema}:\n\n`;
        
        articles.slice(0, 5).forEach((article, index) => {
            newsMessage += `${index + 1}. *${article.title}*\n${article.url}\n\n`;
        });

        // Envia a mensagem como resposta à mensagem original
        await sock.sendMessage(message.key.remoteJid, {
            text: newsMessage,
            }, { quoted: message }); // Adiciona quoted aqui também
        return;

    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Desculpe, ocorreu um erro ao buscar as notícias.',
            quoted: message
        });
    }
}







if (messageContent.startsWith('!amigosecreto')) {
    try {
        // Get mentions from the message
        const mentions = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentions.length % 2 !== 0) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Por favor, mencione um número par de participantes.',
                quoted: message
            });
            return;
        }

        // Shuffle the participants list
        for (let i = mentions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mentions[i], mentions[j]] = [mentions[j], mentions[i]];
        }

        // Send private message to each participant with their secret friend
        for (let i = 0; i < mentions.length; i++) {
            const secretFriendIndex = (i + 1) % mentions.length;
            const participant = mentions[i];
            const secretFriend = mentions[secretFriendIndex];

            // Get the phone number without @s.whatsapp.net
            const secretFriendNumber = secretFriend.split('@')[0];

            // Build the message
            const privateMessage = `O seu amigo secreto é: ${secretFriendNumber}\n` +
                                 'Favor anote essa mensagem em algum lugar seguro e não conte quem é seu amigo secreto!';

            // Send private message to participant
            await sock.sendMessage(participant, {
                text: privateMessage
            });
        }

        // Send confirmation in the group
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Todos os participantes receberam seu amigo secreto no privado!',
            quoted: message
        });

    } catch (error) {
        console.error('Erro no amigo secreto:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao processar o amigo secreto.',
            quoted: message
        });
    }
}






if (messageContent.startsWith('!clima ')) {
    try {
        const cidade = messageContent.slice(7); // Remove o comando para pegar somente o nome da cidade
        const apiKey = 'b61caff1894b812529d85aa1cd948446';
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${cidade},BR&appid=${apiKey}&units=metric&lang=pt_br`;

        const response = await axios.get(url);
        const data = response.data;

        if (data.cod === 200) {
            const temperatura = data.main.temp;
            const temp_min = data.main.temp_min;
            const temp_max = data.main.temp_max;
            const vento = data.wind.speed;
            const umidade = data.main.humidity;

            const resposta = `Clima em ${cidade}:\n\n` +
                           `- Temperatura: ${temperatura}°C\n` +
                           `- Temperatura Mínima: ${temp_min}°C\n` +
                           `- Temperatura Máxima: ${temp_max}°C\n` +
                           `- Velocidade do Vento: ${vento} m/s\n` +
                           `- Umidade: ${umidade}%`;

            await sock.sendMessage(message.key.remoteJid, {
                text: resposta,
                quoted: message
            });
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: `Não foi possível obter o clima para ${cidade}.`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Erro ao buscar o clima:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao buscar o clima.',
            quoted: message
        });
    }
}







if (messageContent === '!hora') {
    // Define o fuso horário para São Paulo
    const timezone = 'America/Sao_Paulo';
    // Obtém a hora atual para o fuso horário especificado
    const now = moment().tz(timezone).format('HH:mm:ss');

    await sock.sendMessage(message.key.remoteJid, {
        text: `O horário atual é *${now}*.`,
        quoted: message
    });
}

// Comando !calcular
if (messageContent.startsWith('!calcular ')) {
    let expression = messageContent.slice(10).trim();
    expression = expression.replace(/%/g, '/');
    expression = expression.replace(/x/g, '*');
    console.log(`Expressão após substituição: ${expression}`);
    
    try {
        const result = math.evaluate(expression);
        await sock.sendMessage(message.key.remoteJid, {
            text: `*Resultado:* ${result}`,
            quoted: message
        });
    } catch (error) {
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Houve um erro ao calcular a expressão. Por favor, verifique a expressão e tente novamente.',
            quoted: message
        });
    }
}








if (messageContent.startsWith('!figtexto ')) {
    try {
        const texto = messageContent.slice(9).trim();
        
        if (!texto) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Por favor, digite um texto após o comando. Exemplo: !figtexto Seu texto aqui'
            });
            return;
        }

        // Cria um canvas com dimensões específicas
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // Preenche o fundo com cor sólida
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 512);

        // Configura o texto
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Quebra o texto em linhas
        const palavras = texto.split(' ');
        let linhas = [];
        let linhaAtual = '';
        const maxWidth = 480;

        for (let palavra of palavras) {
            const testeLinha = linhaAtual + palavra + ' ';
            if (ctx.measureText(testeLinha).width < maxWidth) {
                linhaAtual = testeLinha;
            } else {
                linhas.push(linhaAtual);
                linhaAtual = palavra + ' ';
            }
        }
        linhas.push(linhaAtual);

        // Desenha o texto
        const lineHeight = 70;
        const startY = (512 - (linhas.length * lineHeight)) / 2;
        linhas.forEach((linha, i) => {
            ctx.fillText(linha.trim(), 256, startY + (i * lineHeight));
        });

        // Converte canvas para buffer
        const pngBuffer = canvas.toBuffer('image/png');

        // Converte PNG para WebP usando sharp
        const webpBuffer = await sharp(pngBuffer)
            .resize(512, 512)
            .webp()
            .toBuffer();

        // Envia a figurinha com as propriedades pack e author
        await sock.sendMessage(message.key.remoteJid, {
            sticker: webpBuffer,
            mimetype: 'image/webp',
            stickerMessage: {
                url: "https://mmg.whatsapp.net",
                fileSha256: [],
                fileEncSha256: [],
                mediaKey: [],
                mimetype: "image/webp",
                height: 512,
                width: 512,
                directPath: "",
                fileLength: "",
                mediaKeyTimestamp: "",
                isAnimated: false,
                contextInfo: {
                    externalAdReply: {
                        title: "Dev: n7bots.com.br",
                        body: "Lola 3.0",
                        mediaType: 1,
                        thumbnailUrl: "",
                        sourceUrl: "https://n7bots.com.br"
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro ao criar sticker:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: '❌ Ocorreu um erro ao criar o sticker.'
        });
    }
}





if (messageContent === '!figimagem') {
    try {
        // Verifica se é uma resposta a uma mensagem com mídia
        const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Verifica se há uma imagem na mensagem atual ou na mensagem respondida
        const imageMessage = message.message.imageMessage || quotedMessage?.imageMessage;

        if (!imageMessage) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Por favor, envie uma imagem ou responda a uma imagem com o comando !figimagem'
            });
            return;
        }

        // Baixa a imagem
        const buffer = await downloadMediaMessage(
            {
                key: message.key,
                message: imageMessage ? { imageMessage } : quotedMessage
            },
            'buffer',
            {},
            {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            }
        );

        // Processa a imagem e converte para WebP
        const webpBuffer = await sharp(buffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp()
            .toBuffer();

        // Envia a figurinha
        await sock.sendMessage(message.key.remoteJid, {
            sticker: webpBuffer,
            mimetype: 'image/webp'
        });

    } catch (error) {
        console.error('Erro ao criar sticker:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: '❌ Ocorreu um erro ao criar o sticker.'
        });
    }
}







if (messageContent === '!figvideo') {
    try {
        // Verifica se é uma resposta a uma mensagem com mídia
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const videoMessage = message.message?.videoMessage || quotedMessage?.videoMessage;

        if (!videoMessage) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Por favor, envie um vídeo ou responda a um vídeo com o comando !figvideo'
            });
            return;
        }

        // Cria caminhos temporários
        const tempVideoPath = join(tmpdir(), `video-${Date.now()}.mp4`);
        const tempOutputPath = join(tmpdir(), `sticker-${Date.now()}.webp`);

        // Download do vídeo
        const buffer = await downloadMediaMessage(
            {
                key: message.key,
                message: videoMessage ? { videoMessage } : quotedMessage
            },
            'buffer',
            {},
            {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            }
        );

        // Salva o vídeo temporariamente
        await fsExtra.writeFile(tempVideoPath, buffer);

        // Converte para webp usando ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tempVideoPath)
                .setFfmpegPath('ffmpeg')
                .inputFormat('mp4')
                .on('start', function(commandLine) {
                })
                .addOutputOptions([
                    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
                    '-vcodec', 'libwebp',
                    '-lossless', '1',
                    '-qscale', '1',
                    '-preset', 'default',
                    '-loop', '0',
                    '-an',
                    '-vsync', '0',
                    '-t', '10'
                ])
                .toFormat('webp')
                .on('end', resolve)
                .on('error', reject)
                .save(tempOutputPath);
        });

        // Lê o arquivo convertido
        const stickerBuffer = await fsExtra.readFile(tempOutputPath);

        // Envia a figurinha
        await sock.sendMessage(message.key.remoteJid, {
            sticker: stickerBuffer,
            mimetype: 'image/webp'
        });

        // Limpa os arquivos temporários
        await fsExtra.remove(tempVideoPath);
        await fsExtra.remove(tempOutputPath);

    } catch (error) {
        console.error('Erro ao criar sticker:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: '❌ Ocorreu um erro ao criar o sticker. Erro: ' + error.message
        });
    }
}









    }
}

module.exports = { utilidades };