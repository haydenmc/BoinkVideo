class UserPane extends Component {
    public attachedCallback(): void {
        super.attachedCallback();
        var registerDiv = this.shadowRoot.querySelector(".register");
        registerDiv.style.display = "none";
    }
}
Component.register("bv-user-pane", UserPane);
