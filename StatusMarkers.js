var StatusMarkers = StatusMarkers || (function() {

	function getPlayerName(playerId) {
		return playerId ? '"' + getObj("player", playerId).get("displayname") + '"' : "gm"
	}

	function isPlayerControlled(graphic) {
		var represents = graphic.get('represents');
		if (!represents) {
			return false;
		}
		var char = getObj('character', represents);
		var controlledby = char.get('controlledby');
		if (!controlledby) {
			return false;
		}
		var playerIds = controlledby.split(',');
		var noGm = playerIds.filter(_.negate(playerIsGM));
		return noGm.length > 0;
	}

	function bar1FilledAmount(graphic) {
		var curHp = graphic.get("bar1_value");
		if (isNaN(curHp)) {
			curHp = 0;
		}
		curHp = Math.max(curHp, 0);
		return curHp / graphic.get("bar1_max");
	}

	function clearHpMarker(graphic) {
		graphic.set('status_yellow', false);
		graphic.set('status_brown', false);
		graphic.set('status_red', false);
		graphic.set('status_dead', false);
	}

	function setHpMarker(graphic, marker) {
		clearHpMarker(graphic);
		graphic.set('status_' + marker, true);
		if (marker === 'dead' && state.PopcornInitiative.handleDeadToken) {
			state.PopcornInitiative.handleDeadToken(graphic);
		}
	}

	function load() {
		on("change:graphic", function(obj) {
			if (isPlayerControlled(obj)) {
				return;
			}

			var bar1Max = obj.get("bar1_max");
			if (!bar1Max || isNaN(bar1Max)) {
				return;
			}

			var bar1Filled = bar1FilledAmount(obj);
			if (bar1Filled === 0) {
				setHpMarker(obj, 'dead');
			} else if (bar1Filled <= (1 / 4)) {
				setHpMarker(obj, 'red');
			} else if (bar1Filled <= (1 / 2)) {
				setHpMarker(obj, 'brown');
			} else if (bar1Filled < 1) {
				setHpMarker(obj, 'yellow');
			} else {
				clearHpMarker(obj);
			}
		});

		log('StatusMarkers loaded');
	}

	return {
		load: load
	};
})();

on('ready', function() {
	StatusMarkers.load();
});