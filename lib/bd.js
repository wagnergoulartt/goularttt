const { Message, Buttons, Client, MessageMedia, downloadMediaMessage } = require('@whiskeysockets/baileys');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  connectionLimit: 12,
  host: 'localhost',
  user: 'phpmyadmin',
  password: 'erick91492832',
  database: 'painelbot',
  connectTimeout: 60000
});

module.exports = pool;