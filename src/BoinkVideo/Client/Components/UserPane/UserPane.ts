class UserPane extends Component {
    private currentPane: HTMLElement;
    
    public attachedCallback(): void {
        super.attachedCallback();
        this.shadowRoot.querySelector(".dimmer").addEventListener("click", (event) => {
            if (event.target == this.shadowRoot.querySelector(".dimmer")) {
                this.dismiss();
            }
        });
        var panes = this.shadowRoot.querySelectorAll(".paneContent");
        for (var i = 0; i < panes.length; i++) {
            panes[i].style.display = "none";
        }
        this.showPane("signin");
        
        this.shadowRoot.querySelector(".registerLink").addEventListener("click", () => {
            this.showPane("register");
        });
        
        Animator.applyAnimation(this.shadowRoot.querySelector(".dimmer"), "animation-dimmer-fade-in", true);
        Animator.applyAnimation(this.shadowRoot.querySelector(".pane"), "animation-pane-enter", true);
    }
    
    public dismiss(): void {
        Animator.applyAnimation(this.shadowRoot.querySelector(".dimmer"), "animation-dimmer-fade-out", false);
        Animator.applyAnimation(this.shadowRoot.querySelector(".pane"), "animation-pane-exit", false, () => {
            this.parentElement.removeChild(this);
        });
    }
    
    public showPane(paneName: string): void {
        if (typeof this.currentPane !== "undefined") {
            Animator.applyAnimation(this.currentPane, "animation-pane-switch-out", true, () => {
                this.currentPane.style.display = "none";
                this.currentPane = <HTMLElement>this.shadowRoot.querySelector(".paneContent." + paneName);
                this.currentPane.style.display = "";
                Animator.applyAnimation(this.currentPane, "animation-pane-switch-in", false);
            });
        } else {
            this.currentPane = <HTMLElement>this.shadowRoot.querySelector(".paneContent." + paneName);
            this.currentPane.style.display = "";
        }
    }
}
Component.register("bv-user-pane", UserPane);
