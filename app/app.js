document.addEventListener("alpine:init", () => {
  Alpine.data("stickies", () => ({
    maxChars: 200,
    maxStickies: 8,
    helpText:
      "TAB on last stickie = new stickie (end) \n TAB+SHIFT on first stickie - new stickie (front) \n ALT / option = change color \n '/newboard' = create a new board \n '/deleteboard' = delete board",
    changesMade: false,
    boardStickies: [],
    currBoard: "",
    colors: [
      "#FFD280",
      "#FFD3B5",
      "#FFA3C7",
      "#F3B3D7",
      "#B5B2F3",
      "#A3D7F3",
      "#C7FFA3",
      "#B5F3B2",
      "#F3B5B5",
      "#D7A3F3",
      "#A3F3E7",
      "#B5F3D7",
      "#F3E7A3",
      "#F3B5D7",
      "#A3E7F3",
      "#F3D7B5",
      "#E7F3A3",
      "#D7B5F3",
      "#F3A3A3",
      "#A3F3B5",
    ],
    
    async init(retries = 3, interval = 1000) {
      let path = window.location.pathname.substring(1);
      let attempts = 0;
      while (attempts < retries) {
        try {
          let response = await fetch("/api/board/load/" + path);
          if (!response.ok) throw response.status;
          let loadedBoard = await response.json();
          this.boardStickies = loadedBoard;
          this.currBoard = path;
          break;
        } catch (e) {
          console.log(
            `Attempt ${attempts + 1} failed: ${e}. Retrying in ${interval}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, interval));
          attempts++;
        }
      }
      if (attempts === retries) {
        console.log(`Failed to load board after ${retries} attempts.`);
      }
      this.$nextTick(() => {
        let maxId = Math.max(
          ...this.boardStickies.map((stickie) => stickie.id)
        );
        let maxIdIndex = this.boardStickies.indexOf(
          this.boardStickies.filter((stickie) => stickie.id === maxId)[0]
        );
        this.setFocus(maxIdIndex);
      });
      setInterval(() => {
        this.saveBoard();
      }, 3000);
    },

    async saveBoard() {
      if (this.changesMade == true) {
        try {
          await fetch("/api/board/save/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ stickies: this.boardStickies }),
          });
          this.changesMade = false;
          console.log("Board saved");
        } catch (e) {
          console.log(e);
        }
      }
    },

    changeColor(stickie) {
      let newColorIndex =
        stickie.color == this.colors.length - 1 ? 0 : stickie.color + 1;
      for (let i = 0; i < this.boardStickies.length; i++) {
        if (this.boardStickies[i].id === stickie.id) {
          this.boardStickies[i].color = newColorIndex;
          this.changesMade = true;
          break;
        }
      }
    },
    charCount(stickie) {
      return `${stickie.content.length}/${this.maxChars}`;
    },

    checkChars(event, stickie) {
      this.changesMade = true;
      let charCount = stickie.content.split(" ").join("").split("").length;
      if (charCount >= this.maxChars) {
        if (
          event.key !== "Backspace" &&
          event.key !== "Delete" &&
          !event.ctrlKey &&
          !event.metaKey &&
          event.key !== "ArrowLeft" &&
          event.key !== "ArrowRight" &&
          event.key !== "ArrowUp"
        ) {
          event.preventDefault();
        }
      }
    },

    async parseCommand(stickie) {
      let regex = /^\/(help|newboard|deleteboard)$/;
      const match = stickie.content.match(regex);
      let option = false;
      if (match) {
        option = match[1];
      } else {
        option = false;
      }
      console.log(option);
      switch (option) {
        case "newboard":
          window.location.pathname = "/new";
          break;
        case "deleteboard":
          this.deleteBoard();
          break;
        case "help":
          stickie.content = stickie.content + "\n" + this.helpText;
        default:
          break;
      }
    },

    setFocus(stickieIndex) {
      let StickieDiv =
        this.$refs.stickieContainer.querySelectorAll("div")[stickieIndex];
      let StickieTextarea = StickieDiv.querySelector("textarea");
      StickieTextarea.focus();
    },

    addStickieFront(stickie) {
      if (this.boardStickies.length === this.maxStickies) {
        alert("Maximum of " + this.maxStickies + " stickies reached");
      } else if (this.boardStickies.indexOf(stickie) === 0) {
        this.addStickie("front");
      }
    },

    addStickieEnd(stickie) {
      if (this.boardStickies.length === this.maxStickies) {
        alert("Maximum of " + this.maxStickies + " stickies reached");
      } else if (
        this.boardStickies.indexOf(stickie) ===
        this.boardStickies.length - 1
      ) {
        this.addStickie("end");
      }
    },

    async addStickie(direction) {
      try {
        response = await fetch("/api/stickie/add/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ board: this.currBoard }),
        });
      } catch (e) {
        console.log(e);
      }
      let newStickie = await response.json();
      if (direction === "end") {
        this.boardStickies.push(newStickie);
      } else {
        this.boardStickies.unshift(newStickie);
      }
      this.boardStickies.forEach((stickie) => {
        stickie.position = this.boardStickies.indexOf(stickie);
      });
      this.changesMade = true;
      this.$nextTick(() => {
        this.setFocus(this.boardStickies.indexOf(newStickie));
      });
    },

    async deleteStickie(stickie) {
      let deletedStickieIndex = this.boardStickies.indexOf(stickie);
      //last stickie?
      if (this.boardStickies.length === 1) {
        if (confirm("Do you want to delete the board?")) {
          this.deleteBoard();
        } else {
          return;
        }
      } else {
        let NewFocusIndex =
          deletedStickieIndex === 0 ? 1 : deletedStickieIndex - 1;
        try {
          await fetch("/api/stickie/delete/" + stickie.id, {
            method: "DELETE",
          });
          this.boardStickies.splice(this.boardStickies.indexOf(stickie), 1);
          this.boardStickies.forEach((stickie) => {
            stickie.position = this.boardStickies.indexOf(stickie);
          });
          this.changesMade = true;
          this.setFocus(NewFocusIndex);
        } catch (e) {
          console.log(e);
        }
      }
    },

    async deleteBoard() {
      let path = window.location.pathname.substring(1);
      window.location.pathname = "/delete/" + path;
    },
  }));
});
