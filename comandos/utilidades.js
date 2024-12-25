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


if (messageContent.startsWith('!addcasal')) {
if (await verificarAdmin(sock, message, messageInfo)) {
        try {
            // Verifica se é um grupo
            if (!message.key.remoteJid.endsWith('@g.us')) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Este comando só pode ser usado em grupos.',
                    quoted: message
                });
                return;
            }

            // Verifica se o usuário é admin
            if (!await verificarAdmin(sock, message, messageInfo)) {
                return;
            }

            const mentions = messageInfo.content.mentionedJids;

            if (!mentions || mentions.length !== 2) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Por favor, mencione exatamente dois contatos para formar o casal.',
                    quoted: message
                });
                return;
            }

            const pessoa1 = mentions[0];
            const pessoa2 = mentions[1];
            const groupId = message.key.remoteJid.replace('@g.us', '');
            const fileName = `${groupId}.txt`;
            const filePath = path.join(__dirname, '..', 'media', 'casais', fileName);

            // Cria o diretório casais se não existir
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            const saveString = `${pessoa1}/${pessoa2}\n`;

            // Verifica se o arquivo existe
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                
                // Verifica se o casal já existe
                if (fileContent.includes(`${pessoa1}/${pessoa2}`) || fileContent.includes(`${pessoa2}/${pessoa1}`)) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: 'Este casal já está registrado! ❤️',
                        quoted: message
                    });
                    return;
                }
                
                // Adiciona o novo casal
                fs.appendFileSync(filePath, fileContent.endsWith('\n') ? saveString : '\n' + saveString);
            } else {
                // Cria o arquivo com o primeiro casal
                fs.writeFileSync(filePath, saveString);
            }

            await sock.sendMessage(message.key.remoteJid, {
                text: 'Casal adicionado com sucesso! ❤️',
                quoted: message
            });

        } catch (error) {
            console.error('Erro ao adicionar casal:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Ocorreu um erro ao adicionar o casal.',
                quoted: message
            });
        }
    }
}







if (messageContent === '!listarcasais') {
    try {
        // Verifica se é um grupo
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Este comando só pode ser usado em grupos.',
                quoted: message
            });
            return;
        }

        const groupId = message.key.remoteJid.replace('@g.us', '');
        const fileName = `${groupId}.txt`;
        const filePath = path.join(__dirname, '..', 'media', 'casais', fileName);

        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Não há casais registrados neste grupo ainda! ❤️',
                quoted: message
            });
            return;
        }

        // Lê o conteúdo do arquivo
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const casais = fileContent.trim().split('\n');

        if (casais.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Não há casais registrados neste grupo ainda! ❤️',
                quoted: message
            });
            return;
        }

        // Monta a mensagem com a lista de casais
        let mensagem = '*💑 CASAIS DO GRUPO 💑*\n\n';
        let mentions = [];

        casais.forEach((casal, index) => {
            const [pessoa1, pessoa2] = casal.split('/');
            if (pessoa1 && pessoa2) {
                mensagem += `@${pessoa1.split('@')[0]} + @${pessoa2.split('@')[0]}\n`;
                mentions.push(pessoa1);
                mentions.push(pessoa2);
            }
        });

        // Envia a mensagem mencionando todos os casais
        await sock.sendMessage(message.key.remoteJid, {
            text: mensagem,
            mentions: mentions,
            quoted: message
        });

    } catch (error) {
        console.error('Erro ao listar casais:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Ocorreu um erro ao listar os casais.',
            quoted: message
        });
    }
}


if (messageContent.startsWith('!rcasal')) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {

        const chatId = message.key.remoteJid;
        const groupId = chatId.replace('@g.us', '');
        const fileName = `${groupId}.txt`;
        const filePath = path.join(__dirname, '..', 'media', 'casais', fileName);

        // Pega a menção após o comando
        const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid[0];
        
        if (!mentioned) {
            await sock.sendMessage(chatId, {
                text: 'Você precisa mencionar um dos membros do casal. Use: !rcasal @pessoa',
                quoted: message
            });
            return;
        }

        if (fs.existsSync(filePath)) {
            let fileContent = fs.readFileSync(filePath, 'utf8');
            const lines = fileContent.split('\n');
            
            // Encontra a linha que contém a pessoa mencionada
            const personNumber = mentioned.replace('@s.whatsapp.net', '');
            const lineToRemove = lines.find(line => line.includes(personNumber));

            if (lineToRemove) {
                // Remove a linha do casal
                const updatedLines = lines.filter(line => line !== lineToRemove);
                fs.writeFileSync(filePath, updatedLines.join('\n'));
                
                await sock.sendMessage(chatId, {
                    text: '✅ Casal removido com sucesso!',
                    quoted: message
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Esta pessoa não está em nenhum casal registrado.',
                    quoted: message
                });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Não há casais registrados neste grupo.',
                quoted: message
            });
        }

    } catch (error) {
        console.error('Erro ao remover casal:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: '❌ Ocorreu um erro ao remover o casal.',
            quoted: message
        });
    }
}
}


    // Verifica se a mensagem não é do bot e é nova
    if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
        // Função auxiliar para mensagens aleatórias permanece a mesma
        function getRandomMessage(array) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }
/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - SORTEA UMA PESSOA ALEATORIA
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent === '!sortear') {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {

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
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - SORTEA UMA DAS PESSOAS MENCIONADAS
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!sortearm')) {
if (await verificarAdmin(sock, message, messageInfo)) {
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
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MOSTRA O SIGNO DO DIA
/////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MOSTRA AS NOTICIAS
/////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - SORTEA AMIGO SECRETO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!amigosecreto')) {
if (await verificarAdmin(sock, message, messageInfo)) {
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
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MOSTRA O CLIMA POR CIDADE
/////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - MOSTRA A HORA ATUAL
/////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - CRIA FIGURINHA PELO TEXTO
/////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - CRIA FIGURINHA POR IMAGEM
/////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - CRIA FIGURINHA POR VIDEO
/////////////////////////////////////////////////////////////////////////////////////

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