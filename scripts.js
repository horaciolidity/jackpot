const reels = document.querySelectorAll('.reel');
const spinButton = document.querySelector('.spin');
const creditDisplay = document.querySelector('.credit');
const betDisplay = document.querySelector('.bet');
const winningsDisplay = document.querySelector('.winnings');
const increaseBetButton = document.querySelector('.increase-bet');
const decreaseBetButton = document.querySelector('.decrease-bet');

let credit = 20; // Crédito inicial
let bet = 2; // Apuesta por giro
let activeLines = 1; // Líneas activas, línea 3 (central) siempre activa

const spinSpeed = 100; // Velocidad de cambio entre imágenes
const numSpins = 20; // Número de veces que cada columna "gira"

// Pagos para diferentes combinaciones
const payouts = {
    'https://jackpot-peach.vercel.app/img1.png': { 3: 8, 4: 15, 5: 275 },
    'https://jackpot-peach.vercel.app/img2.png': { 3: 3, 4: 6, 5: 15 },
    'https://jackpot-peach.vercel.app/img3.png': { 3: 3, 4: 8, 5: 20 },
    'https://jackpot-peach.vercel.app/img4.png': { 3: 6, 4: 10, 5: 40 },
    'https://jackpot-peach.vercel.app/img5.png': { 3: 2, 4: 4, 5: 10 },
    'https://jackpot-peach.vercel.app/img6.png': { 3: 6, 4: 11, 5: 50 },
    'https://jackpot-peach.vercel.app/img7.png': { 3: 8, 4: 13, 5: 80 },
    'https://jackpot-peach.vercel.app/img8.png': { 3: 1, 4: 3, 5: 7 },
};

// Función para dibujar las líneas activas
function drawActiveLines() {
    const linesContainer = document.querySelector('.lines-container');
    linesContainer.innerHTML = '';

    const lineHeight = 100 / 5; // Altura en porcentaje para cada fila

    // Array con posiciones de las líneas
    const linePositions = [0, 1, 2, 3, 4];

    linePositions.slice(2 - Math.floor((activeLines - 1) / 2), 3 + Math.floor((activeLines - 1) / 2)).forEach((lineIndex) => {
        const line = document.createElement('div');
        line.className = 'active-line';
        line.style.top = `${lineIndex * lineHeight}%`;
        linesContainer.appendChild(line);
    });
}

// Función para actualizar la cantidad de líneas activas y la apuesta
function updateBet() {
    switch (activeLines) {
        case 1:
            bet = 2; // Solo la línea central (3)
            break;
        case 3:
            bet = 6; // Líneas 2, 3, 4
            break;
        case 5:
            bet = 10; // Todas las líneas 1 a 5
            break;
    }
    updateDisplay(0); // Actualiza la pantalla sin ganancias
    drawActiveLines(); // Redibujar las líneas activas
}

// Función para incrementar la apuesta
increaseBetButton.addEventListener('click', () => {
    if (activeLines < 5) {
        activeLines += 2; // Incrementar de 1 a 3 y de 3 a 5 líneas
        updateBet();
    }
});

// Función para disminuir la apuesta
decreaseBetButton.addEventListener('click', () => {
    if (activeLines > 1) {
        activeLines -= 2; // Decrementar de 5 a 3 y de 3 a 1 líneas
        updateBet();
    }
});

// Función para girar una columna
function spinReel(reel, numSpins) {
    return new Promise(resolve => {
        let currentSpin = 0;

        function spin() {
            const lastChild = reel.lastElementChild;
            reel.insertBefore(lastChild, reel.firstElementChild);

            currentSpin++;

            if (currentSpin < numSpins) {
                setTimeout(spin, spinSpeed);
            } else {
                resolve();
            }
        }

        spin();
    });
}



  
// Función para iniciar el giro de todas las columnas
function startSpinning() {
    if (credit < bet) {
        alert("No tienes suficiente crédito para continuar.");
        return;
    }

    credit -= bet; // Descontar la apuesta del crédito
    updateDisplay(0); // Mostrar el crédito actualizado

    // Barajar las imágenes de cada columna de manera diferente
    reels.forEach(reel => {
        const images = Array.from(reel.querySelectorAll('img'));
        shuffle(images);
        images.forEach(img => reel.appendChild(img));
    });

    const spinPromises = Array.from(reels).map((reel) => {
        const spinsForThisReel = numSpins + Math.floor(Math.random() * 10);
        return spinReel(reel, spinsForThisReel);
    });

    Promise.all(spinPromises).then(() => {
        const winnings = checkForMatches();
        credit += winnings;
        updateDisplay(winnings);
      
       
        // Comprobar si el crédito ha llegado a cero después del giro
        if (credit <= 0) {
            setTimeout(checkForReload, 500); // Llamar a la función de recarga después de una pausa
        }
    });
}

// Función para mostrar y manejar la recarga de crédito
function checkForReload() {
    let reload = confirm("Se acabó el crédito. ¿Desea recargar?");
    if (reload) {
        credit = 10;  // Recargar el crédito a su valor inicial
        alert("Crédito recargado. ¡Buena suerte!");
        updateDisplay(0); // Actualizar la pantalla con el crédito recargado
    } else {
        alert("Gracias por jugar. Vuelve pronto.");
        // Aquí puedes desactivar botones u otros elementos si lo deseas
    }
}



  
// Función para obtener las imágenes de cada fila
function getLineImages() {
    const imagesMatrix = [];
    for (let row = 0; row < 5; row++) {
        imagesMatrix[row] = [];
        reels.forEach(reel => {
            const img = reel.querySelectorAll('img')[row];
            imagesMatrix[row].push(img.src);
        });
    }
    return imagesMatrix;
}

// Función para verificar las coincidencias
function checkForMatches() {
    const lineImages = getLineImages();
    let totalWinnings = 0;
    const matchedSymbols = {};

    // Líneas a verificar basadas en las líneas activas
    const linesToCheck = {
        1: [2], // Solo línea central (3)
        3: [1, 2, 3], // Líneas 2, 3, 4
        5: [0, 1, 2, 3, 4] // Todas las líneas 1 a 5
    };

    const lines = linesToCheck[activeLines];

    lines.forEach(lineIndex => {
        const symbols = lineImages[lineIndex];
        const symbolCounts = symbols.reduce((acc, symbol) => {
            acc[symbol] = (acc[symbol] || 0) + 1;
            return acc;
        }, {});

        // Verificar si hay 3, 4 o 5 símbolos iguales en la línea
        Object.keys(symbolCounts).forEach(symbol => {
            const count = symbolCounts[symbol];
            if (count >= 3 && payouts[symbol] && payouts[symbol][count]) {
                highlightMatch(lineIndex, symbol);
                totalWinnings += payouts[symbol][count] * (bet / activeLines);
                matchedSymbols[symbol] = matchedSymbols[symbol] || [];
                matchedSymbols[symbol].push(lineIndex);
                playSound(count);
            }
        });
    });

    return totalWinnings;
}

// Función para resaltar las coincidencias en la línea
function highlightMatch(lineIndex, symbol) {
    // Recorremos todas las columnas, resaltamos solo las imágenes en la línea activa
    reels.forEach((reel, idx) => {
        const img = reel.querySelectorAll('img')[lineIndex];
        if (img.src === symbol) {
            img.classList.add('highlight'); // Resalta la imagen coincidente
        } else {
            img.classList.remove('highlight');
        }
    });

    // Asegura que solo se agranden las imágenes de las coincidencias y se mantengan fijas después
    setTimeout(() => {
        reels.forEach((reel, idx) => {
            const img = reel.querySelectorAll('img')[lineIndex];
            if (img.src === symbol) {
                img.classList.add('highlight-twice'); // Agranda las imágenes coincididas
                setTimeout(() => img.classList.remove('highlight-twice'), 1000); // Elimina el agrandamiento después de 1 segundo
            }
        });
    }, 500);
}

// Función para actualizar la pantalla
function updateDisplay(winnings) {
    creditDisplay.textContent = `Crédito: $${credit}`;
    betDisplay.textContent = `Apuesta: $${bet}`;

    winningsDisplay.textContent = `Ganancias: $${winnings}`;
    
    // Resalta las ganancias si hay premio
    if (winnings > 0) {
        winningsDisplay.classList.add('highlight');
        setTimeout(() => {
            winningsDisplay.classList.remove('highlight');
        }, 1000); // Duración de la animación
    }
}
  function playSound(matches) {
    if (matches === 3) {
        document.getElementById('sound-three').play();
    } else if (matches === 4) {
        document.getElementById('sound-four').play();
    } else if (matches === 5) {
        document.getElementById('sound-five').play();
    }
}
 function showConfetti() {
      console.log('Mostrando confeti'); // Mensaje de depuración
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    function handleWin(amount) {
      console.log('handleWin llamado con cantidad:', amount); // Mensaje de depuración
      const winningsElement = document.querySelector('winnings');
      if (winningsElement) {
        winningsElement.textContent = `Ganancias: $${amount}`;
        showConfetti();
      } else {
        console.error('Elemento con clase "winnings" no encontrado.');
      }
    }

    // Prueba la función handleWin después de 2 segundos
    setTimeout(() => handleWin(50), 2000);


// Barajar imágenes de manera aleatoria
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Añadir evento al botón de girar
spinButton.addEventListener('click', startSpinning);

// Inicializar la visualización de apuestas y líneas
updateBet();
