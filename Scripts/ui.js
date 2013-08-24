/// <reference path="jquery-2.0.2.js" />


var ui = (function () {

    function buildLoginForm() {
        var html =
            '<div id="login-form-holder">' +
				'<form>' +
					'<div id="login-form">' +
						'<label for="tb-login-username">Username: </label>' +
						'<input type="text" id="tb-login-username"><br />' +
						'<label for="tb-login-password">Password: </label>' +
						'<input type="password" id="tb-login-password"><br />' +
						'<button id="btn-login" class="button">Login</button>' +
					'</div>' +
					'<div id="register-form" style="display: none">' +
						'<label for="tb-register-username">Username: </label>' +
						'<input type="text" id="tb-register-username"><br />' +
						'<label for="tb-register-nickname">Nickname: </label>' +
						'<input type="text" id="tb-register-nickname"><br />' +
						'<label for="tb-register-password">Password: </label>' +
						'<input type="password" id="tb-register-password"><br />' +
						'<button id="btn-register" class="button">Register</button>' +
					'</div>' +
					'<a href="#" id="btn-show-login" class="button selected">Login</a>' +
					'<a href="#" id="btn-show-register" class="button">Register</a>' +
				'</form>' +
            '</div>';
        return html;
    }

    function buildGameUI(nickname) {
        var html = '<span id="user-nickname">' +
				$("<div />").html(nickname).text() +
		'</span>' +
       "<span id='player-score'></span>" +
		'<button id="btn-logout">Logout</button><br/>' +
		'<div id="create-game-holder">' +
			'Title: <input type="text" id="tb-create-title" />' +
			'Password: <input type="text" id="tb-create-pass" />' +
			'<button id="btn-create-game">Create</button>' +
		'</div>' +
		'<div id="open-games-container">' +
			'<h2>Open</h2>' +
			'<div id="open-games"></div>' +
		'</div>' +
		'<div id="active-games-container">' +
			'<h2>Active</h2>' +
			'<div id="active-games"></div>' +
		'</div>' +
		'<div id="game-holder">' +
		'</div>' +
		'<div id="all-msg-container">' +
			'<h2 id="show-messages">Click to see All Messages!!</h2>' +
			'<div id="all-msgs"></div>' +
		'</div>' +
		'<div id="unread-msg-container">' +
			'<h2>Unread Messages</h2>' +
			'<div id="unread-msgs"></div>' +
		'</div>';
        return html;
    }

    function buildOpenGamesList(games) {
        var list = '<ul class="game-list open-games">';
        for (var i = 0; i < games.length; i++) {
            var game = games[i];
            list +=
				'<li data-game-id="' + game.id + '">' +
					'<a href="#" >' +
						$("<div />").html(game.title).text() +
					'</a>' +
					'<span> by ' +
						game.creator +
					'</span>' +
				'</li>';
        }
        list += "</ul>";
        return list;
    }

    function buildActiveGamesList(games) {
        var gamesList = Array.prototype.slice.call(games, 0);
        gamesList.sort(function (g1, g2) {
            if (g1.status == g2.status) {
                return g1.title > g2.title;
            }
            else {
                if (g1.status == "in-progress") {
                    return -1;
                }
            }
            return 1;
        });

        var list = '<ul class="game-list active-games">';
        for (var i = 0; i < gamesList.length; i++) {
            var game = gamesList[i];
            list +=
				'<li data-game-id="' + game.id + '">' +
					'<a href="#" class="' + game.status + '">' +
						$("<div />").html(game.title).text() +
					'</a>' +
					'<span  data-creator="' + game.creator + '"> by ' +
						game.creator +
					'</span>' +
				'</li>';


        }
        list += "</ul>";

        return list;
    }



    function buildTheField(blueUnits, redUnits) {
        var FIELD_SIZE = 9;

        

        var tableHtml = '<table id="field">';
        for (var i = 0; i < FIELD_SIZE; i++) {
            tableHtml += "<tr>";
            for (var j = 0; j < FIELD_SIZE; j++) {
                tableHtml += "<td id='" + i + j + "'>";
                for (var pl = 0; pl < FIELD_SIZE; pl++) {
                    var bluePlayer = blueUnits[pl];
                    var redPlayer = redUnits[pl];

                    if (bluePlayer.position.x == i && bluePlayer.position.y == j) {
                        haveFound = true;
                        if (bluePlayer.type == "warrior") {
                            tableHtml += "W<img src='../imgs/wor.jpg' />" + bluePlayer.id + "";
                        }
                        else if (bluePlayer.type == "ranger") {
                            tableHtml += "R<img src='../imgs/ren.jpg' />" + bluePlayer.id + "";
                        }
                    }
                    else if (redPlayer.position.x == i && redPlayer.position.y == j) {
                        haveFound = true;
                        if (bluePlayer.type == "warrior") {
                            tableHtml += "W<img src='../imgs/wor.jpg' />" + redPlayer.id + "";
                        }
                        else if (bluePlayer.type == "ranger") {
                            tableHtml += "R<img src='../imgs/ren.jpg' />" + redPlayer.id + "";
                        }
                    }

                }
                tableHtml += "</td>";
            }
            tableHtml += "</tr>";
        }
        tableHtml += '</table>';

        return tableHtml; //+ JSON.stringify(blueUnits) + "-------------" + JSON.stringify(redUnits);

        // return JSON.stringify(blueUnits) + "-------------" + JSON.stringify(redUnits);
    }


    function gameField(gameState) {
        var html =
			'<div id="game-state" data-game-id="' + gameState.gameId + '">' +
				'<h2>' + gameState.title + '</h2>' +
                '<h2> Turn to user: ' + gameState.inTurn + '</h2>' +
				'<div id="blue-player" class="guess-holder">' +
					'<h3>' +
						gameState.blue.nickname + ' -blue player' +
					'</h3>' +
				'</div>' +
                "<div >" +
                    buildTheField(gameState.blue.units, gameState.red.units) +
                "</div>" +
				'<div id="red-player" class="guess-holder">' +
					'<h3>' +
						gameState.red.nickname + ' - red -player' +
					'</h3>' +
				'</div>' +
		'</div>';
        return html;
    }

    function appendMakeGuessField(inTurn, inTurnColor, gameState, nickname) {
        if (inTurn == nickname) {
            $("#" + inTurnColor + "-player").append("Select cell with player(00..88)<input type='text' id='selected-cell'/> to cell" +
                                                        "<input type='text' id='destination'/>" +
                                                        "<button id='btn-move'>Move</button>" + 
                                                        "<button id='btn-attack'>Atack</button>" +
                                                        "<button id='btn-attack'>Defend</button>" );
        }
        else {
            $("#" + inTurnColor + "-player").append("It is other player move");
        }

    }

    function appendStartGameButton(nickname) {
        var button = "<button class='btn-start-game'>Start</button>"
        var fullGames = $(".full");

        for (var i = 0; i < fullGames.length; i++) {
            var currentFullGame = $(fullGames[i]);
            if (currentFullGame.next("span").attr("data-creator") == $("<div />").html(nickname).text()) {
                currentFullGame.after(button);
            }
        }

    }

    function buildAllMsgs(msgs) {

        var allMsgs = "";
        for (var i = 0; i < msgs.length; i++) {
            allMsgs += "<span>Massage " + (i + 1) + ": " + msgs[i].text + "! With id: " + msgs[i].gameId + "</span></br>";
        }
        $("#all-msgs").html(allMsgs);
        $("#all-msgs").addClass("hidden");
        $("#all-msgs").hide(2000);
    }

    function buildUnreadMsgs(msgs) {

        var allMsgs = "";
        for (var i = 0; i < msgs.length; i++) {
            allMsgs += "<span>Massage " + (i + 1) + ": " + msgs[i].text + "! With id: " + msgs[i].gameId + "</span></br>";
        }
        $("#unread-msgs").html(allMsgs);
    }

    function appendScoreBoard(scores) {
        scores.sort(function (a, b) { return parseInt(b.score) - parseInt(a.score) });

        $("#wrapper").append("<div id='score-board'></div>");
        var container = "<h1>Wall of fame</h1>";
        container += "<ul>";
        for (var i = 0; i < scores.length; i++) {
            container += "<li><strong> " + scores[i].nickname + "</strong> with scores <strong>" + scores[i].score + "</strong></li>"
        }
        container += "</ul>";
        $("#score-board").html(container);

    }

    return {
        gameUI: buildGameUI,
        openGamesList: buildOpenGamesList,
        loginForm: buildLoginForm,
        activeGamesList: buildActiveGamesList,
        gameField: gameField,
        appendStartGameButton: appendStartGameButton,
        appendMakeGuessField: appendMakeGuessField,
        buildAllMsgs: buildAllMsgs,
        buildUnreadMsgs: buildUnreadMsgs,
        appendScoreBoard: appendScoreBoard
    }

}());