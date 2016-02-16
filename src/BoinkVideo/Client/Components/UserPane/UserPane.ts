class UserPane extends Component {
    public attachedCallback(): void {
        super.attachedCallback();
        this.shadowRoot.querySelector(".dimmer").addEventListener("click", (event) => {
            if (event.target == this.shadowRoot.querySelector(".dimmer")) {
                this.dismiss();
            }
        });
        var registerDiv = this.shadowRoot.querySelector(".register");
        registerDiv.style.display = "none";
        
        Animator.applyAnimation(this.shadowRoot.querySelector(".dimmer"), "animation-dimmer-fade-in", true);
        Animator.applyAnimation(this.shadowRoot.querySelector(".pane"), "animation-pane-enter", true);
    }
    
    public dismiss(): void {
        Animator.applyAnimation(this.shadowRoot.querySelector(".dimmer"), "animation-dimmer-fade-out", false);
        Animator.applyAnimation(this.shadowRoot.querySelector(".pane"), "animation-pane-exit", false, () => {
            this.parentElement.removeChild(this);
        });
    }
}
Component.register("bv-user-pane", UserPane);
