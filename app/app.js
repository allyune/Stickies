document.addEventListener('alpine:init', () => {
    Alpine.data('stickies', () => ({
        maxChars: 100,
        changesMade: false,
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
          let response = await fetch('/api/board/load/' + path)
          if (!response.ok) throw response.status;
          let loaded = await response.json()
          this.stickieIds = loaded;
          this.currBoard = path;
          this.$nextTick(() => {
            this.setFocus();
          })
              
          setInterval(() => {
            this.saveBoard();
          }, 3000);
        },
        async saveBoard() {
          if (this.changesMade == true) {
          try {
              await fetch('/api/board/save/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({stickies: this.stickieIds})
            })
            this.changesMade = false;
            console.log("Board saved")
          }
          catch(e) {
            console.log(e)
          }
        }
        },
         changeColor(stickie) { 
              let newColorIndex = stickie.color == this.colors.length - 1 ? 0 : stickie.color + 1;
              for (let i = 0; i < this.stickieIds.length; i++) {
                if (this.stickieIds[i].id === stickie.id) {
                    this.stickieIds[i].color = newColorIndex;
                    this.changesMade = true;
                  break;
                }
              }
            },
            checkChars(event, sticky) {
                this.changesMade = true;
                let charCount = sticky.content.split(" ").join("").split("").length;
                if (charCount >= this.maxChars) {
                  if (event.key !== "Backspace" && event.key !== "Delete" && !event.ctrlKey && !event.metaKey && event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp") {
                    event.preventDefault();
                  }
                }
              },
            setFocus() {
              let newStickieIndex = this.stickieIds.length - 1;
              let newStickieDiv = this.$refs.stickieContainer.querySelectorAll('div')[newStickieIndex];
              let newStickieTextarea = newStickieDiv.querySelector('textarea');
              newStickieTextarea.focus()
            },
            async addStickie(direction) {
                try {
                    response = await fetch('/api/stickie/add/', {
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
                let newStickie = await response.json()
                if (direction === "end") {
                    this.stickieIds.push(newStickie)
                } else {
                    this.stickieIds.unshift(newStickie)
                }
                this.stickieIds.forEach(stickie => {
                  stickie.position = this.stickieIds.indexOf(stickie);
                })
                this.changesMade = true;
                this.$nextTick(() => {
                this.setFocus();
              })},

          async deleteStickie(stickie) {
            try {
               await fetch('/api/stickie/delete/' + stickie.id, {
                method: 'DELETE'
              })
              this.stickieIds.splice(this.stickieIds.indexOf(stickie), 1)
              this.stickieIds.forEach(stickie => {
                  stickie.position = this.stickieIds.indexOf(stickie);
              })
              this.changesMade = true;
              this.setFocus()
            } 
            catch (e) {
              console.log(e)
            } 
          }
          // focusStickie(latestStickie = false) {
          //   console.log(latestStickie)
          //   if (!latestStickie) {
          //     latestStickie = this.stickieIds.reduce((maxStickie, currentStickie) => {
          //       return (currentStickie.id > maxStickie.id) ? currentStickie : maxStickie;
          //     }, this.stickieIds[0]);
          //   }
          //   console.log(latestStickie)
          //   let latestStickieId = `text-${this.stickieIds.indexOf(latestStickie)+1}`
          //   console.log(latestStickieId)
          //   let latestStickieHtml = document.getElementById(latestStickieId)
          //   console.log(latestStickieHtml)
          //   latestStickieHtml.focus()

          // } 

        }))})
        
    