var grid = [];
var width = 20;
var height = 15;
var count = 25;

var flag = false;
var flag_dom;
var placed_flags = 0;
var placed_dom;
var hover_dom;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("game-info").classList.add("center");

  let start = document.getElementById("game-start");
  let slider = document.getElementById("game-slider");
  slider.setAttribute("max", `${Math.floor(width * height) / 5}`);

  slider.addEventListener("input", (e) => {
    let difficulty = document.getElementById("game-difficulty");
    difficulty.innerText = `${e.target.value} bombs`;
  });

  start.addEventListener("click", () => {
    document.getElementById("game-info").classList.add("move-in");
    document.getElementById("game-info").classList.remove("center");

    count = slider.value;
    create_grid();

    let container = document.getElementById("game-info");
    container.innerHTML = `
      <div class="warning">
        <i class="fas fa-exclamation-triangle"></i> is not active!
      </div>
      <div class="flags">
      0/${count} placed
      </div>
      <div class="hint">
        Hover for hint.
      </div>
      `;

    placed_dom = document.getElementsByClassName("flags")[0];
    flag_dom = document.getElementsByClassName("warning")[0];
    flag_dom.addEventListener("click", () => {
      flag_dom.classList.toggle("active");
      flag = !flag;
    });

    hover_dom = document.getElementsByClassName("hint")[0];
    hover_dom.addEventListener("mouseover", () => {
      let bombs = document.getElementsByClassName("bomb");
      for (bomb of bombs) {
        bomb.classList.add("active");
      }
    });
    hover_dom.addEventListener("mouseout", () => {
      let bombs = document.getElementsByClassName("bomb");
      for (bomb of bombs) {
        bomb.classList.remove("active");
      }
    });
  });
});

create_grid = () => {
  let container = document.getElementById("game-board");

  for (let i = 0; i < height; i++) {
    let grid_row = [];
    let row = document.createElement("div");
    row.classList.add("board-row");

    for (let j = 0; j < width; j++) {
      let field = document.createElement("div");
      field.classList.add("board-field");
      field.classList.add(`${i}-${j}`);

      field.innerHTML = `<i class="fas fa-bomb"></i>`;
      field.addEventListener("click", field_clicked);
      field.addEventListener("mouseenter", field_mousein);
      field.addEventListener("mouseleave", field_mouseout);
      row.appendChild(field);

      grid_row.push(new Field(field));
    }

    grid.push(grid_row);
    container.appendChild(row);
  }

  for (let i = 0; i < count; i++) {
    create_bombs();
  }

  count_bombs();
};

create_bombs = () => {
  i = Math.floor(Math.random() * height);
  j = Math.floor(Math.random() * width);
  if (grid[i][j].bomb) {
    create_bombs();
  } else {
    grid[i][j].make_bomb();
  }
};

count_bombs = () => {
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (grid[i][j].bomb) {
        continue;
      }

      for (let offset_y = -1; offset_y < 2; offset_y++) {
        for (let offset_x = -1; offset_x < 2; offset_x++) {
          new_i = i + offset_y;
          new_j = j + offset_x;
          if (new_i == 0 && new_j == 0) {
            continue;
          }

          if (new_i > -1 && new_i < height && new_j > -1 && new_j < width) {
            if (grid[new_i][new_j].bomb) {
              grid[i][j].bomb_neighbors++;
            }
          }
        }
      }

      grid[i][j].dom.innerText = grid[i][j].bomb_neighbors;
      grid[i][j].dom.classList.add(`bombs-${grid[i][j].dom.innerText}`);
    }
  }
};

reveal_bombs = () => {
  let bombs = document.getElementsByClassName("bomb");
  for (let bomb of bombs) {
    let position = bomb.classList["1"];
    let y = parseInt(position.split("-")[0]);
    let x = parseInt(position.split("-")[1]);

    grid[y][x].make_active();
  }
};

check_flags = () => {
  let flags = document.getElementsByClassName("flag");
  for (let flag of flags) {
    let position = flag.classList["1"];
    let y = parseInt(position.split("-")[0]);
    let x = parseInt(position.split("-")[1]);

    if (grid[y][x].bomb) {
      flag.style.background = "green";
      flag.classList.add("correct-flag");
    } else {
      flag.style.background = "red";
    }
  }
};

check_result = () => {
  let correct_flags = document.getElementsByClassName("correct-flag");
  let bombs = document.getElementsByClassName("bomb");

  let game_info = document.getElementById("game-info");
  game_info.innerHTML = "";

  let game_result = document.createElement("div");
  game_result.classList.add("game-result");

  if (correct_flags.length == bombs.length) {
    game_result.innerText = "You found all bombs!";
  } else game_result.innerText = "You lost.";

  let game_restart = document.createElement("button");
  game_restart.innerText = "Play Again";
  game_restart.classList.add("game-restart");
  game_restart.addEventListener("click", () => {
    location.reload();
  });

  game_info.appendChild(game_result);
  game_info.appendChild(game_restart);
  disable_clicking();
  disbale_fields();
};

check_win = () => {
  let bombs = document.getElementsByClassName("bomb");
  for (bomb of bombs) {
    let position = bomb.classList["1"];
    let y = parseInt(position.split("-")[0]);
    let x = parseInt(position.split("-")[1]);

    if (!(grid[y][x].bomb && grid[y][x].flagged)) {
      return false;
    }
  }

  return true;
};

activate_neighbors = (field) => {
  let position = field.classList["1"];
  let y = parseInt(position.split("-")[0]);
  let x = parseInt(position.split("-")[1]);

  for (let offset_y = -1; offset_y < 2; offset_y++) {
    for (let offset_x = -1; offset_x < 2; offset_x++) {
      new_i = y + offset_y;
      new_j = x + offset_x;

      if (new_i > -1 && new_i < height && new_j > -1 && new_j < width) {
        if (
          !grid[new_i][new_j].bomb_neighbors &&
          !grid[new_i][new_j].bomb &&
          !grid[new_i][new_j].active
        ) {
          grid[new_i][new_j].make_active();
          activate_neighbors(grid[new_i][new_j].dom);
        } else if (grid[new_i][new_j].bomb_neighbors) {
          grid[new_i][new_j].make_active();
        }
      }
    }
  }
};

highlight_neighbors = (field, highlight) => {
  let position = field.classList["1"];
  let y = parseInt(position.split("-")[0]);
  let x = parseInt(position.split("-")[1]);

  for (let offset_y = -1; offset_y < 2; offset_y++) {
    for (let offset_x = -1; offset_x < 2; offset_x++) {
      new_i = y + offset_y;
      new_j = x + offset_x;

      if (offset_x == 0 && offset_y == 0) {
        continue;
      }

      if (new_i > -1 && new_i < height && new_j > -1 && new_j < width) {
        if (highlight) {
          grid[new_i][new_j].dom.classList.toggle("field-hover");
        } else {
          grid[new_i][new_j].dom.classList.toggle("field-hover");
        }
      }
    }
  }
};

field_clicked = (e) => {
  let field = e.target;
  let position = field.classList["1"];
  let y = parseInt(position.split("-")[0]);
  let x = parseInt(position.split("-")[1]);

  if (flag && !grid[y][x].flagged) {
    field.classList.add("flag");
    field.innerHTML = `<i class="fas fa-exclamation-triangle"><i>`;

    placed_flags++;
    placed_dom.innerText = `${placed_flags}/${count} placed`;

    if (placed_flags == count) {
      end_game();
    }

    grid[y][x].flagged = true;
    if (check_win()) {
      end_game();
    }
    return;
  } else if (grid[y][x].flagged) {
    field.classList.remove("flag");
    field.innerHTML = "";

    placed_flags--;
    placed_dom.innerText = `${placed_flags}/${count} placed`;

    grid[y][x].flagged = false;
    if (grid[y][x].bomb) {
      field.innerHTML = `<i class="fas fa-bomb"><i>`;
    } else {
      field.innerHTML = grid[y][x].bomb_neighbors;
    }
    return;
  }

  if (!field.classList.contains("active")) {
    field.classList.add("active");
  }

  if (grid[y][x].bomb) {
    reveal_bombs();
    check_flags();
    check_result();
    grid[y][x].dom.style.background = "red";
  } else {
    activate_neighbors(field);
  }
};

field_mousein = (e) => {
  let field = e.target;
  highlight_neighbors(field, true);
};

field_mouseout = (e) => {
  let field = e.target;
  highlight_neighbors(field, false);
};

disable_clicking = () => {
  let container = document.getElementById("game-board");
  container.classList.add("no-click");
};

disbale_fields = () => {
  for (i = 0; i < height; i++) {
    for (j = 0; j < width; j++) {
      grid[i][j].dom.style.opacity = "0.8";
      grid[i][j].make_active();
    }
  }
};

end_game = () => {
  reveal_bombs();
  check_flags();
  check_result();
};

Field = function (dom) {
  this.dom = dom;
  this.active = false;
  this.bomb = false;
  this.bomb_neighbors = 0;
  this.flagged = false;

  this.make_active = () => {
    this.dom.classList.add("active");
    this.active = true;
  };

  this.make_bomb = () => {
    this.dom.classList.add("bomb");
    this.bomb = true;
  };
};
