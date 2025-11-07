const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 15
  },
  socketId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  health: {
    type: Number,
    default: 100
  },
  position: {
    x: { type: Number, default: 400 },
    y: { type: Number, default: 300 }
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema);
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// الاتصال بقاعدة البيانات MongoDB
mongoose.connect('mongodb://localhost:27017/alpha_arena', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// نموذج اللاعب
const Player = require('./models/Player');

// تخزين اللاعبين المتصلين حالياً
const connectedPlayers = new Map();

// أحداث Socket.io
io.on('connection', (socket) => {
  console.log('لاعب متصل:', socket.id);

  // انضمام لاعب جديد
  socket.on('player_join', async (playerData) => {
    const { name, x, y } = playerData;
    
    // حفظ اللاعب في قاعدة البيانات
    let player = await Player.findOne({ name });
    if (!player) {
      player = new Player({ 
        name, 
        socketId: socket.id,
        position: { x, y }
      });
    } else {
      player.socketId = socket.id;
      player.isOnline = true;
      player.lastSeen = new Date();
    }
    
    await player.save();
    
    // تخزين في الذاكرة
    connectedPlayers.set(socket.id, {
      id: socket.id,
      name: name,
      position: { x: x || 400, y: y || 300 },
      score: player.score || 0,
      health: player.health || 100
    });

    // إعلام جميع اللاعبين
    io.emit('player_joined', {
      player: connectedPlayers.get(socket.id),
      allPlayers: Array.from(connectedPlayers.values())
    });

    // إرسال قائمة اللاعبين الحاليين
    socket.emit('current_players', Array.from(connectedPlayers.values()));
  });

  // حركة اللاعب
  socket.on('player_move', (data) => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      player.position = data.position;
      io.emit('player_moved', {
        playerId: socket.id,
        position: data.position
      });
    }
  });

  // إطلاق النار
  socket.on('player_shoot', (data) => {
    io.emit('bullet_created', {
      playerId: socket.id,
      position: data.position,
      direction: data.direction
    });
  });

  // تحديث النقاط
  socket.on('update_score', async (data) => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      player.score += data.points;
      
      // تحديث في قاعدة البيانات
      await Player.findOneAndUpdate(
        { socketId: socket.id },
        { 
          $inc: { score: data.points },
          lastSeen: new Date()
        }
      );
      
      io.emit('score_updated', {
        playerId: socket.id,
        score: player.score
      });
    }
  });

  // رسالة شات
  socket.on('chat_message', (data) => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      io.emit('new_message', {
        player: player.name,
        message: data.message,
        timestamp: new Date()
      });
    }
  });

  // فصل اللاعب
  socket.on('disconnect', async () => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      // تحديث حالة الاتصال في قاعدة البيانات
      await Player.findOneAndUpdate(
        { socketId: socket.id },
        { 
          isOnline: false,
          lastSeen: new Date()
        }
      );
      
      connectedPlayers.delete(socket.id);
      io.emit('player_left', socket.id);
    }
    console.log('لاعب انقطع:', socket.id);
  });
});

// routes API
app.get('/api/leaderboard', async (req, res) => {
  try {
    const topPlayers = await Player.find()
      .sort({ score: -1 })
      .limit(10)
      .select('name score -_id');
    
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب البيانات' });
  }
});

app.get('/api/online-players', (req, res) => {
  res.json(Array.from(connectedPlayers.values()));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
}); const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alpha_arena', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB متصل: ${conn.connection.host}`);
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 
// ==================== نظام الأونلاين الحقيقي - الاتصال الفعلي
let socket = null;
let isConnected = false;
let currentPlayerId = null;

// الاتصال بالخادم
function connectToRealServer() {
    try {
        // تأكد من أن مكتبة Socket.io مضمنة في HTML
        // <script src="/socket.io/socket.io.js"></script>
        
        socket = io(); // الاتصال تلقائياً مع نفس النطاق
        
        socket.on('connect', () => {
            console.log('✅ متصل بالخادم بنجاح');
            isConnected = true;
            currentPlayerId = socket.id;
            
            updateConnectionStatus(true);
            joinGame();
        });
        
        socket.on('disconnect', () => {
            console.log('❌ انقطع الاتصال بالخادم');
            isConnected = false;
            updateConnectionStatus(false);
        });
        
        socket.on('current_players', (players) => {
            updateOnlinePlayersList(players);
        });
        
        socket.on('player_joined', (data) => {
            addNewPlayer(data.player);
            updateOnlinePlayersList(data.allPlayers);
        });
        
        socket.on('player_moved', (data) => {
            moveOtherPlayer(data.playerId, data.position);
        });
        
        socket.on('player_left', (playerId) => {
            removePlayer(playerId);
        });
        
        socket.on('bullet_created', (data) => {
            if (data.playerId !== currentPlayerId) {
                createEnemyBullet(data.position, data.direction);
            }
        });
        
        socket.on('new_message', (data) => {
            addChatMessage(data.player, data.message, data.timestamp, false);
        });
        
        socket.on('score_updated', (data) => {
            updatePlayerScore(data.playerId, data.score);
        });
        
    } catch (error) {
        console.error('خطأ في الاتصال:', error);
        showError('فشل الاتصال بالخادم');
    }
}

// الانضمام إلى اللعبة
function joinGame() {
    const playerName = document.getElementById('playerNameInput').value || `Player${Math.floor(Math.random() * 1000)}`;
    const playerPosition = getPlayerPosition();
    
    socket.emit('player_join', {
        name: playerName,
        x: playerPosition.x,
        y: playerPosition.y
    });
}

// إرسال حركة اللاعب
function sendPlayerMovement(position) {
    if (isConnected && socket) {
        socket.emit('player_move', {
            position: position
        });
    }
}

// إرسال إطلاق النار
function sendBulletCreation(position, direction) {
    if (isConnected && socket) {
        socket.emit('player_shoot', {
            position: position,
            direction: direction
        });
    }
}

// إرسال رسالة شات
function sendRealChatMessage(message) {
    if (isConnected && socket) {
        socket.emit('chat_message', {
            message: message
        });
    }
}

// تحديث النقاط على الخادم
function updateServerScore(points) {
    if (isConnected && socket) {
        socket.emit('update_score', {
            points: points
        });
    }
}

// تحديث حالة الاتصال في الواجهة
function updateConnectionStatus(connected) {
    const indicator = document.getElementById('connectionIndicator');
    const status = document.getElementById('connectionStatus');
    const notification = document.getElementById('onlineNotification');
    
    if (connected) {
        indicator.className = 'status-indicator connected';
        status.textContent = 'متصل بالخادم';
        notification.textContent = '✅ متصل بالخادم الحقيقي!';
        notification.style.background = 'rgba(29, 209, 161, 0.9)';
    } else {
        indicator.className = 'status-indicator';
        status.textContent = 'غير متصل';
        notification.textContent = '❌ انقطع الاتصال';
        notification.style.background = 'rgba(255, 107, 107, 0.9)';
    }
    
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// تحديث قائمة اللاعبين المتصلين
function updateOnlinePlayersList(players) {
    const playersList = document.getElementById('playersList');
    const playersCount = document.getElementById('playersCount');
    
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const isCurrent = player.id === currentPlayerId;
        const playerItem = document.createElement('div');
        playerItem.className = `player-item ${isCurrent ? 'current' : ''}`;
        playerItem.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-score">${player.score}</div>
            <div class="player-status ${isCurrent ? '' : 'offline'}"></div>
        `;
        playersList.appendChild(playerItem);
    });
    
    playersCount.textContent = players.length;
}

// إضافة لاعب جديد
function addNewPlayer(playerData) {
    // إنشاء عنصر لاعب جديد في اللعبة
    createOtherPlayer(playerData.id, playerData.name, playerData.position);
    
    // إضافة رسالة ترحيب في الشات
    addChatMessage('System', `انضم ${playerData.name} إلى اللعبة`, new Date(), true);
}

// حركة لاعب آخر
function moveOtherPlayer(playerId, position) {
    const otherPlayer = document.getElementById(`player-${playerId}`);
    if (otherPlayer) {
        otherPlayer.style.left = position.x + 'px';
        otherPlayer.style.top = position.y + 'px';
    }
}

// إزالة لاعب
function removePlayer(playerId) {
    const playerElement = document.getElementById(`player-${playerId}`);
    if (playerElement) {
        playerElement.remove();
    }
    
    // تحديث القائمة
    if (socket) {
        socket.emit('get_online_players');
    }
}

// تحديث النقاط في القائمة
function updatePlayerScore(playerId, score) {
    const playerElement = document.querySelector(`[data-player-id="${playerId}"] .player-score`);
    if (playerElement) {
        playerElement.textContent = score;
    }
}

// إنشاء رصاصة الخصم
function createEnemyBullet(position, direction) {
    const bullet = document.createElement('div');
    bullet.className = 'bullet enemy-bullet';
    bullet.style.left = position.x + 'px';
    bullet.style.top = position.y + 'px';
    document.getElementById('gameArea').appendChild(bullet);
    
    // حركة الرصاصة
    moveBullet(bullet, direction, false);
}

// إضافة رسالة شات حقيقية
function addChatMessage(sender, message, timestamp, isSystem = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSystem ? 'system' : ''}`;
    
    const timeString = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    
    if (isSystem) {
        messageDiv.innerHTML = `<div>${message} - ${timeString}</div>`;
    } else {
        messageDiv.innerHTML = `
            <div class="message-sender">${sender}:</div>
            <div>${message}</div>
            <div style="font-size:0.8em;color:#888;text-align:left;">${timeString}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// استبدال دالة إرسال الرسالة الأصلية
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    if (isConnected) {
        sendRealChatMessage(message);
    } else {
        // وضع عدم الاتصال
        const playerName = document.getElementById('playerNameInput').value || 'أنت';
        addChatMessage(playerName, message, new Date(), false);
    }
    
    chatInput.value = '';
}

// تحديث زر الأونلاين
document.getElementById('onlineToggle').addEventListener('click', function() {
    if (!isConnected) {
        connectToRealServer();
    }
});

// بدء الاتصال تلقائياً عند تحميل الصفحة
window.addEventListener('load', function() {
    setTimeout(connectToRealServer, 1000);
});
