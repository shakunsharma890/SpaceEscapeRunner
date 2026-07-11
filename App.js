import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0);
  const [shipX, setShipX] = useState(width / 2 - 20);
  const [asteroid, setAsteroid] = useState({ x: Math.random() * (width - 40), y: -50 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Restart Function
  const restartGame = () => {
    setScore(0);
    setShipX(width / 2 - 20);
    setAsteroid({ x: Math.random() * (width - 40), y: -50 });
    setIsGameOver(false);
  };

  // Load High Score when app starts
  useEffect(() => {
    const loadHighScore = async () => {
      const saved = await AsyncStorage.getItem('highScore');
      if (saved !== null) setHighScore(parseInt(saved));
    };
    loadHighScore();
  }, []);

  // Update High Score when game ends
  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('highScore', score.toString());
    }
  }, [isGameOver, score]);

  // Smooth Game Loop
  useEffect(() => {
    if (isGameOver) return;

    // We changed the interval from 50ms to 20ms to make it run closer to 60 frames per second
    const gameLoop = setInterval(() => {
      setAsteroid((prev) => {
        const shipY = height - 170;
        
        // Collision logic
        if (prev.y > shipY - 45 && prev.y < shipY + 50 && prev.x < shipX + 40 && prev.x + 40 > shipX) {
          setIsGameOver(true);
          return prev;
        }

        if (prev.y > height) {
          setScore((s) => s + 1);
          return { x: Math.random() * (width - 40), y: -50 };
        }
        // Lower step increment (6 instead of 15) makes the falling look buttery smooth
        return { ...prev, y: prev.y + 6 }; 
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [isGameOver, shipX]);

  const moveShip = (direction) => {
    const step = 40;
    if (direction === 'left') setShipX((prev) => Math.max(prev - step, 0));
    else setShipX((prev) => Math.min(prev + step, width - 40));
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
      {isGameOver ? (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScore}>Score: {score}</Text>
          <Text style={styles.highScore}>High Score: {highScore}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.buttonTextDark}>LAUNCH AGAIN</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.scoreBoard}>
            <Text style={styles.scoreText}>SCORE: {score}</Text>
            <Text style={styles.highScoreText}>HIGH: {highScore}</Text>
          </View>

          {/* Enhanced Asteroid with Craters */}
          <View style={[styles.asteroid, { left: asteroid.x, top: asteroid.y }]}>
            <View style={styles.crater1} />
            <View style={styles.crater2} />
          </View>

          {/* Enhanced Spaceship */}
          <View style={[styles.spaceship, { left: shipX }]}>
            <View style={styles.wingLeft} />
            <View style={styles.wingRight} />
            <View style={styles.shipTop} />
            <View style={styles.shipBody}>
                <View style={styles.window} />
            </View>
            <View style={styles.engineFlame} />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.moveButton} onPress={() => moveShip('left')}>
              <Text style={styles.buttonText}>◀ LEFT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moveButton} onPress={() => moveShip('right')}>
              <Text style={styles.buttonText}>RIGHT ▶</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  
  // Modern Score UI (Glassmorphism effect)
  scoreBoard: { marginTop: 70, flexDirection: 'row', width: '85%', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.4)', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scoreText: { fontSize: 18, color: '#00f2fe', fontWeight: 'bold', letterSpacing: 1 },
  highScoreText: { fontSize: 18, color: '#f5d300', fontWeight: 'bold', letterSpacing: 1 },
  
  // Game Over UI
  gameOverOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', width: '100%' },
  gameOverText: { fontSize: 50, fontWeight: '900', color: '#ff0844', textShadowColor: '#ffb199', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  finalScore: { fontSize: 24, color: '#ffffff', marginTop: 20, fontWeight: 'bold' },
  highScore: { fontSize: 20, color: '#f5d300', marginTop: 10 },
  restartButton: { marginTop: 40, backgroundColor: '#00f2fe', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 5 },
  
  // Controls
  controls: { position: 'absolute', bottom: 40, flexDirection: 'row', gap: 20, width: '100%', justifyContent: 'center' },
  moveButton: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 20, paddingHorizontal: 30, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  buttonTextDark: { color: '#000000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  // Detailed Asteroid
  asteroid: { position: 'absolute', width: 45, height: 45, backgroundColor: '#757575', borderRadius: 22.5, borderWidth: 2, borderColor: '#424242', overflow: 'hidden' },
  crater1: { position: 'absolute', width: 12, height: 12, backgroundColor: '#424242', borderRadius: 6, top: 8, left: 8 },
  crater2: { position: 'absolute', width: 18, height: 18, backgroundColor: '#424242', borderRadius: 9, bottom: 6, right: 6 },

  // Detailed Spaceship
  spaceship: { position: 'absolute', bottom: 120, alignItems: 'center', width: 40 },
  shipTop: { width: 0, height: 0, borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 20, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#f5f5f5', zIndex: 2 },
  shipBody: { width: 30, height: 40, backgroundColor: '#f5f5f5', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, alignItems: 'center', zIndex: 2 },
  window: { width: 14, height: 14, backgroundColor: '#00f2fe', borderRadius: 7, marginTop: 5 },
  wingLeft: { position: 'absolute', top: 25, left: -10, width: 0, height: 0, borderTopWidth: 20, borderRightWidth: 15, borderBottomWidth: 0, borderLeftColor: 'transparent', borderRightColor: '#bdbdbd', borderBottomColor: 'transparent' },
  wingRight: { position: 'absolute', top: 25, right: -10, width: 0, height: 0, borderTopWidth: 20, borderLeftWidth: 15, borderBottomWidth: 0, borderRightColor: 'transparent', borderLeftColor: '#bdbdbd', borderBottomColor: 'transparent' },
  engineFlame: { width: 14, height: 18, backgroundColor: '#ff9a9e', borderBottomLeftRadius: 7, borderBottomRightRadius: 7, marginTop: -2 }
});