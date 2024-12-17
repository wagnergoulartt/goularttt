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
            const menuPrincipal = `
──────────────────────────  
                *MENU PRINCIPAL*
──────────────────────────
!menu 1 -> *GRUPO*
!menu 2 -> *DIVERSÃO*
!menu 3 -> *UTILIDADES*
!menu 4 -> *INTERAÇÃO*
!menu 5 -> *FUNÇÕES AUTOMÁTICAS*
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
──────────────────────────  
                → *MENU - ADMIN* ←
──────────────────────────
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuGrupo,
                        quoted: message 
                    });
                    break;

                case '2':
                    const menuDiversao = `
──────────────────────────  
                → *MENU - DIVERSÃO* ←
──────────────────────────
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuDiversao,
                        quoted: message 
                    });
                    break;

                case '3':
                    const menuUtilidades = `
──────────────────────────  
                → *MENU - UTILIDADES* ←
──────────────────────────
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuUtilidades,
                        quoted: message 
                    });
                    break;

                case '4':
                    const menuInteracao = `
──────────────────────────  
                → *MENU - INTERAÇÃO* ←
──────────────────────────
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuInteracao,
                        quoted: message 
                    });
                    break;

                case '5':
                    const menuFuncoesAutomaticas = `
──────────────────────────  
                → *MENU - FUNÇÕES AUTOMÁTICAS* ←
──────────────────────────
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
                    `;
                    await sock.sendMessage(messageInfo.metadata.from, { 
                        text: menuFuncoesAutomaticas,
                        quoted: message 
                    });
                    break;

                case '6':
                    const menuDono = `
──────────────────────────  
                → *MENU - DONO* ←
──────────────────────────
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
→ *!teste* - Essa é uma função de teste, para ver como está o menu.
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
