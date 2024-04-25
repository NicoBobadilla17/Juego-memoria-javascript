const selectors = { /* la const selectors define elementos HTML importantes para el juego. 
Estos elementos son seleccionados usando document.querySelector con clases específicas.  */
    boardContainer: document.querySelector('.contenedor-cartas'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    ganar: document.querySelector('.ganar')
}

const state = {  /*state: Este objeto mantiene el estado del juego. 
Inicialmente, el juego no ha comenzado (gameStarted: false). 
Se mantiene un seguimiento de cuántas cartas han dado vuelta  
(flippedCards), 
el número total de volteos (totalFlips), 
el tiempo total (totalTime) y
un bucle de intervalo (loop) 
para actualizar el temporizador. */
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {/*shuffle: Esta función toma un array como 
entrada y devuelve una nueva matriz con los elementos 
mezclados. */
    const clonedArray = [...array]

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const original = clonedArray[i]

        clonedArray[i] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}
/*pickRandom: Esta función elige un número 
 de elementos de una matriz y devuelve esos elementos 
como una nueva matriz.*/ 
const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}
/*generateGame: Esta función genera el juego. Extrae la dimensión 
del tablero 
Despues, selecciona aleatoriamente una serie de emojis y los duplica 
para emparejarlos. 
Luego genera el HTML necesario para representar las cartas y 
las coloca en el tablero. analiza el DOM para convertir 
la cadena HTML en elementos DOM reales y los reemplaza . */
const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')  

    if (dimensions % 2 !== 0) {
        throw new Error("La dimensión del tablero debe ser un número par..")
    }

    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍']
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2) 
    const items = shuffle([...picks, ...picks])
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `
    
    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
}
/*tartGame: Esta función inicia el juego actualiza el estado gameStarted a 
true, agrega una clase disabled al botón de inicio para evitar que se haga 
clic nuevamente y comienza un bucle de intervalo que actualiza el contador 
de movimientos y el temporizador cada segundo. */
const startGame = () => {
    state.gameStarted = true
    selectors.start.classList.add('disabled')

    state.loop = setInterval(() => {
        state.totalTime++

        selectors.moves.innerText = `${state.totalFlips} Movimientos`
        selectors.timer.innerText = `Tiempo: ${state.totalTime} seg`
    }, 1000)
}
/*flipBackCards: esta función invierte todas las cartas que no están 
emparejadas y sino las da vuelta de nuevo. */
const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}
/*flipCard: esta función maneja el evento de voltear carta.
 suma el contador de cartas volteadas y el contador total de volteos. 
 Si es la primera o segunda carta volteada, la marca como "volteada". 
 Si se han volteado dos cartas, mira si son iguales. Si son iguales, 
 las marca como "emparejadas". Luego, espera un segundo y luego invierte 
 todas las cartas no emparejadas.*/
const flipCard = card => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame()
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }

        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="texto_ganador">
                    Ganaste!<br />
                    Con <span class="highlight">${state.totalFlips}</span> movimientos<br />
                    en <span class="highlight">${state.totalTime}</span> segundos
                </span>
            `

            clearInterval(state.loop)
        }, 1000)
    }
}
/*attachEventListeners: Esta función junta los controladores de eventos 
necesarios para el juego escucha los clics en las cartas y en el botón de 
inicio.*/
const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}
/*estos dos genera el juego y los controladores de eventos se 
y todo comienza de nuevo automáticamente cuando se carga la página. */
generateGame()
attachEventListeners()