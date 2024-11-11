const SUITS = ["♠", "♣", "♥", "♦"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
  }

  get color() {
    return ["♠", "♣"].includes(this.suit) ? "black" : "red";
  }
}

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;
let timeoutID;

document.getElementById("deal-button").addEventListener("click", dealCards);
document.getElementById("hit-button").addEventListener("click", playerHit);
document.getElementById("stand-button").addEventListener("click", playerStand);
document.getElementById("restart-button").addEventListener("click", restartGame);

function createDeck() {
  deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push(new Card(value, suit));
    }
  }
  deck = deck.sort(() => Math.random() - 0.5);
}

function createCardElement(card, isHidden = false) {
  const cardDiv = document.createElement("div");
  cardDiv.className = `card${isHidden ? " hidden" : ""}`;

  let imagePath;
  if (isHidden) {
    imagePath = `cards/back.png`;
  } else {
    const suitName = card.suit.toLowerCase().replace("♠", "spades").replace("♣", "clubs").replace("♥", "hearts").replace("♦", "diamonds");
    const valueName = card.value === "A" ? "ace" : card.value === "K" ? "king" : card.value === "Q" ? "queen" : card.value === "J" ? "jack" : card.value;
    imagePath = `cards/${valueName}_of_${suitName}.png`;
  }

  cardDiv.innerHTML = `
    <div class="card-inner">
        <div class="card-front">
            <img src="${imagePath}" alt="${card.value} of ${card.suit}" class="card-image">
        </div>
        <div class="card-back"></div>
    </div>
  `;

  return cardDiv;
}

function dealCards() {
  createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  gameActive = true;

  document.getElementById("dealer-cards").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";

  document.getElementById("dealer-score").innerText = "";

  dealerHand.forEach((card, index) => {
    const cardElement = createCardElement(card, index === 1);
    document.getElementById("dealer-cards").appendChild(cardElement);
  });

  playerHand.forEach((card) => {
    const cardElement = createCardElement(card, false);
    document.getElementById("player-cards").appendChild(cardElement);
  });

  updateScores();
  toggleButtons(true);
  checkGameState();
}

function playerHit() {
  if (!gameActive) return;
  const newCard = deck.pop();
  playerHand.push(newCard);
  const cardElement = createCardElement(newCard, false);
  document.getElementById("player-cards").appendChild(cardElement);

  updateScores();
  checkGameState();
}

function playerStand() {
  if (!gameActive) return;
  gameActive = false;

  const hiddenCard = document.querySelector(".card.hidden");
  if (hiddenCard) {
    hiddenCard.classList.remove("hidden");
    hiddenCard.querySelector(".card-image").src = getCardImagePath(dealerHand[1]);
  }

  while (getHandValue(dealerHand) < 17) {
    const newCard = deck.pop();
    dealerHand.push(newCard);
    const cardElement = createCardElement(newCard, false);
    document.getElementById("dealer-cards").appendChild(cardElement);
  }

  updateScores(true);
  checkGameState();
}

function updateScores(showDealerScore = false) {
  const playerScore = getHandValue(playerHand);
  document.getElementById("player-score").innerText = `Your Score: ${playerScore}`;

  if (showDealerScore) {
    const dealerScore = getHandValue(dealerHand);
    document.getElementById("dealer-score").innerText = `Dealer Score: ${dealerScore}`;
  }
}

function getCardImagePath(card) {
  const suitName = card.suit.toLowerCase().replace("♠", "spades").replace("♣", "clubs").replace("♥", "hearts").replace("♦", "diamonds");
  const valueName = card.value === "A" ? "ace" : card.value === "K" ? "king" : card.value === "Q" ? "queen" : card.value === "J" ? "jack" : card.value;
  return `cards/${valueName}_of_${suitName}.png`;
}

function getHandValue(hand) {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === "A") {
      value += 11;
      aces += 1;
    } else if (["K", "Q", "J"].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
}

function checkGameState() {
  const playerScore = getHandValue(playerHand);
  const dealerScore = getHandValue(dealerHand);
  const resultElement = document.getElementById("result");

  if (playerScore > 21) {
    resultElement.innerText = "Bust! You lose.";
    resultElement.className = "result lose";
    gameActive = false;
    document.getElementById("deal-button").style.display = "none";
    document.getElementById("hit-button").style.display = "none";
    document.getElementById("stand-button").style.display = "none";
    document.getElementById("restart-button").style.display = "inline-block";
    timeoutID = setTimeout(restartGame, 7000);
  } else if (playerScore == 21) {
    resultElement.innerText = "It's a BlackJack! You win!";
    resultElement.className = "result win";
    toggleButtons(false);
    document.getElementById("deal-button").style.display = "none";
    document.getElementById("restart-button").style.display = "inline-block";
    timeoutID = setTimeout(restartGame, 7000);
  } else if (!gameActive) {
    if (dealerScore > 21) {
      resultElement.innerText = "Dealer busts! You win!";
      resultElement.className = "result win";
    } else if (playerScore > dealerScore) {
      resultElement.innerText = "You win!";
      resultElement.className = "result win";
    } else if (playerScore === dealerScore) {
      resultElement.innerText = "Push! It's a tie!";
      resultElement.className = "result";
    } else {
      resultElement.innerText = "Dealer wins!";
      resultElement.className = "result lose";
    }
    toggleButtons(false);
    document.getElementById("deal-button").style.display = "none";
    document.getElementById("restart-button").style.display = "inline-block";
    timeoutID = setTimeout(restartGame, 7000);
  }
}

function toggleButtons(enable) {
  document.getElementById("hit-button").style.display = enable ? "inline-block" : "none";
  document.getElementById("stand-button").style.display = enable ? "inline-block" : "none";
  document.getElementById("deal-button").style.display = enable ? "none" : "inline-block";
}

function restartGame() {
  clearTimeout(timeoutID);
  document.getElementById("dealer-cards").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";
  document.getElementById("dealer-score").innerText = "";
  document.getElementById("player-score").innerText = "";
  document.getElementById("result").innerText = "";
  document.getElementById("result").className = "result";
  toggleButtons(false);
  gameActive = false;
  document.getElementById("deal-button").style.display = "inline-block";
  document.getElementById("restart-button").style.display = "none";
}