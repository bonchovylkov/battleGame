/// <reference path="class.js" />
/// <reference path="persister.js" />
/// <reference path="jquery-2.0.2.js" />
/// <reference path="ui.js" />

var controllers = (function () {
    var rootUrl = "http://localhost:22954/api/";
	var Controller = Class.create({
		init: function () {
			this.persister = persisters.get(rootUrl);
		},
		loadUI: function (selector) {
			if (this.persister.isUserLoggedIn()) {
				this.loadGameUI(selector);
			}
			else {
				this.loadLoginFormUI(selector);
			}
			this.attachUIEventHandlers(selector);
		},
		loadLoginFormUI: function (selector) {
			var loginFormHtml = ui.loginForm()
			$(selector).html(loginFormHtml);
		},
		loadGameUI: function (selector) {
		    var self = this;
			var list =
				ui.gameUI(this.persister.nickname());
			$(selector).html(list);

			this.updateUI(selector);

		    updateTimer = setInterval(function () {
		    	self.updateUI(selector);
		    }, 15000);

			
		},
		loadGame: function (selector, gameId) {
		    var self = this;
		    this.persister.game.field(gameId, function (gameState) {
		        //$(selector).append(JSON.stringify(gameState));
				var gameHtml = ui.gameField(gameState);
				$(selector + " #game-holder").html(gameHtml);
				var fieldCells = $("td");
				for (var i = 0; i < fieldCells.length; i++) {
				   // $("#wrapper").append($(fieldCells[i]).text());
				    if ($(fieldCells[i]).text().toString().slice(0,1) == "W") {
				        $(fieldCells[i]).attr({ "attack": "8", "armor": "3", "hitPoints": "15", "range": "1", "speed": "2" });
				        
				        //alert("W");
				    }
				    else if ($(fieldCells[i]).text().toString().slice(0, 1) == "R") {
				        $(fieldCells[i]).attr({ "attack": "8", "armor": "1", "hitPoints": "10", "range": "3", "speed": "1" });
				        //alert("R");
				    }
				}


				var inTurn = gameState.inTurn;
				var playerInTurn = gameState[inTurn].nickname;
				ui.appendMakeGuessField(playerInTurn,inTurn, gameState, self.persister.nickname());


			});
		},
		attachUIEventHandlers: function (selector) {
			var wrapper = $(selector);
			var self = this;

			wrapper.on("click", "#btn-show-login", function () {
				wrapper.find(".button.selected").removeClass("selected");
				$(this).addClass("selected");
				wrapper.find("#login-form").show(2000);
				wrapper.find("#register-form").hide(2000);
			});
			wrapper.on("click", "#btn-show-register", function () {
				wrapper.find(".button.selected").removeClass("selected");
				$(this).addClass("selected");
				wrapper.find("#register-form").show(2000);
				wrapper.find("#login-form").hide(2000);
			});

			wrapper.on("click", "#btn-login", function () {
				var user = {
				    username: $("<div />").html($(selector + " #tb-login-username").val()).text(),
				    password: $("<div />").html($(selector + " #tb-login-password").val()).text()
				}

				self.persister.user.login(user, function () {
					self.loadGameUI(selector);
				}, function (err) {
				    alert(err.responseJSON.Message);
				    //wrapper.html("loign eror.." + JSON.stringify(err));
				});
				return false;
			});

		    //$("<div />").html(game.title).text() 
			wrapper.on("click", "#btn-register", function () {
			    var user = {
			        username: $("<div />").html($(selector + " #tb-register-username").val()).text(),
			        nickname: $("<div />").html($(selector + " #tb-register-username").val()).text(),
			        password: $("<div />").html($(selector + " #tb-register-password").val()).text()
			    };
			    self.persister.user.register(user, function () {
			        self.loadGameUI(selector);
			    }, function (err) {
			        alert(err.responseJSON.Message);
			        //wrapper.html("register eror.." + JSON.stringify(err));
			    });
			    return false;
			});
			wrapper.on("click", "#btn-logout", function () {
				self.persister.user.logout(function () {
					self.loadLoginFormUI(selector);
				});
			});

			wrapper.on("click", "#open-games-container a", function () {
				$("#game-join-inputs").remove();
				var html =
					'<div id="game-join-inputs">' +
						'Password: <input type="text" id="tb-game-pass"/>' +
						'<button id="btn-join-game">join</button>' +
					'</div>';
				$(this).after(html);
			});
			wrapper.on("click", "#btn-join-game", function () {
				var game = {
					id: $(this).parents("li").first().data("game-id")
				};

				var password = $("#tb-game-pass").val();

				if (password) {
					game.password = password;
				}
				self.persister.game.join(game, function (data) {
				    alert("join OK" + JSON.stringify(data));
				}, function (err) {
				    alert(JSON.stringify(err))
				});
			});
			wrapper.on("click", "#btn-create-game", function () {
				var game = {
					title: $("#tb-create-title").val(),
				}
				var password = $("#tb-create-pass").val();
				if (password) {
					game.password = password;
				}
				self.persister.game.create(game);
			});

			wrapper.on("click", ".active-games .in-progress", function () {
				self.loadGame(selector, $(this).parent().data("game-id"));
			});
			wrapper.on("click", ".btn-start-game", function () {
			    var gameID = $(this).parent().attr("data-game-id");
			    
			    self.persister.game.start(gameID, function () {
			        alert("game started");
			    }, function () {
			        alert("fail game started");
			    });
			});

            //TODOO
			wrapper.on("click", "#btn-move", function () {

			    var gameId = $("#game-state").attr("data-game-id");
			    var destinationCords = $(this).prev("input#destination").val();
			    var selectedCell = $("#selected-cell").val(); // $("#" + cell);
			    var td = $("#" + selectedCell);
			  

			    var moveParams = {
			        unitId: td.text().slice(1),
			        position: { "x": destinationCords.slice(0, 1), "y": destinationCords.slice(1, 2) }

			    };
			    
			    self.persister.battle.move(moveParams, gameId, function (data) {
	
			        for (var i = 0; i < 9; i++) {
			            for (var j = 0; j < 9; j++) {
			                if (selectedCell==i+j) {
			                    $("#" + i + j).html("");
			                }
			            }
			        }
			        self.loadGame("#wrapper", gameId);
			        
			        alert("unit moved" + JSON.stringify(data));

			    }, function (err) {
			        console.log(JSON.stringify(err));
			        alert(err.responseJSON.Message);
			    })
			});

			wrapper.on("click", "#btn-attack", function () {

			    var gameId = $("#game-state").attr("data-game-id");
			    var destinationCords = $("input#destination").val();
			    var selectedCell = $("#selected-cell").val(); // $("#" + cell);
			    var td = $("#" + selectedCell);


			    var moveParams = {
			        unitId: td.text().slice(1),
			        position: { "x": destinationCords.slice(0, 1), "y": destinationCords.slice(1, 2) }

			    };

			    self.persister.battle.attack(moveParams, gameId, function (data) {

			       
			        for (var i = 0; i < 9; i++) {
			            for (var j = 0; j < 9; j++) {
			                if (selectedCell == i + j) {
			                    $("#" + i + j).html("");
			                }
			            }
			        }
			        self.loadGame("#wrapper", gameId);
			        alert("unit attacked at " + moveParams.position.x + moveParams.position.y);

			    }, function (err) {
			        console.log(JSON.stringify(err));
			        alert(err.responseJSON.Message);
			    })
			});

			wrapper.on("click", "#btn-defend", function () {

			    var gameId = $("#game-state").attr("data-game-id");
			    var destinationCords = $("#destination").val();
			    var selectedCell = $("#selected-cell").val(); // $("#" + cell);
			    var td = $("#" + selectedCell);

			    var defendedUnit = td.text().slice(1);


			    self.persister.battle.move(defendedUnit, gameId, function (data) {

			        self.loadGame("#wrapper", gameId);
			        alert("unit defended " + defendedUnit);

			    }, function (err) {
			        console.log(JSON.stringify(err));
			        alert(err.responseJSON.Message);
			    })
			});

			wrapper.on("click", "#show-messages", function () {
			    var next = $(this).next("div");
			    if (next.hasClass("hidden")) {
			        next.removeClass("hidden");
			        next.addClass("expand");
			        next.show(2000);
			    }
			    else {
			        next.removeClass("expand");
			        next.addClass("hidden");
			        next.hide(2000);
			    }
			    
			});
		},

		updateUI: function (selector) {

	        this.persister.game.open(function (games) {
	            var list = ui.openGamesList(games);
	            $(selector + " #open-games")
					.html(list);
	        });


	        var self = this;
	        this.persister.game.myActive(function (games) {
	            var list = ui.activeGamesList(games);
	            $(selector + " #active-games")
					.html(list);
	            //alert(JSON.stringify(games));
	            ui.appendStartGameButton(self.persister.nickname());
	        });

	        this.persister.massage.all(function (msgs) {
	            //apend then throu ui
	            ui.buildAllMsgs(msgs);

	        }, function (err) {
	           // alert(err.responseJSON.Message);
	        });

	        this.persister.massage.unread(function (msgs) {
	            //apend then throu ui
	            ui.buildUnreadMsgs(msgs);
	            //alert("loaded unread msg" + JSON.stringify(msgs));
	        }, function (err) {
	           // alert(err.responseJSON.Message);
	        });

	        this.persister.user.scores(function (scores) {
	            var currentNickname = self.persister.nickname();
	            var currentScore = "";
	            for (var i = 0; i < scores.length; i++) {
	                if (scores[i].nickname == currentNickname) {
	                    currentScore = scores[i].score;
	                }
	            }
	            $("#player-score").html("  Player Score : "+currentScore);
	            //alert(JSON.stringify(scores));
	            ui.appendScoreBoard(scores);
	        }, function (err) {
	            //alert(err.responseJSON.Message);
	        });
    }

	});
	return {
		get: function () {
			return new Controller();
		}
	}
}());

$(function () {
	var controller = controllers.get();
	controller.loadUI("#content");
	
});