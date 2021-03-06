/**
	Generates a procedural for a level using data from tiles.
	Code by Chao, 2013
*/

Game.LevelLoading = function() {
	this.Width = 320;
	this.Height = 240;
	this.Data = null;
	this.Difficulty = 0;
	this.Type = 0;
};

Game.LevelLoading.prototype = {
	LoadingData: function(){
		var xhr = new XMLHttpRequest();
		var dataUri = "level" + this.Difficulty + ".json";
		var that = this;

		xhr.open("GET", dataUri, false);
		xhr.onload = function(){
			that.Data = JSON.parse(xhr.responseText);
		};
		xhr.send(null);
	},

	CreateLevel: function(type, difficulty) {
		var i, j, xx, yy;
		this.Type = type;
		this.Difficulty = difficulty;

		//this.Data = level1;
		this.LoadingData();
		this.Width = this.Data.width;
		this.Height = this.Data.height;

		//generate a new level data
        level = new Game.Level(this.Width, this.Height);
         //fill level with appointed data
        floor = this.Height - 1 - (Math.random() * 4) | 0;
        level.ExitX = this.Width + 8;
        level.ExitY = floor;

		for(i = 0; i < this.Data.layers.length; ++i){
			var layer = this.Data.layers[i];
			if (layer.type === "tilelayer") {
				var datas = layer.data;
				for(j = 0; j < datas.length; ++j){
					if (datas[j] === 0) continue;

					xx = j % this.Data.width | 0;
					yy = j / this.Data.width | 0;
					level.SetBlock(xx, yy, datas[j] - 1);
				}
			} else if (layer.type === "objectgroup") {
				var objects = this.Data.layers[i].objects;

				if (layer.name === "blocks"){
					for(j = 0; j < objects.length; ++j){
						if (objects[j].properties === null || objects[j].name === ""){
							continue;
						}

						var blockData= {
							"special": Number(objects[j].properties.special),
							"coin": Number(objects[j].properties.coin),
							"isWin": objects[j].properties.isWin !== null,
							"name": objects[j].name
						};

						xx = (objects[j].x / this.Data.tilewidth) | 0;
						yy = (objects[j].y / this.Data.tileheight) | 0;
						level.SetSpriteTemplate(xx, yy, blockData);
					}
				}

				if (layer.name === "enemy"){
					var tileset = this.Data.tilesets[1];
					for(j = 0; j < objects.length; ++j){
						var etype = (objects[j].gid - tileset.firstgid) * tileset.tilewidth / tileset.imagewidth;
						var enemy = new Game.EnemyTemplate(etype, objects[j].type !== "");

						xx = (objects[j].x / tileset.tilewidth) | 0;
						yy = (objects[j].y / tileset.tileheight) | 0 + 1; //hack
						level.SetSpriteTemplate(xx, yy, enemy);
					}
				}
			}
		}

		return level;
	}
};
