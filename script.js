(function () {
  "use strict";

  var content = birthdayContent;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var intro = document.getElementById("intro");
  var shell = document.getElementById("siteShell");
  var music = document.getElementById("birthdayMusic");
  var musicToggle = document.getElementById("musicToggle");
  var wishIndex = 0;
  var audioStarted = false;
  var audioUnavailable = false;
  var candleTimer = null;

  function text(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function releaseEmbers(candle) {
    for (var i = 0; i < 7; i += 1) {
      var ember = document.createElement("span");
      ember.className = "ember";
      ember.style.left = (candle.offsetWidth / 2 + (Math.random() * 14 - 7)) + "px";
      ember.style.top = "45px";
      ember.style.setProperty("--drift-x", (18 + Math.random() * 35) + "px");
      ember.style.setProperty("--drift-y", (-18 + Math.random() * 25) + "px");
      candle.appendChild(ember);
      window.setTimeout(function (particle) { particle.remove(); }, 800, ember);
    }
  }

  function extinguishCandle() {
    var candle = document.getElementById("candleButton");
    if (candle.classList.contains("is-out")) return;
    candle.classList.remove("is-blowing");
    candle.classList.add("is-out");
    releaseEmbers(candle);
    text("wishLine", content.cake.wish);
    document.getElementById("wishLine").hidden = false;
    candle.setAttribute("aria-label", content.cake.wish);
    burst();
  }

  function setupText() {
    document.title = content.meta.pageTitle;
    text("introEyebrow", content.meta.introEyebrow);
    text("introTitle", content.meta.introEyebrow);
    text("openButton", content.meta.introButton);
    text("heroEyebrow", content.meta.today);
    text("heroTitle", content.hero.title);
    text("heroSubtitle", content.hero.subtitle);
    text("wishesEyebrow", content.meta.labels.wishes);
    text("wishesHeading", content.wishes.heading);
    text("admirationsEyebrow", content.meta.labels.admirations);
    text("admirationsHeading", content.admirations.heading);
    text("admirationsHint", content.admirations.hint);
    text("twentiesEyebrow", content.meta.labels.twenties);
    text("twentiesHeading", content.twenties.heading);
    text("twentiesHint", content.twenties.hint);
    text("cakeEyebrow", content.meta.labels.cake);
    text("cakeHeading", content.cake.heading);
    text("cakeInstruction", content.cake.instruction);
    text("birthdayCompanionMessage", content.cake.companion);
    text("finalEyebrow", content.meta.labels.final);
    text("finalHeading", content.final.heading);
    text("finalMessage", content.final.message);
    text("finalMemory", content.final.memory);
    text("finalSignoff", content.final.signoff);
    text("finalName", content.final.name || content.meta.signedBy);
    text("replayButton", content.meta.replay);
    musicToggle.textContent = content.meta.mute;
    musicToggle.setAttribute("aria-label", content.meta.mute);
    document.getElementById("nextWish").textContent = content.meta.nextWish;
    document.getElementById("candleButton").setAttribute("aria-label", content.cake.instruction);
  }

  function createFloaters() {
    var container = document.querySelector(".floaters");
    for (var i = 0; i < 16; i += 1) {
      var floater = document.createElement("span");
      floater.className = "floater";
      floater.style.setProperty("--size", (8 + (i % 5) * 5) + "px");
      floater.style.setProperty("--left", ((i * 17) % 100) + "%");
      floater.style.setProperty("--top", ((i * 29) % 100) + "%");
      floater.style.setProperty("--duration", (9 + (i % 5) * 2) + "s");
      floater.style.setProperty("--delay", (-i * .7) + "s");
      container.appendChild(floater);
    }
  }

  function createSparkles() {
    var container = document.getElementById("heroSparkles");
    container.innerHTML = "";
    for (var i = 0; i < 9; i += 1) {
      var sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.style.left = (10 + ((i * 23) % 80)) + "%";
      sparkle.style.top = (10 + ((i * 37) % 75)) + "%";
      sparkle.style.animationDelay = (i * .14) + "s";
      container.appendChild(sparkle);
    }
  }

  function updateWish() {
    var stage = document.getElementById("wishStage");
    var card = stage.querySelector(".wish-card");
    var show = function () {
      stage.innerHTML = "";
      var newCard = document.createElement("article");
      newCard.className = "wish-card is-entering";
      newCard.textContent = content.wishes.cards[wishIndex];
      stage.appendChild(newCard);
      text("wishProgress", content.meta.wishProgress.replace("{current}", wishIndex + 1).replace("{total}", content.wishes.cards.length));
    };
    if (card && !reducedMotion) {
      card.classList.add("is-changing");
      window.setTimeout(show, 350);
    } else {
      show();
    }
  }

  function renderFlipCards() {
    var grid = document.getElementById("flipGrid");
    content.admirations.cards.forEach(function (cardData) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "flip-card";
      card.setAttribute("aria-label", cardData.trait);
      card.innerHTML = '<span class="flip-card__inner"><span class="flip-card__face flip-card__front"></span><span class="flip-card__face flip-card__back"></span></span>';
      card.querySelector(".flip-card__front").textContent = cardData.trait;
      card.querySelector(".flip-card__back").textContent = cardData.detail;
      card.addEventListener("click", function () {
        card.classList.toggle("is-flipped");
      });
      grid.appendChild(card);
    });
  }

  function renderEnvelopes() {
    var grid = document.getElementById("envelopeGrid");
    content.twenties.envelopes.forEach(function (note) {
      var envelope = document.createElement("button");
      envelope.type = "button";
      envelope.className = "envelope";
      envelope.setAttribute("aria-label", content.meta.openEnvelope + ": " + note.label);
      envelope.innerHTML = '<span class="envelope__flap" aria-hidden="true"></span><span class="envelope__seal" aria-hidden="true">✦</span><span class="envelope__label"></span><span class="envelope__message"></span>';
      envelope.querySelector(".envelope__label").textContent = note.label;
      envelope.querySelector(".envelope__message").textContent = note.message;
      envelope.addEventListener("click", function () {
        var open = envelope.classList.toggle("is-open");
        envelope.setAttribute("aria-label", (open ? content.meta.closeEnvelope : content.meta.openEnvelope) + ": " + note.label);
      });
      grid.appendChild(envelope);
    });
  }

  function playMusic() {
    if (audioUnavailable) return;
    music.volume = 0;
    var promise = music.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        audioUnavailable = true;
      });
    }

    var started = Date.now();
    var fade = function () {
      var progress = Math.min((Date.now() - started) / 2000, 1);
      music.volume = progress * .4;
      if (progress < 1 && !music.paused) window.requestAnimationFrame(fade);
    };
    window.requestAnimationFrame(fade);
    audioStarted = true;
  }

  music.addEventListener("error", function () {
    audioUnavailable = true;
  });

  music.addEventListener("ended", function () {
    if (audioUnavailable) return;
    music.currentTime = 0;
    var promise = music.play();
    if (promise && promise.catch) promise.catch(function () {});
  });

  function burst() {
    if (reducedMotion) return;
    var canvas = document.getElementById("confetti");
    var ctx = canvas.getContext("2d");
    var width = canvas.width = window.innerWidth * 2;
    var height = canvas.height = window.innerHeight * 2;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    var colors = ["#e8aeb5", "#c9c2e8", "#f5d8dc", "#c79452", "#fff8ee"];
    var pieces = [];
    for (var i = 0; i < 65; i += 1) pieces.push({ x: width / 2, y: height * .25, vx: (Math.random() - .5) * 12, vy: Math.random() * -10 - 4, size: 5 + Math.random() * 8, color: colors[i % colors.length], life: 1 });
    var draw = function () {
      ctx.clearRect(0, 0, width, height);
      pieces.forEach(function (piece) {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += .22;
        piece.life -= .012;
        ctx.globalAlpha = Math.max(piece.life, 0);
        ctx.fillStyle = piece.color;
        ctx.fillRect(piece.x, piece.y, piece.size, piece.size * .65);
      });
      ctx.globalAlpha = 1;
      if (pieces.some(function (piece) { return piece.life > 0; })) window.requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };
    window.requestAnimationFrame(draw);
  }

  function addRipple(event) {
    var button = event.currentTarget;
    button.classList.add("is-ripple");
    var ripple = document.createElement("span");
    var rect = button.getBoundingClientRect();
    ripple.className = "ripple";
    ripple.style.left = (event.clientX - rect.left) + "px";
    ripple.style.top = (event.clientY - rect.top) + "px";
    button.appendChild(ripple);
    window.setTimeout(function () { ripple.remove(); }, 700);
  }

  function startExperience() {
    intro.hidden = true;
    shell.hidden = false;
    shell.removeAttribute("aria-hidden");
    playMusic();
    burst();
    createSparkles();
    document.querySelectorAll(".reveal").forEach(function (section, index) {
      window.setTimeout(function () { section.classList.add("is-visible"); }, index * 180);
    });
  }

  function resetExperience() {
    window.scrollTo(0, 0);
    if (candleTimer) window.clearTimeout(candleTimer);
    candleTimer = null;
    wishIndex = 0;
    document.getElementById("wishStage").innerHTML = "";
    updateWish();
    document.querySelectorAll(".flip-card, .envelope").forEach(function (item) { item.classList.remove("is-flipped", "is-open"); });
    document.getElementById("candleButton").classList.remove("is-out", "is-blowing");
    document.getElementById("wishLine").hidden = true;
    intro.hidden = false;
    shell.hidden = true;
    shell.setAttribute("aria-hidden", "true");
    if (audioStarted) { music.pause(); music.currentTime = 0; audioStarted = false; }
  }

  function setupCountdown() {
    var now = new Date();
    var birthday = new Date(2026, 8, 23, 23, 59, 59);
    var days = Math.ceil((birthday - now) / 86400000);
    if (now < birthday) {
      var countdown = document.getElementById("countdown");
      countdown.hidden = false;
      countdown.textContent = days + " " + content.meta.countdownSuffix;
    }
  }

  setupText();
  createFloaters();
  renderFlipCards();
  renderEnvelopes();
  updateWish();
  setupCountdown();
  document.getElementById("openButton").addEventListener("click", startExperience);
  document.getElementById("nextWish").addEventListener("click", function (event) {
    addRipple(event);
    wishIndex = (wishIndex + 1) % content.wishes.cards.length;
    updateWish();
  });
  document.getElementById("candleButton").addEventListener("pointerdown", function () {
    if (!this.classList.contains("is-out")) {
      this.classList.add("is-blowing");
      candleTimer = window.setTimeout(extinguishCandle, 700);
    }
  });
  document.getElementById("candleButton").addEventListener("pointerup", function () {
    if (candleTimer) window.clearTimeout(candleTimer);
    candleTimer = null;
    extinguishCandle();
  });
  document.getElementById("candleButton").addEventListener("pointercancel", function () {
    if (candleTimer) window.clearTimeout(candleTimer);
    candleTimer = null;
    this.classList.remove("is-blowing");
  });
  document.getElementById("candleButton").addEventListener("click", extinguishCandle);
  document.getElementById("replayButton").addEventListener("click", resetExperience);
  document.querySelectorAll(".button").forEach(function (button) { button.addEventListener("click", addRipple); });
  musicToggle.addEventListener("click", function () {
    if (music.paused) {
      playMusic();
      musicToggle.textContent = content.meta.mute;
      musicToggle.setAttribute("aria-label", content.meta.mute);
    } else {
      music.pause();
      musicToggle.textContent = content.meta.unmute;
      musicToggle.setAttribute("aria-label", content.meta.unmute);
    }
  });
  var touchStartX = 0;
  document.getElementById("wishStage").addEventListener("touchstart", function (event) { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  document.getElementById("wishStage").addEventListener("touchend", function (event) {
    var distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) > 45) {
      wishIndex = (wishIndex + (distance < 0 ? 1 : content.wishes.cards.length - 1)) % content.wishes.cards.length;
      updateWish();
    }
  }, { passive: true });
}());
