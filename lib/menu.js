const { Message, Buttons, Client, MessageMedia, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono } = require('../lib/privilegios');
const pool = require('../lib/bd');
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');

async function menu(sock, message, messageInfo) {
    // Verifica se a mensagem não é do bot
    if (!messageInfo.metadata.fromMe) {
        const messageContent = messageInfo.content.text;

        // Menu Principal
        if (messageContent === '!menu') {
            const menuPrincipal = `→ *MENU PRINCIPAL* ←

!menu 1 → *GRUPO*
!menu 2 → *DIVERSÃO*
!menu 3 → *UTILIDADES*
!menu 4 → *INTERAÇÃO*
!menu 5 → *FUNÇÕES AUTOMÁTICAS*
            `;

            await sock.sendMessage(messageInfo.metadata.from, { 
                text: menuPrincipal,
                quoted: message 
            });
            return;
        }

        // Submenus
        if (messageContent.startsWith('!menu ')) {
            const option = messageContent.split(' ')[1];

            switch (option) {
                case '1':
                    const menuGrupo = `
→  *MENU - GRUPO* ←
 
                   [ ADMINISTRATIVO ]

→ *!titulo=* - Altera o nome do grupo.
→ *!fechargrupo* - Fecha o grupo, permitindo apenas admin conversar.
→ *!abrirgrupo* - Abri o grupo, permitindo que todos conversem.
→ *!idgrupo* - Extrai o id do grupo.
→ *!promover* - Promove um membro a admin.
→ *!rebaixar* - Rebaixa um admin a membro.
→ *!mban* - Bani o membro pela mensagem dele.
→ *!ban* - Bani mencionando o membro.
→ *!apagar* - Apaga qualquer mensagem para todos.
→ *!refinir* - Redefini o link do grupo.
→ *!descricao* - Envia a descrição do grupo.
→ *!dono: Mostra informações sobre o dono do bot.
→ *!reportar* - Reporta uma mensagem ao dono bo bot.
→ *!mt* - Marcar todos do grupo, sem limite diário.
→ *!sortear* - Sorteia uma membro aleatório do grupo.
→ *!sortearm* - Sorteia uma membro dos mencionados.
→ *!bv* - Envia a mensagem de boas-vindas.
→ *!ativarbanlink* - Ativa a função banlink.
→ *!desativarbanlink* - Desativa a função banlink.

                       [ ANÚNCIO ]

→ *!anun1* - Envia um anúncio cadastrado no painel.
→ *!anun2* - Envia um anúncio cadastrado no painel.
→ *!anun3* - Envia um anúncio cadastrado no painel.

                       [ ANIVER ]

→ *!addaniver* -  Executa o comando seguindo de @pessoa Nome DD-MM.
→ *!listaraniver* - lista todos os aniversariantes.
→ *!listarmes* - lista os aniversarintes por mês.
→ *!raniver* - remover o i aniversariante.                       

                     [ LISTA NEGRA ]
                                   
→ *!addln* - !adlistanegra + 555184112140... adiciona na lista negra.
→ *!banln* - !blistanegra + @pessoa bani e adiciona a lista negra.
→ *!rln* - !rlistanegra + 555184112140... remove da lista negra.
→ *!listanegra* - Lista os números inclusos na lista negra do grupo.                     

Dúvidas sobre comandos? 
Use !guia + comando
*Exemplo:* !guia !promover
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuGrupo,
                        quoted: message 
                    });
                    break;

                case '2':
                    const menuDiversao = `
→ *MENU - DIVERSÃO* ←

→ *!nivelgolpe* - Calcula o nível de golpe do membro.
→ *!piada* - Conta uma piada aleatória.
→ *!cantada* - Conta uma cantada aleatória.
→ *!charada* - Conta uma charada aleatória.
→ *!nivelgolpe* - Mostra a porcetagem de golpe do membro.
→ *!par* - Mostra a porcentagem de compatibilidade do par.
→ *!top5* - Menciona 05 pessoas aleatórias com o tema escolhido.
→ *!bafometro* - Mostra a porcentagem do bafometro.
→ *!viadometro* - Mostra a porcentagem de viadrometro.
→ *!cara* - Da opções para para um escolher para o participante.
→ *!eununca* - Da frases para a crincadeira eu nunca.
→ *!sincerao* - Envia uma mensagem, mencionando um membro da brincadeira.

Dúvidas sobre comandos? 
Use !guia + comando
*Exemplo:* !guia !promover
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuDiversao,
                        quoted: message 
                    });
                    break;

                case '3':
                    const menuUtilidades = `
→ *MENU - UTILIDADES* ←

→ *!calcular* - Calcula qualquer cálculo matemático.
→ *!clima* - Previão do tempo atual por cidade.
→ *!hora* - Horário atual de São Paulo.
→ *!amigosecreto* - Distribui o amigo segreto e envia no PV.

Dúvidas sobre comandos? 
Use !guia + comando
*Exemplo:* !guia !promover
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuUtilidades,
                        quoted: message 
                    });
                    break;

                case '4':
                    const menuInteracao = `
→ *MENU - INTERAÇÃO* ←

→ *bom dia* - Responde com uma frase aleatória.
→ *boa tarde* - Responde com uma frase aleatória.
→ *boa noite* - Responde com uma frase aleatória.
→ *lola* - Responde com uma frase aleatória.
→ *lola te amo* - Responde com uma frase aleatória.
→ *lola cade voce* - Responde com uma frase aleatória.
→ *lola linda* - nResponde com uma frase aleatória.
→ *lola gostosa* - Responde com uma frase aleatória.
→ *oi* - Responde com uma frase aleatória.
→ *pix* - nResponde com uma frase aleatória.
→ *golpe* - Responde com uma frase aleatória.
→ *golpista* - Responde com uma frase aleatória.
→ 👀 - Responde o emoji com uma frase aleatória.
→ 🙄 - Responde o emoji com uma frase aleatória.
→ 🤔 - Responde o emoji com uma frase aleatória.
→ *sextou* - Responde com uma frase aleatória.

Dúvidas sobre comandos? 
Use !guia + comando
*Exemplo:* !guia !promover
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuInteracao,
                        quoted: message 
                    });
                    break;

                case '5':
                    const menuFuncoesAutomaticas = `
→ *MENU - FUNÇÕES AUTOMÁTICAS* ←

→ *ban link* - Bani quem postae link de grupo de whatsapp.
→ *ban lista negra* - Bani quem estiver na lista negra do grupo.
→ *bem vindo* - Envia mensagem de boas vindas a todos os membros.
→ *aniver* - Envia parabéns e troca o nome do grupo.

Dúvidas sobre comandos? 
Use !guia + comando
*Exemplo:* !guia !promover
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuFuncoesAutomaticas,
                        quoted: message 
                    });
                    break;

                case '6':
                    const menuDono = `
→ *MENU - DONO* ←

→ *!btodos* - Bani todos os membros do grupo, exeto admin.
→ *!sair* - Sai do grupo que foi executado o comando.
→ *!grupos* - Lista todos os grupos que o bot está.
→ *!desligar* - Desliga o bot.
→ *!entrar* - Comando + link... o bot entra no grupo.
→ *!limpar* - Limpa todas as mensagens dos grupos e privadas.
→ *!silenciargrupos* - Silencia todos os grupos que o bot está. 
→ *!rgativar* - Ativa a restrição de grupos.
→ *!rgdesativar* - Desativa a restrição de grupos.

Dúvidas sobre comandos? 
Use !guia + comando
*Exemplo:* !guia !promover
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuDono,
                        quoted: message 
                    });
                    break;

                default:
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: "Opção inválida, tente novamente!",
                        quoted: message 
                    });
            }
        }
    }
}

module.exports = { menu };