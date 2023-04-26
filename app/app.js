document.addEventListener('alpine:init', () => {
    Alpine.data('stickies', () => ({
        maxChars: 10,
        stickieIds: [],
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
            "#A3F3B5"
          ],
        async init() {
          const path = window.location.pathname.substring(1);
          console.log(path)
          if (path != "") {
            try {
              let response = await fetch('/api/load/' + path)
              if (!response.ok) throw response.status;
              var loaded = await response.json()
              this.stickieIds = loaded
            
            }
             catch (e) {
              console.log(e)
            }
          } else {
            console.log("init new board")
            try {
                await fetch('/api/init/', {
                    method: 'POST'
                  });
            } 
            catch (e) {
                console.log(e)
            }
          }
        },
        async saveBoard() {
        //placeholder
        return 0;
        },
         changeColor(stickie) {            
              let newColorIndex = stickie.color == this.colors.length - 1 ? 0 : stickie.color + 1;
              console.log(newColorIndex)
              for (let i = 0; i < this.stickieIds.length; i++) {
                if (this.stickieIds[i].id === stickie.id) {
                    this.stickieIds[i].color = newColorIndex;
                  break;
                }
              }
            },
             checkChars(event, sticky) {
                let charCount = sticky.content.split(" ").join("").split("").length;
                if (charCount >= this.maxChars) {
                  if (event.key !== "Backspace" && event.key !== "Delete" && !event.ctrlKey && !event.metaKey && event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                    event.preventDefault();
                  }
                }
              },
            async addStickie(direction) {
                try {
                    newStickie = await fetch('/api/stickie/add/', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({board: this.currBoard})
                      })
                } 
                catch (e) {
                    console.log(e)
                }
                if (direction === "end") {
                    this.stickieIds.push(newStickie)
                } else {
                    this.stickieIds.unshift(newStickie)
                }
                
             }

        }))})   

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            stickies.addStickie("end")
            }
        });